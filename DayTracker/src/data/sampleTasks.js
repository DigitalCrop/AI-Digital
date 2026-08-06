import { createEmptyTask } from '../utils/taskHelpers';
import { toDateString, addDays } from '../utils/dateHelpers';

const today = toDateString();
const tomorrow = addDays(today, 1);
const nextWeek = addDays(today, 5);

/**
 * Sample seed data shown on first visit.
 */
export const sampleTasks = [
  createEmptyTask({
    title: 'Morning standup notes',
    description: 'Capture blockers and priorities for the team standup.',
    category: 'Office',
    priority: 'High',
    dueDate: today,
    estimatedTime: '30m',
    tags: ['work', 'meeting'],
    notes: 'Keep updates under 2 minutes.',
    planningBucket: 'Today',
    timeSlot: 'Morning',
    order: 1,
  }),
  createEmptyTask({
    title: 'React performance review',
    description: 'Audit memoization and lazy-loaded routes in DayTracker.',
    category: 'Learning',
    priority: 'Medium',
    dueDate: today,
    estimatedTime: '1h',
    tags: ['react', 'study'],
    notes: 'Focus on Context + selectors.',
    planningBucket: 'Today',
    timeSlot: 'Afternoon',
    order: 2,
  }),
  createEmptyTask({
    title: 'Evening stretch routine',
    description: '10-minute mobility session after work.',
    category: 'Health',
    priority: 'Low',
    dueDate: today,
    estimatedTime: '15m',
    tags: ['wellness'],
    planningBucket: 'Today',
    timeSlot: 'Evening',
    recurrence: 'Daily',
    order: 3,
  }),
  createEmptyTask({
    title: 'Grocery run',
    description: 'Pick up vegetables, milk, and coffee beans.',
    category: 'Shopping',
    priority: 'Medium',
    dueDate: tomorrow,
    estimatedTime: '45m',
    tags: ['errands'],
    planningBucket: 'Tomorrow',
    timeSlot: 'Morning',
    order: 4,
  }),
  createEmptyTask({
    title: 'Budget check-in',
    description: 'Review subscriptions and monthly savings goal.',
    category: 'Finance',
    priority: 'High',
    dueDate: tomorrow,
    estimatedTime: '40m',
    tags: ['money'],
    planningBucket: 'Tomorrow',
    timeSlot: 'Evening',
    order: 5,
  }),
  createEmptyTask({
    title: 'Family dinner planning',
    description: 'Choose recipes and assign shopping items.',
    category: 'Family',
    priority: 'Medium',
    dueDate: nextWeek,
    estimatedTime: '20m',
    tags: ['home'],
    planningBucket: 'This Week',
    timeSlot: 'Night',
    order: 6,
  }),
  createEmptyTask({
    title: 'Read design system articles',
    description: 'Collect patterns for dashboard layouts.',
    category: 'Learning',
    priority: 'Low',
    dueDate: '',
    estimatedTime: '1h',
    tags: ['reading'],
    planningBucket: 'Someday',
    timeSlot: 'Afternoon',
    order: 7,
  }),
  createEmptyTask({
    title: 'Ship weekly status email',
    description: 'Summarize wins, risks, and next steps.',
    category: 'Office',
    priority: 'High',
    dueDate: addDays(today, -1),
    estimatedTime: '25m',
    tags: ['communication'],
    planningBucket: 'Today',
    timeSlot: 'Morning',
    status: 'Pending',
    order: 8,
  }),
];

export default sampleTasks;
