import { memo } from 'react';
import {
  PRIORITIES,
  SORT_OPTIONS,
  STATUSES,
} from '../utils/constants';

function TaskFilters({
  filters,
  sortBy,
  categories,
  onFilterChange,
  onSortChange,
}) {
  return (
    <section className="card animate-fade-in p-4" aria-label="Task filters">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label className="label" htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            className="input"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="All">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-priority">Priority</label>
          <select
            id="filter-priority"
            className="input"
            value={filters.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value })}
          >
            <option value="All">All</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            className="input"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="All">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-due">Due Date</label>
          <input
            id="filter-due"
            type="date"
            className="input"
            value={filters.dueDate}
            onChange={(e) => onFilterChange({ dueDate: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="filter-bucket">Planning</label>
          <select
            id="filter-bucket"
            className="input"
            value={filters.planningBucket}
            onChange={(e) => onFilterChange({ planningBucket: e.target.value })}
          >
            <option value="All">All</option>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="This Week">This Week</option>
            <option value="Next Week">Next Week</option>
            <option value="Someday">Someday</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-sort">Sort By</label>
          <select
            id="filter-sort"
            className="input"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default memo(TaskFilters);
