import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { toDateString, addDays } from '../utils/dateHelpers';
import {
  createEmptyTask,
  filterTasks,
  getNextRecurrenceDate,
  getProductivityScore,
  getTaskStats,
  sortTasks,
  validateTask,
} from '../utils/taskHelpers';
import LocalStorageService from '../services/localStorage';
import { sampleTasks } from '../data/sampleTasks';
import {
  ACTION_TYPES,
  initialState,
  taskReducer,
} from './taskReducer';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const toastRef = useRef(null);

  const setToastHandler = useCallback((handler) => {
    toastRef.current = handler;
  }, []);

  const notify = useCallback((message, type = 'success') => {
    toastRef.current?.({ message, type });
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedTasks = LocalStorageService.loadTasks();
    const storedCategories = LocalStorageService.loadCategories();
    const theme = LocalStorageService.loadTheme();
    const streak = LocalStorageService.loadStreak();

    dispatch({
      type: ACTION_TYPES.HYDRATE,
      payload: {
        tasks: storedTasks?.length ? storedTasks : sampleTasks,
        categories: storedCategories?.length ? storedCategories : DEFAULT_CATEGORIES,
        theme,
        streak,
      },
    });
  }, []);

  // Persist tasks & categories
  useEffect(() => {
    if (!state.hydrated) return;
    LocalStorageService.saveTasks(state.tasks);
    LocalStorageService.saveCategories(state.categories);
  }, [state.tasks, state.categories, state.hydrated]);

  // Theme class on <html>
  useEffect(() => {
    if (!state.hydrated) return;
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    LocalStorageService.saveTheme(state.theme);
  }, [state.theme, state.hydrated]);

  // Streak: update when a task is completed today
  useEffect(() => {
    if (!state.hydrated) return;
    const today = toDateString();
    const completedToday = state.tasks.some(
      (t) => t.status === 'Completed' && t.completedAt?.startsWith(today)
    );
    if (!completedToday) return;

    const { count, lastDate } = state.streak;
    if (lastDate === today) return;

    let nextCount = 1;
    if (lastDate === addDays(today, -1)) nextCount = count + 1;
    else if (lastDate) nextCount = 1;

    const next = { count: nextCount, lastDate: today };
    dispatch({ type: ACTION_TYPES.SET_STREAK, payload: next });
    LocalStorageService.saveStreak(next);
  }, [state.tasks, state.hydrated, state.streak]);

  const addTask = useCallback(
    (taskData) => {
      const task = createEmptyTask(taskData);
      const { valid, errors } = validateTask(task, state.tasks, { isEdit: false });
      if (!valid) {
        notify(errors[0], 'error');
        return { ok: false, errors };
      }
      dispatch({ type: ACTION_TYPES.ADD_TASK, payload: task });
      notify('Task created');
      return { ok: true, task };
    },
    [state.tasks, notify]
  );

  const updateTask = useCallback(
    (taskData) => {
      const { valid, errors } = validateTask(taskData, state.tasks, { isEdit: true });
      if (!valid) {
        notify(errors[0], 'error');
        return { ok: false, errors };
      }
      dispatch({ type: ACTION_TYPES.UPDATE_TASK, payload: taskData });
      notify('Task updated');
      return { ok: true };
    },
    [state.tasks, notify]
  );

  const deleteTask = useCallback(
    (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_TASK, payload: id });
      notify('Task deleted');
    },
    [notify]
  );

  const completeTask = useCallback(
    (id) => {
      const task = state.tasks.find((t) => t.id === id);
      dispatch({ type: ACTION_TYPES.COMPLETE_TASK, payload: id });

      // Spawn next occurrence for recurring tasks
      if (task && task.recurrence && task.recurrence !== 'None') {
        const nextDue = getNextRecurrenceDate(task.dueDate || toDateString(), task.recurrence);
        if (nextDue) {
          const next = createEmptyTask({
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            tags: [...(task.tags || [])],
            notes: task.notes,
            planningBucket: task.planningBucket,
            timeSlot: task.timeSlot,
            recurrence: task.recurrence,
            dueDate: nextDue,
            status: 'Pending',
            completedAt: null,
            order: Date.now(),
          });
          dispatch({ type: ACTION_TYPES.ADD_TASK, payload: next });
        }
      }

      notify('Task completed');
    },
    [state.tasks, notify]
  );

  const markPending = useCallback(
    (id) => {
      dispatch({ type: ACTION_TYPES.MARK_PENDING, payload: id });
      notify('Marked as pending');
    },
    [notify]
  );

  const duplicateTask = useCallback(
    (id) => {
      dispatch({ type: ACTION_TYPES.DUPLICATE_TASK, payload: id });
      notify('Task duplicated');
    },
    [notify]
  );

  const reorderTasks = useCallback((orderedIds, timeSlot) => {
    dispatch({
      type: ACTION_TYPES.REORDER_TASK,
      payload: { orderedIds, timeSlot },
    });
  }, []);

  const setFilters = useCallback((partial) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: partial });
  }, []);

  const setSort = useCallback((sortBy) => {
    dispatch({ type: ACTION_TYPES.SET_SORT, payload: sortBy });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.SET_THEME,
      payload: state.theme === 'dark' ? 'light' : 'dark',
    });
  }, [state.theme]);

  const addCategory = useCallback(
    (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      dispatch({ type: ACTION_TYPES.ADD_CATEGORY, payload: trimmed });
      notify(`Category "${trimmed}" added`);
    },
    [notify]
  );

  const exportTasks = useCallback(() => {
    const data = LocalStorageService.exportJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daytracker-backup-${toDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Data exported');
    return data;
  }, [notify]);

  const importTasks = useCallback(
    (json) => {
      try {
        const data = LocalStorageService.importJSON(json);
        dispatch({
          type: ACTION_TYPES.IMPORT_TASKS,
          payload: {
            tasks: data.tasks,
            categories: data.categories,
            streak: data.streak,
          },
        });
        if (data.theme) {
          dispatch({ type: ACTION_TYPES.SET_THEME, payload: data.theme });
        }
        notify('Data imported successfully');
        return { ok: true };
      } catch (error) {
        notify(error.message || 'Import failed', 'error');
        return { ok: false, error };
      }
    },
    [notify]
  );

  const backupData = useCallback(() => {
    const snapshot = LocalStorageService.backupData();
    notify('Backup saved to local storage');
    return snapshot;
  }, [notify]);

  const restoreData = useCallback(() => {
    const data = LocalStorageService.restoreData();
    if (!data) {
      notify('No backup found', 'error');
      return { ok: false };
    }
    dispatch({
      type: ACTION_TYPES.IMPORT_TASKS,
      payload: {
        tasks: data.tasks,
        categories: data.categories,
        streak: data.streak,
      },
    });
    if (data.theme) {
      dispatch({ type: ACTION_TYPES.SET_THEME, payload: data.theme });
    }
    notify('Backup restored');
    return { ok: true };
  }, [notify]);

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(state.tasks, state.filters), state.sortBy),
    [state.tasks, state.filters, state.sortBy]
  );

  const stats = useMemo(() => getTaskStats(state.tasks), [state.tasks]);
  const productivityScore = useMemo(() => getProductivityScore(state.tasks), [state.tasks]);

  const recentlyCompleted = useMemo(
    () =>
      [...state.tasks]
        .filter((t) => t.status === 'Completed' && t.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5),
    [state.tasks]
  );

  const value = useMemo(
    () => ({
      ...state,
      visibleTasks,
      stats,
      productivityScore,
      recentlyCompleted,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      markPending,
      duplicateTask,
      reorderTasks,
      setFilters,
      setSort,
      toggleTheme,
      addCategory,
      exportTasks,
      importTasks,
      backupData,
      restoreData,
      setToastHandler,
      notify,
    }),
    [
      state,
      visibleTasks,
      stats,
      productivityScore,
      recentlyCompleted,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      markPending,
      duplicateTask,
      reorderTasks,
      setFilters,
      setSort,
      toggleTheme,
      addCategory,
      exportTasks,
      importTasks,
      backupData,
      restoreData,
      setToastHandler,
      notify,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}

export default TaskContext;
