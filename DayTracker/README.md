# DayTracker — Daily Task Planner

A modern, responsive daily task planner built with **React 19**, **Vite**, **Tailwind CSS**, and the **Context API**. All data persists in the browser via `localStorage`.

## Features

- **Dashboard** — greeting by time of day, today's date, task summary, progress bar, productivity score, and daily streak
- **Task CRUD** — create, edit, delete, duplicate, mark complete / pending
- **Planning buckets** — Today, Tomorrow, This Week, Next Week, Someday
- **Today's Planner** — Morning / Afternoon / Evening / Night with drag-and-drop reorder
- **Calendar view** — monthly grid with tasks on due dates
- **Filters & sort** — category, priority, status, due date, search, planning bucket
- **Recurring tasks** — Daily, Weekly, Monthly (spawns next occurrence on complete)
- **Import / Export** — JSON backup and restore
- **Dark mode**, toast notifications, keyboard shortcuts, confirmation dialogs

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + Vite |
| Language | JavaScript (ES6+) |
| Styling | Tailwind CSS |
| State | Context API + `useReducer` |
| Icons | React Icons |
| Persistence | `localStorage` |

## Folder Structure

```
src/
  components/     # Reusable UI (Navbar, Sidebar, TaskCard, Calendar, …)
  context/        # TaskContext + reducer actions
  hooks/          # useKeyboardShortcuts, useToast
  pages/          # Tasks, Planner, Calendar, Completed (lazy-loaded)
  services/       # LocalStorageService
  utils/          # dateHelpers, taskHelpers, constants
  styles/         # Global Tailwind / component classes
  data/           # Sample seed tasks
  App.jsx
  main.jsx
```

## Installation

```bash
# From the DayTracker directory
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New task |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + S` | Save backup to localStorage |

## LocalStorage Service

`src/services/localStorage.js` exposes:

| Method | Description |
|--------|-------------|
| `loadTasks()` | Read tasks array |
| `saveTasks(tasks)` | Persist tasks |
| `backupData()` | Snapshot tasks, categories, streak, theme |
| `restoreData(backup?)` | Restore from snapshot or last backup |
| `exportJSON()` / `importJSON(json)` | Used by Import / Export UI |

Storage keys live in `src/utils/constants.js` (`daytracker_tasks`, etc.).

## State Actions

Defined in `src/context/taskReducer.js`:

- `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`
- `COMPLETE_TASK`, `MARK_PENDING`
- `REORDER_TASK`, `DUPLICATE_TASK`
- `IMPORT_TASKS`, `EXPORT_TASKS` (export is handled via service + toast)
- Plus filters, sort, theme, categories, streak, hydrate

## Validation

- Title is required
- Due date cannot be in the past for **new** tasks
- Duplicate titles on the **same due date** are blocked

## Sample Data

On first visit (empty storage), `src/data/sampleTasks.js` seeds demo tasks across categories, priorities, and time slots—including one overdue item.

Clear site data for this origin to re-seed.

## Components (overview)

| Component | Role |
|-----------|------|
| `App` | Layout, routing between views, modals, shortcuts |
| `Navbar` | Search, theme, import/export, new task |
| `Sidebar` | Navigation + shortcut hints |
| `Dashboard` | Greeting, stats, today's focus, recently completed |
| `TaskList` / `TaskCard` | List rendering, actions, optional DnD |
| `TaskForm` | Create / edit with all fields |
| `TaskFilters` / `TaskStats` | Filtering UI and summary cards |
| `Calendar` | Month grid |
| `ProgressBar` | Completion percentage |
| `ThemeToggle` | Light / dark |
| `ConfirmationDialog` | Delete confirmation |
| `SearchBar` | Title search |

## Accessibility

- Semantic landmarks (`header`, `main`, `nav`, `aside`)
- `aria-label` / `aria-modal` on dialogs and controls
- Keyboard support for dialogs (`Escape`) and shortcuts
- Visible focus rings via Tailwind `focus-visible` utilities

## Performance

- `React.memo` on presentational components
- `useMemo` / `useCallback` in context and pages
- Lazy-loaded pages (`Tasks`, `Planner`, `Calendar`, `Completed`)

## License

MIT — feel free to adapt for your own projects.
