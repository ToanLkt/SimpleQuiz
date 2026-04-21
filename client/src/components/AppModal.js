import { useEffect } from 'react';

const sizeClassMap = {
  md: '',
  lg: 'modal-lg',
  xl: 'modal-xl',
};

const AppModal = ({ show, title, children, footer, onClose, size = 'lg' }) => {
  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, show]);

  if (!show) {
    return null;
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        background: 'rgba(15, 23, 42, 0.42)',
        backdropFilter: 'blur(6px)',
        zIndex: 1060,
      }}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${sizeClassMap[size] || sizeClassMap.lg}`}
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body pt-3">{children}</div>
          {footer && <div className="modal-footer border-0 pt-0">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AppModal;
