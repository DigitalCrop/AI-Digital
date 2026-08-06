import { memo } from 'react';
import { FiCheckCircle, FiInfo, FiX, FiAlertCircle } from 'react-icons/fi';

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const STYLES = {
  success: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200',
  info: 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200',
};

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || FiInfo;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-card animate-toast ${STYLES[toast.type] || STYLES.info}`}
            role="status"
          >
            <Icon className="mt-0.5 shrink-0 text-lg" aria-hidden />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              className="shrink-0 opacity-70 hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ToastContainer);
