import { memo, useState } from 'react';
import {
  FiCheck,
  FiClock,
  FiCopy,
  FiEdit2,
  FiMoreVertical,
  FiRefreshCw,
  FiTrash2,
  FiRotateCcw,
} from 'react-icons/fi';
import { formatShortDate } from '../utils/dateHelpers';
import { isOverdue } from '../utils/taskHelpers';

const PRIORITY_STYLES = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const overdue = isOverdue(task);
  const done = task.status === 'Completed';

  return (
    <article
      className={`card group relative p-4 transition-all duration-200 hover:shadow-card ${
        done ? 'opacity-75' : ''
      } ${overdue ? 'ring-1 ring-rose-300 dark:ring-rose-800' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      aria-label={`Task: ${task.title}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            done
              ? 'border-teal-500 bg-teal-500 text-white'
              : 'border-slate-300 hover:border-brand-500 dark:border-slate-600'
          }`}
          onClick={() => (done ? onPending(task.id) : onComplete(task.id))}
          aria-label={done ? 'Mark as pending' : 'Mark as complete'}
        >
          {done && <FiCheck className="text-sm" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-display text-base font-semibold text-slate-900 dark:text-white ${
                done ? 'line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            <div className="relative">
              <button
                type="button"
                className="btn-ghost !px-2 !py-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Task actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <FiMoreVertical />
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1 w-40 animate-scale-in rounded-xl border border-slate-100 bg-white py-1 shadow-card dark:border-slate-700 dark:bg-slate-900">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(task);
                      }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(task.id);
                      }}
                    >
                      <FiCopy /> Duplicate
                    </button>
                    {done ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => {
                          setMenuOpen(false);
                          onPending(task.id);
                        }}
                      >
                        <FiRotateCcw /> Mark Pending
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => {
                          setMenuOpen(false);
                          onComplete(task.id);
                        }}
                      >
                        <FiCheck /> Complete
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(task);
                      }}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-lg px-2 py-1 font-semibold ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {task.category}
            </span>
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium ${
                  overdue
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <FiClock aria-hidden />
                {formatShortDate(task.dueDate)}
                {overdue && ' · Overdue'}
              </span>
            )}
            {task.estimatedTime && (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {task.estimatedTime}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'None' && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-2 py-1 font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <FiRefreshCw aria-hidden /> {task.recurrence}
              </span>
            )}
            {task.timeSlot && (
              <span className="rounded-lg bg-brand-50 px-2 py-1 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {task.timeSlot}
              </span>
            )}
          </div>

          {task.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800/80 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(TaskCard);
