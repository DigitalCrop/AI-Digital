/**
 * Date helpers for planning buckets, overdue checks, and calendar views.
 */

export function toDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return 'No date';
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function isPastDate(dateStr) {
  if (!dateStr) return false;
  const today = toDateString();
  return dateStr < today;
}

export function isToday(dateStr) {
  return dateStr === toDateString();
}

export function addDays(dateStr, days) {
  const d = parseDate(dateStr) || new Date();
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  return toDateString(d);
}

export function endOfWeek(date = new Date()) {
  return addDays(startOfWeek(date), 6);
}

export function getPlanningDueDate(bucket) {
  const today = toDateString();
  switch (bucket) {
    case 'Today':
      return today;
    case 'Tomorrow':
      return addDays(today, 1);
    case 'This Week':
      return endOfWeek();
    case 'Next Week':
      return addDays(endOfWeek(), 7);
    case 'Someday':
    default:
      return '';
  }
}

export function matchesPlanningBucket(task, bucket) {
  const due = task.dueDate;
  const today = toDateString();

  switch (bucket) {
    case 'Today':
      return due === today;
    case 'Tomorrow':
      return due === addDays(today, 1);
    case 'This Week': {
      if (!due) return false;
      const start = startOfWeek();
      const end = endOfWeek();
      return due >= start && due <= end;
    }
    case 'Next Week': {
      if (!due) return false;
      const nextStart = addDays(endOfWeek(), 1);
      const nextEnd = addDays(nextStart, 6);
      return due >= nextStart && due <= nextEnd;
    }
    case 'Someday':
      return !due;
    default:
      return true;
  }
}

export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(toDateString(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function getTimeSlotFromHour(hour = new Date().getHours()) {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}
