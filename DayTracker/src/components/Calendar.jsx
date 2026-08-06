import { memo, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getMonthMatrix, toDateString } from '../utils/dateHelpers';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Calendar({ tasks = [], onSelectDate, selectedDate }) {
  const today = toDateString();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const cells = useMemo(
    () => getMonthMatrix(cursor.year, cursor.month),
    [cursor.year, cursor.month]
  );

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      if (!map[task.dueDate]) map[task.dueDate] = [];
      map[task.dueDate].push(task);
    });
    return map;
  }, [tasks]);

  const monthLabel = new Date(cursor.year, cursor.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = (delta) => {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <section className="card animate-fade-in p-4 sm:p-5" aria-label="Monthly calendar">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          {monthLabel}
        </h2>
        <div className="flex gap-1">
          <button type="button" className="btn-ghost !px-2" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className="btn-secondary !px-3 !py-1.5 text-xs"
            onClick={() => {
              const now = new Date();
              setCursor({ year: now.getFullYear(), month: now.getMonth() });
              onSelectDate?.(today);
            }}
          >
            Today
          </button>
          <button type="button" className="btn-ghost !px-2" onClick={() => shiftMonth(1)} aria-label="Next month">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} className="min-h-[72px] rounded-xl" />;
          }
          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate?.(dateStr)}
              className={`min-h-[72px] rounded-xl border p-1.5 text-left transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/60 dark:hover:bg-brand-950/40 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950'
                  : 'border-transparent bg-slate-50/80 dark:bg-slate-800/40'
              }`}
              aria-label={`${dateStr}, ${dayTasks.length} tasks`}
              aria-pressed={isSelected}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {Number(dateStr.slice(-2))}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                      task.status === 'Completed'
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                        : task.priority === 'High'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <p className="px-1 text-[10px] text-slate-400">+{dayTasks.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default memo(Calendar);
