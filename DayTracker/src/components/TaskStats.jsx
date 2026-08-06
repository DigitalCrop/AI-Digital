import { memo } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiList,
} from 'react-icons/fi';
import ProgressBar from './ProgressBar';

const STAT_CARDS = [
  { key: 'total', label: 'Total Tasks', icon: FiList, color: 'text-brand-600 bg-brand-50 dark:bg-brand-950' },
  { key: 'pending', label: 'Pending', icon: FiClock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
  { key: 'completed', label: 'Completed', icon: FiCheckCircle, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950' },
  { key: 'overdue', label: 'Overdue', icon: FiAlertCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950' },
];

function TaskStats({ stats, productivityScore = 0, streak = 0 }) {
  return (
    <section className="space-y-4" aria-label="Task statistics">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <article key={key} className="card animate-fade-in p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon className="text-lg" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {stats[key] ?? 0}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="card p-4 md:col-span-2">
          <ProgressBar percent={stats.percent} label="Completion" />
        </div>
        <div className="card flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Productivity</p>
            <p className="font-display text-2xl font-bold text-brand-600">{productivityScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Streak</p>
            <p className="font-display text-2xl font-bold text-teal-600">{streak}d</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(TaskStats);
