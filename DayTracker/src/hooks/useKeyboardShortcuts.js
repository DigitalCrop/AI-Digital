import { useEffect } from 'react';

/**
 * Register global keyboard shortcuts.
 * Ctrl/Cmd+N → new task
 * Ctrl/Cmd+F → focus search
 * Ctrl/Cmd+S → save / backup
 */
export function useKeyboardShortcuts({ onNewTask, onFocusSearch, onSave }) {
  useEffect(() => {
    const handler = (event) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      const key = event.key.toLowerCase();

      if (key === 'n') {
        event.preventDefault();
        onNewTask?.();
      }
      if (key === 'f') {
        event.preventDefault();
        onFocusSearch?.();
      }
      if (key === 's') {
        event.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNewTask, onFocusSearch, onSave]);
}

export default useKeyboardShortcuts;
