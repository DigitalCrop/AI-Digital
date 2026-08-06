import { useCallback, useState } from 'react';

/**
 * Simple toast queue for transient notifications.
 */
export function useToast(duration = 2800) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback(
    ({ message, type = 'success' }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration]
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}

export default useToast;
