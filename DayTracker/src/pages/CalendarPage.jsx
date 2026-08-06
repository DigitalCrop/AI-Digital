import { memo, useMemo, useState } from 'react';
import Calendar from '../components/Calendar';
import TaskList from '../components/TaskList';
import { formatShortDate, toDateString } from '../utils/dateHelpers';

function CalendarPage({
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onPending,
  onDuplicate,
}) {
  const [selectedDate, setSelectedDate] = useState(toDateString());

  const dayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate === selectedDate)
        .sort((a, b) => a.order - b.order),
    [tasks, selectedDate]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse the month and inspect tasks by due date.
        </p>
      </header>

      <Calendar
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <section aria-labelledby="day-tasks-heading">
        <h2 id="day-tasks-heading" className="mb-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
          Tasks on {formatShortDate(selectedDate)}
        </h2>
        <TaskList
          tasks={dayTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onPending={onPending}
          onDuplicate={onDuplicate}
          emptyTitle="No tasks on this day"
          emptyMessage="Select another date or create a task with this due date."
        />
      </section>
    </div>
  );
}

export default memo(CalendarPage);
