import { memo } from 'react';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';

function TasksPage({
  tasks,
  filters,
  sortBy,
  categories,
  onFilterChange,
  onSortChange,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">All Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filter, sort, and manage your full task list.
        </p>
      </header>

      <TaskFilters
        filters={filters}
        sortBy={sortBy}
        categories={categories}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{tasks.length} task{tasks.length === 1 ? '' : 's'} shown</span>
      </div>

      <TaskList
        tasks={tasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onPending={onPending}
        onDuplicate={onDuplicate}
        emptyTitle="No matching tasks"
        emptyMessage="Try adjusting your filters or create a new task."
      />
    </div>
  );
}

export default memo(TasksPage);
