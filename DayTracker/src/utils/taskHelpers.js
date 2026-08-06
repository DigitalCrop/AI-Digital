import { PRIORITY_WEIGHT } from './constants';
import { isPastDate, isToday } from './dateHelpers';

export function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyTask(overrides = {}) {
  return {
    id: generateId(),
    title: '',
    description: '',
    category: 'Personal',
    priority: 'Medium',
    dueDate: '',
    estimatedTime: '',
    tags: [],
    notes: '',
    status: 'Pending',
    planningBucket: 'Today',
    timeSlot: 'Morning',
    recurrence: 'None',
    order: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

export function isOverdue(task) {
  return (
    task.status !== 'Completed' &&
    Boolean(task.dueDate) &&
    isPastDate(task.dueDate)
  );
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const overdue = tasks.filter(isOverdue).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, pending, overdue, percent };
}

export function getProductivityScore(tasks) {
  if (tasks.length === 0) return 0;

  const todayTasks = tasks.filter(
    (t) => isToday(t.dueDate) || (t.completedAt && isToday(t.completedAt.slice(0, 10)))
  );

  if (todayTasks.length === 0) {
    const { percent } = getTaskStats(tasks);
    return percent;
  }

  const completed = todayTasks.filter((t) => t.status === 'Completed').length;
  const overduePenalty = todayTasks.filter(isOverdue).length * 5;
  const base = Math.round((completed / todayTasks.length) * 100);
  return Math.max(0, Math.min(100, base - overduePenalty));
}

export function filterTasks(tasks, filters) {
  const {
    category = 'All',
    priority = 'All',
    status = 'All',
    dueDate = '',
    search = '',
    planningBucket = 'All',
    timeSlot = 'All',
  } = filters;

  return tasks.filter((task) => {
    if (category !== 'All' && task.category !== category) return false;
    if (priority !== 'All' && task.priority !== priority) return false;
    if (status === 'Overdue') {
      if (!isOverdue(task)) return false;
    } else if (status !== 'All' && task.status !== status) {
      return false;
    }
    if (dueDate && task.dueDate !== dueDate) return false;
    if (planningBucket !== 'All' && task.planningBucket !== planningBucket) return false;
    if (timeSlot !== 'All' && task.timeSlot !== timeSlot) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${task.title} ${task.description} ${task.notes} ${(task.tags || []).join(' ')}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortTasks(tasks, sortBy = 'dueDate') {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'dueDate':
      default: {
        if (!a.dueDate && !b.dueDate) return a.order - b.order;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        if (a.dueDate === b.dueDate) return a.order - b.order;
        return a.dueDate.localeCompare(b.dueDate);
      }
    }
  });

  return sorted;
}

/**
 * Validation for new/updated tasks.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTask(task, existingTasks = [], { isEdit = false } = {}) {
  const errors = [];

  if (!task.title?.trim()) {
    errors.push('Title is required.');
  }

  if (!isEdit && task.dueDate && isPastDate(task.dueDate)) {
    errors.push('Due date cannot be in the past for new tasks.');
  }

  if (task.title?.trim() && task.dueDate) {
    const duplicate = existingTasks.find(
      (t) =>
        t.id !== task.id &&
        t.title.trim().toLowerCase() === task.title.trim().toLowerCase() &&
        t.dueDate === task.dueDate
    );
    if (duplicate) {
      errors.push('A task with this title already exists on the same day.');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getNextRecurrenceDate(dueDate, recurrence) {
  if (!dueDate || recurrence === 'None') return null;
  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  if (recurrence === 'Daily') date.setDate(date.getDate() + 1);
  if (recurrence === 'Weekly') date.setDate(date.getDate() + 7);
  if (recurrence === 'Monthly') date.setMonth(date.getMonth() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
