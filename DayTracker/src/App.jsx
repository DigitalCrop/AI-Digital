import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import ConfirmationDialog from './components/ConfirmationDialog';
import ToastContainer from './components/ToastContainer';
import { useTasks } from './context/TaskContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useToast } from './hooks/useToast';

const TasksPage = lazy(() => import('./pages/TasksPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CompletedPage = lazy(() => import('./pages/CompletedPage'));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-20 text-sm text-slate-500" role="status">
      Loading…
    </div>
  );
}

export default function App() {
  const {
    tasks,
    visibleTasks,
    categories,
    filters,
    sortBy,
    stats,
    productivityScore,
    streak,
    recentlyCompleted,
    hydrated,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    markPending,
    duplicateTask,
    reorderTasks,
    setFilters,
    setSort,
    addCategory,
    exportTasks,
    importTasks,
    backupData,
    setToastHandler,
  } = useTasks();

  const { toasts, pushToast, dismissToast } = useToast();
  const searchRef = useRef(null);
  const fileInputRef = useRef(null);

  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setToastHandler(pushToast);
  }, [setToastHandler, pushToast]);

  const openNewTask = useCallback(() => {
    setEditingTask(null);
    setFormOpen(true);
  }, []);

  const openEditTask = useCallback((task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const handleSaveShortcut = useCallback(() => {
    backupData();
  }, [backupData]);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  useKeyboardShortcuts({
    onNewTask: openNewTask,
    onFocusSearch: focusSearch,
    onSave: handleSaveShortcut,
  });

  const handleFormSubmit = useCallback(
    (taskData) => {
      if (taskData.id && editingTask) {
        return updateTask(taskData);
      }
      return addTask(taskData);
    },
    [addTask, updateTask, editingTask]
  );

  const handleImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        importTasks(text);
      } catch {
        pushToast({ message: 'Could not read import file', type: 'error' });
      }
      event.target.value = '';
    },
    [importTasks, pushToast]
  );

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteTask]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-2xl bg-brand-500/80" />
          <p className="font-display text-lg font-semibold text-slate-700 dark:text-slate-200">
            Loading DayTracker…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          search={filters.search}
          onSearchChange={(search) => setFilters({ search })}
          onNewTask={openNewTask}
          onExport={exportTasks}
          onImportClick={() => fileInputRef.current?.click()}
          onMenuToggle={() => setSidebarOpen(true)}
          searchRef={searchRef}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
          <Suspense fallback={<PageFallback />}>
            {page === 'dashboard' && (
              <Dashboard
                tasks={tasks}
                stats={stats}
                productivityScore={productivityScore}
                streak={streak.count}
                recentlyCompleted={recentlyCompleted}
                onEdit={openEditTask}
                onDelete={setDeleteTarget}
                onComplete={completeTask}
                onPending={markPending}
                onDuplicate={duplicateTask}
                onNewTask={openNewTask}
              />
            )}
            {page === 'tasks' && (
              <TasksPage
                tasks={visibleTasks}
                filters={filters}
                sortBy={sortBy}
                categories={categories}
                onFilterChange={setFilters}
                onSortChange={setSort}
                onEdit={openEditTask}
                onDelete={setDeleteTarget}
                onComplete={completeTask}
                onPending={markPending}
                onDuplicate={duplicateTask}
              />
            )}
            {page === 'planner' && (
              <PlannerPage
                tasks={tasks}
                onEdit={openEditTask}
                onDelete={setDeleteTarget}
                onComplete={completeTask}
                onPending={markPending}
                onDuplicate={duplicateTask}
                onReorder={reorderTasks}
              />
            )}
            {page === 'calendar' && (
              <CalendarPage
                tasks={tasks}
                onEdit={openEditTask}
                onDelete={setDeleteTarget}
                onComplete={completeTask}
                onPending={markPending}
                onDuplicate={duplicateTask}
              />
            )}
            {page === 'completed' && (
              <CompletedPage
                tasks={tasks}
                onEdit={openEditTask}
                onDelete={setDeleteTarget}
                onComplete={completeTask}
                onPending={markPending}
                onDuplicate={duplicateTask}
              />
            )}
          </Suspense>
        </main>
      </div>

      <TaskForm
        open={formOpen}
        initialTask={editingTask}
        categories={categories}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onAddCategory={addCategory}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        message={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
        aria-hidden
      />
    </div>
  );
}
