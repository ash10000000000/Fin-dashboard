import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listRecords } from '../api/records';
import { fetchSummary, fetchTrends } from '../api/dashboard';
import {
  DASHBOARD_RECENT_TRANSACTIONS,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
} from '../constants';

const VIEWER_ROLE = 'viewer';

async function fetchAllRecordsAggregated() {
  const collected = [];
  let page = PAGINATION_DEFAULT_PAGE;
  let totalPages = 1;
  do {
    const res = await listRecords({
      page,
      limit: PAGINATION_MAX_LIMIT,
    });
    const payload = res.data;
    collected.push(...payload.data);
    totalPages = payload.totalPages;
    page += 1;
  } while (page <= totalPages);
  return collected;
}

function buildViewerSummary(records) {
  let income = 0;
  let expenses = 0;
  for (const r of records) {
    if (r.type === 'income') income += r.amount;
    else expenses += r.amount;
  }
  const recentActivity = [...records]
    .sort((a, b) => {
      const d = b.date.localeCompare(a.date);
      if (d !== 0) return d;
      return b.id - a.id;
    })
    .slice(0, DASHBOARD_RECENT_TRANSACTIONS);
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
    totalRecords: records.length,
    recentActivity,
  };
}

export function useDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);

  const load = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setTrends(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (user.role === VIEWER_ROLE) {
        const records = await fetchAllRecordsAggregated();
        setSummary(buildViewerSummary(records));
        setTrends(null);
      } else {
        const [sumRes, trendRes] = await Promise.all([
          fetchSummary(),
          fetchTrends('monthly'),
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
      }
    } catch (e) {
      setError(e);
      setSummary(null);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    error,
    summary,
    trends,
    reload: load,
    recordsPageSize: PAGINATION_DEFAULT_LIMIT,
  };
}
