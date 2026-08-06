import { STORAGE_KEYS } from '../utils/constants';

/**
 * LocalStorage service for DayTracker persistence.
 */
export const LocalStorageService = {
  loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return null;
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Failed to save tasks:', error);
      return false;
    }
  },

  loadCategories() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch {
      return false;
    }
  },

  loadTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  loadStreak() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (!raw) return { count: 0, lastDate: null };
      return JSON.parse(raw);
    } catch {
      return { count: 0, lastDate: null };
    }
  },

  saveStreak(streak) {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  },

  /**
   * Create a full backup snapshot of app data.
   */
  backupData() {
    const snapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: this.loadTasks() || [],
      categories: this.loadCategories() || [],
      streak: this.loadStreak(),
      theme: this.loadTheme(),
    };
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(snapshot));
    return snapshot;
  },

  /**
   * Restore from a backup object (or last backup in storage).
   */
  restoreData(backup = null) {
    try {
      const data =
        backup ||
        (() => {
          const raw = localStorage.getItem(STORAGE_KEYS.BACKUP);
          return raw ? JSON.parse(raw) : null;
        })();

      if (!data) return null;

      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.categories)) this.saveCategories(data.categories);
      if (data.streak) this.saveStreak(data.streak);
      if (data.theme) this.saveTheme(data.theme);

      return data;
    } catch (error) {
      console.error('Failed to restore data:', error);
      return null;
    }
  },

  exportJSON() {
    return this.backupData();
  },

  importJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!data || !Array.isArray(data.tasks)) {
      throw new Error('Invalid import file: expected tasks array.');
    }
    return this.restoreData(data);
  },
};

export default LocalStorageService;
