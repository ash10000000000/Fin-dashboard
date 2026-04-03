import './Skeleton.css';

export function Skeleton({ className = '', width, height }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  return <div className={`skeleton ${className}`.trim()} style={style} aria-hidden />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="table-skeleton" aria-busy="true" aria-label="Loading table">
      <div className="table-skeleton__head">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`h-${i}`} height={16} className="table-skeleton__cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="table-skeleton__row">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`${r}-${c}`} height={14} className="table-skeleton__cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton height={14} width="40%" />
      <Skeleton height={28} width="70%" className="card-skeleton__value" />
    </div>
  );
}
