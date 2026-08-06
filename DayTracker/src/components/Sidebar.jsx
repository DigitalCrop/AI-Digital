import { memo } from 'react';
import {
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiHome,
  FiList,
  FiX,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'tasks', label: 'All Tasks', icon: FiList },
  { id: 'planner', label: "Today's Planner", icon: FiClock },
  { id: 'calendar', label: 'Calendar', icon: FiCalendar },
  { id: 'completed', label: 'Completed', icon: FiCheckSquare },
];

function Sidebar({ activePage, onNavigate, open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 lg:justify-start">
          <div>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Day<span className="text-brand-600">Tracker</span>
            </p>
            <p className="text-xs text-slate-500">Daily Task Planner</p>
          </div>
          <button type="button" className="btn-ghost !px-2 lg:hidden" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`nav-link w-full ${activePage === id ? 'nav-link-active' : ''}`}
              onClick={() => {
                onNavigate(id);
                onClose?.();
              }}
              aria-current={activePage === id ? 'page' : undefined}
            >
              <Icon className="text-lg shrink-0" aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4 text-xs text-slate-400 dark:border-slate-800">
          <p>Shortcuts</p>
          <ul className="mt-2 space-y-1">
            <li><kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">Ctrl</kbd>+<kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">N</kbd> New task</li>
            <li><kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">Ctrl</kbd>+<kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">F</kbd> Search</li>
            <li><kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">Ctrl</kbd>+<kbd className="rounded bg-slate-100 px-1 dark:bg-slate-800">S</kbd> Save backup</li>
          </ul>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
