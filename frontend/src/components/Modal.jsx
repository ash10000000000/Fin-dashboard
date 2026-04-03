import './Modal.css';
import { MODAL_Z_INDEX } from '../constants';

export function Modal({ title, isOpen, onClose, children, footer }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-root" style={{ zIndex: MODAL_Z_INDEX }}>
      <button type="button" className="modal-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
