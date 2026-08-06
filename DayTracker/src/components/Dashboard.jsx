import { memo, useMemo } from 'react';
import { FiPlus } from 'react-icons/fi';
import { formatDisplayDate, getGreeting, toDateString } from '../utils/dateHelpers';
import TaskStats from './TaskStats';
import TaskList from './TaskList';
import ProgressBar from './ProgressBar';

function Dashboard({
  tasks,
  stats,
  productivityScore,
  streak,
  recentlyCompleted,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
  onNewTask,
}) {
  const today = toDateString();
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === today && t.status !== 'Completed'),
    [tasks, today]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-teal-600 p-6 text-white shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.2), transparent 35%)',
          }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-100">{formatDisplayDate()}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {getGreeting()}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-brand-50/90">
              Plan your day with clarity. You have {stats.pending} pending
              {stats.overdue > 0 ? ` and ${stats.overdue} overdue` : ''} tasks.
            </p>
          </div>
          <button type="button" className="btn bg-white text-brand-700 hover:bg-brand-50" onClick={onNewTask}>
            <FiPlus /> Add Task
          </button>
        </div>
        <div className="relative mt-6 max-w-md">
          <div className="[&_.text-slate-600]:text-brand-100 [&_.text-brand-600]:text-white [&_.bg-slate-100]:bg-white/20">
            <ProgressBar percent={stats.percent} label="Completion" showLabel />
          </div>
        </div>
      </header>

      <TaskStats
        stats={stats}
        productivityScore={productivityScore}
        streak={streak}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3" aria-labelledby="today-focus-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="today-focus-heading" className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Today&apos;s Focus
            </h2>
            <span className="text-sm text-slate-500">{todayTasks.length} open</span>
          </div>
          <TaskList
            tasks={todayTasks}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onPending={onPending}
            onDuplicate={onDuplicate}
            emptyTitle="Nothing scheduled for today"
            emptyMessage="Add a task or move something into today's plan."
          />
        </section>

        <section className="lg:col-span-2" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
            Recently Completed
          </h2>
          {recentlyCompleted.length === 0 ? (
            <div className="card px-4 py-10 text-center text-sm text-slate-500">
              Complete a task to build your streak.
            </div>
          ) : (
            <ul className="space-y-2">
              {recentlyCompleted.map((task) => (
                <li key={task.id} className="card flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.category}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    Done
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default memo(Dashboard);
