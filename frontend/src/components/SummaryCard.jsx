import './SummaryCard.css';
import { formatCurrency } from '../utils/formatters';

export function SummaryCard({ label, value, valueClassName }) {
  return (
    <article className="summary-card">
      <h3 className="summary-card__label">{label}</h3>
      <p className={`summary-card__value ${valueClassName || ''}`}>{formatCurrency(value)}</p>
    </article>
  );
}
