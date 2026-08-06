import { memo } from 'react';
import {
  FiDownload,
  FiMenu,
  FiPlus,
  FiUpload,
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

function Navbar({
  search,
  onSearchChange,
  onNewTask,
  onExport,
  onImportClick,
  onMenuToggle,
  searchRef,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          className="btn-ghost !px-2 lg:hidden"
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="hidden min-w-0 sm:block">
          <p className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Day<span className="text-brand-600">Tracker</span>
          </p>
        </div>

        <div className="flex-1">
          <SearchBar
            ref={searchRef}
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="btn-ghost !px-2"
            onClick={onExport}
            aria-label="Export tasks as JSON"
            title="Export (backup)"
          >
            <FiDownload />
          </button>
          <button
            type="button"
            className="btn-ghost !px-2"
            onClick={onImportClick}
            aria-label="Import tasks from JSON"
            title="Import"
          >
            <FiUpload />
          </button>
          <ThemeToggle />
          <button type="button" className="btn-primary !px-3 sm:!px-4" onClick={onNewTask}>
            <FiPlus />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
