import { memo, useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

function ConfirmationDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div className="card relative z-10 w-full max-w-md animate-scale-in p-6 shadow-card">
        <button
          type="button"
          className="btn-ghost absolute right-3 top-3 !px-2 !py-2"
          onClick={onCancel}
          aria-label="Close"
        >
          <FiX />
        </button>
        <div className="mb-4 flex items-start gap-3">
          {danger && (
            <span className="mt-0.5 rounded-xl bg-rose-100 p-2 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <FiAlertTriangle className="text-xl" aria-hidden />
            </span>
          )}
          <div>
            <h2 id="confirm-title" className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ConfirmationDialog);
