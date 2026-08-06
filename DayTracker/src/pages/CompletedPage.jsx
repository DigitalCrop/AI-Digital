import { memo, useMemo } from 'react';
import TaskList from '../components/TaskList';

function CompletedPage({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
}) {
  const completed = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status === 'Completed')
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)),
    [tasks]
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Recently Completed
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review finished work and reopen anything that needs another pass.
        </p>
      </header>

      <TaskList
        tasks={completed}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onPending={onPending}
        onDuplicate={onDuplicate}
        emptyTitle="No completed tasks yet"
        emptyMessage="Mark a task complete to see it here."
      />
    </div>
  );
}

export default memo(CompletedPage);
