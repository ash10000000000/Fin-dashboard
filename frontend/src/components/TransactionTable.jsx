import './TransactionTable.css';
import { formatSignedCurrencyForTable } from '../utils/formatters';

export function TransactionTable({ rows, showActions, onEdit, onDelete, loading }) {
  const colSpan = showActions ? 6 : 5;

  if (loading) {
    return null;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Type</th>
            <th className="data-table__num">Amount</th>
            <th>Notes</th>
            {showActions ? <th className="data-table__actions-col">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="data-table__empty">
                <strong>No rows to show.</strong>
                <span className="data-table__empty-hint">
                  Adjust filters or add a record to see data here.
                </span>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.category}</td>
                <td>
                  <span className={`type-badge type-badge--${row.type}`}>{row.type}</span>
                </td>
                <td
                  className={`data-table__num data-table__amount data-table__amount--${row.type}`}
                >
                  {formatSignedCurrencyForTable(row.amount, row.type)}
                </td>
                <td>{row.notes || '—'}</td>
                {showActions ? (
                  <td className="data-table__actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Edit record"
                      onClick={() => onEdit?.(row)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      aria-label="Delete record"
                      onClick={() => onDelete?.(row)}
                    >
                      🗑
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
