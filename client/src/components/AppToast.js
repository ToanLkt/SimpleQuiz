import { useEffect, useState } from 'react';

const variantClassMap = {
  danger: 'text-bg-danger',
  success: 'text-bg-success',
  warning: 'text-bg-warning',
  info: 'text-bg-info',
};

const AppToast = ({
  message,
  title,
  variant = 'danger',
  duration = 4500,
  onClose,
  position = 'top-end',
}) => {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);
    const timeoutId = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, message, onClose]);

  if (!message || !visible) {
    return null;
  }

  const positionClass =
    position === 'bottom-end'
      ? 'bottom-0 end-0'
      : position === 'bottom-start'
        ? 'bottom-0 start-0'
        : position === 'top-start'
          ? 'top-0 start-0'
          : 'top-0 end-0';
  const variantClass = variantClassMap[variant] || variantClassMap.danger;
  const closeClass = variant === 'warning' || variant === 'info' ? '' : 'btn-close-white';

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`toast-container position-fixed ${positionClass} p-3`} style={{ zIndex: 1080 }}>
      <div className={`toast show border-0 ${variantClass}`} role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body">
            {title && <div className="fw-semibold mb-1">{title}</div>}
            <div>{message}</div>
          </div>
          <button
            type="button"
            className={`btn-close me-2 m-auto ${closeClass}`.trim()}
            aria-label="Close"
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default AppToast;
