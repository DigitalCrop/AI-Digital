import { memo, useMemo } from 'react';
import { FiInbox } from 'react-icons/fi';
import TaskCard from './TaskCard';

function EmptyState({ title = 'No tasks yet', message = 'Create a task to get started.' }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <span className="mb-4 rounded-2xl bg-brand-50 p-4 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
        <FiInbox className="text-3xl" aria-hidden />
      </span>
      <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

function TaskList({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
  emptyTitle,
  emptyMessage,
  enableDrag = false,
  onReorder,
  dragGroup,
}) {
  const dragState = useMemo(() => ({ fromIndex: null }), []);

  if (!tasks.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  const handleDragStart = (index) => (e) => {
    dragState.fromIndex = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (toIndex) => (e) => {
    e.preventDefault();
    const fromIndex = dragState.fromIndex ?? Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return;
    const next = [...tasks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder?.(next.map((t) => t.id), dragGroup);
    dragState.fromIndex = null;
  };

  return (
    <ul className="space-y-3" aria-label="Task list">
      {tasks.map((task, index) => (
        <li key={task.id} className="animate-fade-in list-none">
          <TaskCard
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onPending={onPending}
            onDuplicate={onDuplicate}
            draggable={enableDrag}
            onDragStart={enableDrag ? handleDragStart(index) : undefined}
            onDragOver={enableDrag ? handleDragOver : undefined}
            onDrop={enableDrag ? handleDrop(index) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

export default memo(TaskList);
