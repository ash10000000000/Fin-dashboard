import './FullPageSpinner.css';

export function FullPageSpinner({ message = 'Loading…' }) {
  return (
    <div className="full-page-spinner">
      <div className="full-page-spinner__ring" aria-hidden />
      <p className="full-page-spinner__text">{message}</p>
    </div>
  );
}
