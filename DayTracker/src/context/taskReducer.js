export const ACTION_TYPES = {
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  MARK_PENDING: 'MARK_PENDING',
  REORDER_TASK: 'REORDER_TASK',
  DUPLICATE_TASK: 'DUPLICATE_TASK',
  IMPORT_TASKS: 'IMPORT_TASKS',
  EXPORT_TASKS: 'EXPORT_TASKS',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_THEME: 'SET_THEME',
  ADD_CATEGORY: 'ADD_CATEGORY',
  SET_STREAK: 'SET_STREAK',
  HYDRATE: 'HYDRATE',
};

export const initialFilters = {
  category: 'All',
  priority: 'All',
  status: 'All',
  dueDate: '',
  search: '',
  planningBucket: 'All',
  timeSlot: 'All',
};

export const initialState = {
  tasks: [],
  categories: [],
  filters: initialFilters,
  sortBy: 'dueDate',
  theme: 'light',
  streak: { count: 0, lastDate: null },
  hydrated: false,
};

export function taskReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.HYDRATE:
      return { ...state, ...action.payload, hydrated: true };

    case ACTION_TYPES.ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] };

    case ACTION_TYPES.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload, updatedAt: new Date().toISOString() }
            : task
        ),
      };

    case ACTION_TYPES.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case ACTION_TYPES.COMPLETE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                status: 'Completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };

    case ACTION_TYPES.MARK_PENDING:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                status: 'Pending',
                completedAt: null,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };

    case ACTION_TYPES.REORDER_TASK: {
      const { orderedIds, timeSlot } = action.payload;
      const orderMap = Object.fromEntries(orderedIds.map((id, index) => [id, index + 1]));
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (timeSlot && task.timeSlot !== timeSlot) return task;
          if (!(task.id in orderMap)) return task;
          return { ...task, order: orderMap[task.id], updatedAt: new Date().toISOString() };
        }),
      };
    }

    case ACTION_TYPES.DUPLICATE_TASK: {
      const original = state.tasks.find((t) => t.id === action.payload);
      if (!original) return state;
      const copy = {
        ...original,
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        title: `${original.title} (Copy)`,
        status: 'Pending',
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: Date.now(),
      };
      return { ...state, tasks: [...state.tasks, copy] };
    }

    case ACTION_TYPES.IMPORT_TASKS:
      return {
        ...state,
        tasks: action.payload.tasks,
        categories: action.payload.categories || state.categories,
        streak: action.payload.streak || state.streak,
      };

    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case ACTION_TYPES.SET_SORT:
      return { ...state, sortBy: action.payload };

    case ACTION_TYPES.SET_THEME:
      return { ...state, theme: action.payload };

    case ACTION_TYPES.ADD_CATEGORY:
      if (state.categories.includes(action.payload)) return state;
      return { ...state, categories: [...state.categories, action.payload] };

    case ACTION_TYPES.SET_STREAK:
      return { ...state, streak: action.payload };

    default:
      return state;
  }
}
