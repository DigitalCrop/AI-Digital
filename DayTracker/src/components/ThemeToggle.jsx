import { memo } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTasks } from '../context/TaskContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTasks();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-ghost !px-3"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
    </button>
  );
}

export default memo(ThemeToggle);
