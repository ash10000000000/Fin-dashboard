import './Chart.css';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { BAR_CHART_MAX_BAR_SIZE, CHART_AXIS_TICK_COLOR, CHART_GRID_STROKE } from '../constants';

export function DashboardBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="chart-empty">No trend data yet.</p>;
  }

  const tickStyle = { fill: CHART_AXIS_TICK_COLOR, fontSize: 12 };

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
          <XAxis dataKey="label" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="income"
            name="Income"
            fill="var(--color-income)"
            maxBarSize={BAR_CHART_MAX_BAR_SIZE}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="var(--color-expense)"
            maxBarSize={BAR_CHART_MAX_BAR_SIZE}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
