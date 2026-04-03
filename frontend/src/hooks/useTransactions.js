import { useCallback, useEffect, useRef, useState } from 'react';
import { listRecords } from '../api/records';
import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
} from '../constants';

const initialDraftFilters = {
  type: '',
  category: '',
  date_from: '',
  date_to: '',
  search: '',
};

function buildParams(appliedFilters, pageValue, limitValue) {
  const params = {
    page: pageValue,
    limit: limitValue,
  };
  if (appliedFilters.type) params.type = appliedFilters.type;
  if (appliedFilters.category) params.category = appliedFilters.category;
  if (appliedFilters.date_from) params.date_from = appliedFilters.date_from;
  if (appliedFilters.date_to) params.date_to = appliedFilters.date_to;
  if (appliedFilters.search) params.search = appliedFilters.search;
  return params;
}

export function useTransactions() {
  const [draftFilters, setDraftFilters] = useState(initialDraftFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialDraftFilters);
  const [page, setPage] = useState(PAGINATION_DEFAULT_PAGE);
  const [limit, setLimit] = useState(PAGINATION_DEFAULT_LIMIT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const draftFiltersRef = useRef(initialDraftFilters);
  const appliedFiltersRef = useRef(initialDraftFilters);

  useEffect(() => {
    draftFiltersRef.current = draftFilters;
  }, [draftFilters]);

  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  const runQuery = useCallback(
    async (pageValue, limitValue, filters) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listRecords(buildParams(filters, pageValue, limitValue));
        setResult(res.data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const applyFilters = useCallback(() => {
    const snapshot = { ...draftFiltersRef.current };
    appliedFiltersRef.current = snapshot;
    setAppliedFilters(snapshot);
    setPage(PAGINATION_DEFAULT_PAGE);
    return runQuery(PAGINATION_DEFAULT_PAGE, limit, snapshot);
  }, [limit, runQuery]);

  const goToPage = useCallback(
    (nextPage) => {
      setPage(nextPage);
      return runQuery(nextPage, limit, appliedFiltersRef.current);
    },
    [limit, runQuery]
  );

  const changeLimit = useCallback(
    (nextLimit) => {
      const boundedRaw = Number(nextLimit);
      const bounded = Number.isFinite(boundedRaw)
        ? Math.min(Math.max(1, boundedRaw), PAGINATION_MAX_LIMIT)
        : PAGINATION_DEFAULT_LIMIT;
      setLimit(bounded);
      setPage(PAGINATION_DEFAULT_PAGE);
      return runQuery(PAGINATION_DEFAULT_PAGE, bounded, appliedFiltersRef.current);
    },
    [runQuery]
  );

  const init = useCallback(() => {
    draftFiltersRef.current = { ...initialDraftFilters };
    appliedFiltersRef.current = { ...initialDraftFilters };
    setDraftFilters(initialDraftFilters);
    setAppliedFilters(initialDraftFilters);
    setLimit(PAGINATION_DEFAULT_LIMIT);
    setPage(PAGINATION_DEFAULT_PAGE);
    return runQuery(PAGINATION_DEFAULT_PAGE, PAGINATION_DEFAULT_LIMIT, initialDraftFilters);
  }, [runQuery]);

  const reload = useCallback(() => {
    return runQuery(page, limit, appliedFiltersRef.current);
  }, [runQuery, page, limit]);

  return {
    draftFilters,
    setDraftFilters,
    appliedFilters,
    page,
    limit,
    loading,
    error,
    result,
    applyFilters,
    goToPage,
    changeLimit,
    init,
    reload,
  };
}
