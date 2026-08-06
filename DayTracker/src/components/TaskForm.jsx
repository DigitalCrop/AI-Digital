import { memo, useEffect, useMemo, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import {
  PLANNING_BUCKETS,
  PRIORITIES,
  RECURRENCE_OPTIONS,
  TIME_SLOTS,
} from '../utils/constants';
import { getPlanningDueDate, toDateString } from '../utils/dateHelpers';
import { createEmptyTask } from '../utils/taskHelpers';

function TaskForm({
  open,
  initialTask = null,
  categories,
  onSubmit,
  onClose,
  onAddCategory,
}) {
  const isEdit = Boolean(initialTask?.id);
  const blank = useMemo(() => createEmptyTask({ dueDate: toDateString() }), []);

  const [form, setForm] = useState(blank);
  const [tagInput, setTagInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!open) return;
    setForm(
      initialTask
        ? { ...createEmptyTask(), ...initialTask, tags: [...(initialTask.tags || [])] }
        : createEmptyTask({ dueDate: toDateString(), planningBucket: 'Today', timeSlot: 'Morning' })
    );
    setTagInput('');
    setNewCategory('');
    setErrors([]);
  }, [open, initialTask]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'planningBucket') {
        next.dueDate = getPlanningDueDate(value);
      }
      return next;
    });
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (!tag || form.tags.includes(tag)) return;
    update('tags', [...form.tags, tag]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    update(
      'tags',
      form.tags.filter((t) => t !== tag)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onSubmit({ ...form, title: form.title.trim() });
    if (result?.ok === false) {
      setErrors(result.errors || ['Validation failed']);
      return;
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Close form" onClick={onClose} />
      <div className="card relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto animate-scale-in rounded-t-3xl p-5 shadow-card sm:rounded-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="task-form-title" className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button type="button" className="btn-ghost !px-2" onClick={onClose} aria-label="Close">
            <FiX className="text-lg" />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300" role="alert">
            {errors.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              className="input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="input min-h-[80px] resize-y"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Add details…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="task-category">Category</label>
              <select
                id="task-category"
                className="input"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="mt-2 flex gap-2">
                <input
                  className="input"
                  placeholder="New category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  aria-label="New category name"
                />
                <button
                  type="button"
                  className="btn-secondary shrink-0"
                  onClick={() => {
                    if (!newCategory.trim()) return;
                    onAddCategory?.(newCategory.trim());
                    update('category', newCategory.trim());
                    setNewCategory('');
                  }}
                  aria-label="Add category"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="input"
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="task-bucket">Planning</label>
              <select
                id="task-bucket"
                className="input"
                value={form.planningBucket}
                onChange={(e) => update('planningBucket', e.target.value)}
              >
                {PLANNING_BUCKETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="task-slot">Time Slot</label>
              <select
                id="task-slot"
                className="input"
                value={form.timeSlot}
                onChange={(e) => update('timeSlot', e.target.value)}
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-est">Estimated Time</label>
              <input
                id="task-est"
                className="input"
                value={form.estimatedTime}
                onChange={(e) => update('estimatedTime', e.target.value)}
                placeholder="e.g. 30m"
              />
            </div>
            <div>
              <label className="label" htmlFor="task-recurrence">Recurrence</label>
              <select
                id="task-recurrence"
                className="input"
                value={form.recurrence}
                onChange={(e) => update('recurrence', e.target.value)}
              >
                {RECURRENCE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="task-tags">Tags</label>
            <div className="flex gap-2">
              <input
                id="task-tags"
                className="input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter"
              />
              <button type="button" className="btn-secondary" onClick={addTag}>
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    #{tag} <FiX />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="task-notes">Notes</label>
            <textarea
              id="task-notes"
              className="input min-h-[70px] resize-y"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Extra notes…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(TaskForm);
