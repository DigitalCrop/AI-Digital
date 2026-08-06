import { memo, useMemo } from 'react';
import { FiCloud, FiMoon, FiSun, FiSunset } from 'react-icons/fi';
import { TIME_SLOTS } from '../utils/constants';
import { toDateString } from '../utils/dateHelpers';
import TaskList from '../components/TaskList';

const SLOT_META = {
  Morning: { icon: FiSun, hint: 'Start strong', color: 'text-amber-500' },
  Afternoon: { icon: FiCloud, hint: 'Deep work', color: 'text-sky-500' },
  Evening: { icon: FiSunset, hint: 'Wrap up', color: 'text-orange-500' },
  Night: { icon: FiMoon, hint: 'Wind down', color: 'text-indigo-400' },
};

function PlannerPage({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
  onReorder,
}) {
  const today = toDateString();

  const bySlot = useMemo(() => {
    const map = Object.fromEntries(TIME_SLOTS.map((s) => [s, []]));
    tasks
      .filter((t) => t.dueDate === today || t.planningBucket === 'Today')
      .sort((a, b) => a.order - b.order)
      .forEach((t) => {
        const slot = TIME_SLOTS.includes(t.timeSlot) ? t.timeSlot : 'Morning';
        map[slot].push(t);
      });
    return map;
  }, [tasks, today]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Today&apos;s Planner
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Schedule tasks into Morning, Afternoon, Evening, and Night. Drag to reorder within a section.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {TIME_SLOTS.map((slot) => {
          const Icon = SLOT_META[slot].icon;
          return (
            <section key={slot} className="card p-4" aria-labelledby={`slot-${slot}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2
                  id={`slot-${slot}`}
                  className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900 dark:text-white"
                >
                  <Icon className={SLOT_META[slot].color} aria-hidden />
                  {slot}
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {SLOT_META[slot].hint} · {bySlot[slot].length}
                </span>
              </div>
              <TaskList
                tasks={bySlot[slot]}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                onPending={onPending}
                onDuplicate={onDuplicate}
                enableDrag
                dragGroup={slot}
                onReorder={onReorder}
                emptyTitle={`No ${slot.toLowerCase()} tasks`}
                emptyMessage="Assign a time slot when creating or editing a task."
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PlannerPage);
