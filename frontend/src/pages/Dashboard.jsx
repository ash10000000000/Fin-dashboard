import './PageLayout.css';
import { Navbar } from '../components/Navbar';
import { SummaryCard } from '../components/SummaryCard';
import { DashboardBarChart } from '../components/Chart';
import { TransactionTable } from '../components/TransactionTable';
import { RoleGate } from '../components/RoleGate';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { useDashboard } from '../hooks/useDashboard';
import { DASHBOARD_RECENT_TRANSACTIONS, USER_ROLES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function DashboardPage() {
  useDocumentTitle('Dashboard — FinanceApp');
  const { loading, error, summary, trends } = useDashboard();

  if (error) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="page-content">
          <p className="muted">Unable to load dashboard.</p>
        </div>
      </>
    );
  }

  const recentRows = (summary?.recentActivity || []).slice(0, DASHBOARD_RECENT_TRANSACTIONS);

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="page-content">
        {loading ? (
          <section className="summary-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </section>
        ) : (
          <section className="summary-grid">
            <SummaryCard
              label="Total Income"
              value={summary?.totalIncome ?? 0}
              valueClassName="summary-card__value--income"
            />
            <SummaryCard
              label="Total Expenses"
              value={summary?.totalExpenses ?? 0}
              valueClassName="summary-card__value--expense"
            />
            <SummaryCard
              label="Net Balance"
              value={summary?.netBalance ?? 0}
              valueClassName="summary-card__value--net"
            />
          </section>
        )}

        <RoleGate roles={[USER_ROLES.ANALYST, USER_ROLES.ADMIN]}>
          {loading ? (
            <div className="chart-skeleton-wrap" aria-busy="true">
              <div className="skeleton chart-skeleton-block" style={{ height: 320 }} />
            </div>
          ) : (
            <DashboardBarChart data={trends} />
          )}
        </RoleGate>

        <section>
          <h2 className="section-title">Recent transactions</h2>
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <TransactionTable rows={recentRows} showActions={false} loading={false} />
          )}
        </section>
      </div>
    </>
  );
}
