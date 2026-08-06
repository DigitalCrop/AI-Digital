export const PRIORITIES = ['High', 'Medium', 'Low'];

export const STATUSES = ['Pending', 'Completed'];

export const PLANNING_BUCKETS = [
  'Today',
  'Tomorrow',
  'This Week',
  'Next Week',
  'Someday',
];

export const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export const RECURRENCE_OPTIONS = ['None', 'Daily', 'Weekly', 'Monthly'];

export const DEFAULT_CATEGORIES = [
  'Office',
  'Learning',
  'Family',
  'Health',
  'Finance',
  'Personal',
  'Shopping',
];

export const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Recently Created' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

export const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

export const STORAGE_KEYS = {
  TASKS: 'daytracker_tasks',
  CATEGORIES: 'daytracker_categories',
  THEME: 'daytracker_theme',
  STREAK: 'daytracker_streak',
  BACKUP: 'daytracker_backup',
};
