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

## Docker (production)

DayTracker is a **Vite** React SPA. Production assets land in `dist/` and are served by **Nginx Alpine** inside a multi-stage Docker image.

| Item | Value |
|------|--------|
| Build tool | Vite 6 |
| Node (build / CI) | 22 |
| Build output | `dist/` |
| Env vars | None (`VITE_*` not used; data is `localStorage`-only) |
| npm scripts | `dev`, `build`, `preview` (no lint/test scripts yet) |

### Build & run locally

```bash
# From the DayTracker directory
docker build -t daytracker .

# Map host 8080 → container 80
docker run --rm -p 8080:80 daytracker
```

Open [http://localhost:8080](http://localhost:8080). Confirm:

1. The dashboard loads and sample tasks appear.
2. Hard-refresh still works (SPA routing via `nginx.conf` `try_files`).
3. Health endpoint: [http://localhost:8080/health](http://localhost:8080/health) returns `ok`.

Stop with `Ctrl+C` (or omit `--rm` and use `docker stop <id>`).

Files:

- `Dockerfile` — Node 22 Alpine build → Nginx Alpine serve
- `nginx.conf` — SPA fallback + `/health` + gzip
- `.dockerignore` — keeps `node_modules` / `dist` out of the build context

## CI/CD (GitHub Actions → GHCR → DigitalOcean)

Workflow: [`.github/workflows/docker-build-deploy.yml`](../.github/workflows/docker-build-deploy.yml) (repo root).

On every push to `main` that touches `DayTracker/**` (or manual `workflow_dispatch`):

1. Checkout  
2. Setup Node 22 → `npm ci` → `npm run build`  
3. Login to **GHCR**  
4. Build multi-stage Docker image  
5. Tag & push:  
   - `ghcr.io/<owner>/<repo>:latest`  
   - `ghcr.io/<owner>/<repo>:<short-sha>`  
6. SSH into DigitalOcean → pull image → recreate container → health check  

Example image for this remote (`DigitalCrop/AI-Digital`):

```text
ghcr.io/digitalcrop/ai-digital:latest
ghcr.io/digitalcrop/ai-digital:a1b2c3d
```

### GitHub Actions secrets

Configure under **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `DO_HOST` | Droplet public IP or hostname |
| `DO_USERNAME` | SSH user (e.g. `root` or `deploy`) |
| `DO_SSH_KEY` | Private SSH key (full PEM), matching a public key on the droplet |

How to set them:

1. Generate a deploy key (if needed): `ssh-keygen -t ed25519 -C "daytracker-deploy" -f deploy_key -N ""`
2. Append `deploy_key.pub` to `~/.ssh/authorized_keys` on the droplet.
3. Paste the **private** key contents into `DO_SSH_KEY`.
4. Set `DO_HOST` to the droplet IP and `DO_USERNAME` to the SSH user.

`GITHUB_TOKEN` is provided automatically and is used to push/pull GHCR packages during the workflow. Ensure **Packages** write permission is enabled for Actions (the workflow sets `packages: write`).

If the GHCR package is **private**, make sure the droplet can pull it (the workflow runs `docker login ghcr.io` over SSH with `GITHUB_TOKEN`). For long-lived server pulls outside Actions, create a PAT with `read:packages` and store it on the droplet.

### Manual deploy script

`deploy.sh` on the server (or any Docker host):

```bash
chmod +x deploy.sh

# Latest
IMAGE=ghcr.io/digitalcrop/ai-digital:latest ./deploy.sh

# Pin a commit tag (safer rollouts)
IMAGE=ghcr.io/digitalcrop/ai-digital:a1b2c3d ./deploy.sh
```

The script pulls the image, stops/removes the old `daytracker` container, starts a new one on port 80 with `--restart always`, then curls `/health`.

## DigitalOcean server preparation

### 1. Install Docker (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker "$USER"   # re-login after this
```

### 2. Log in to GHCR

```bash
# Use a GitHub PAT with read:packages (and write:packages if you push from the server)
echo YOUR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 3. Deployment folder (optional)

```bash
mkdir -p ~/apps/daytracker
cd ~/apps/daytracker
# Copy deploy.sh here, or rely on the GitHub Actions SSH steps alone
```

### 4. First deployment

```bash
docker pull ghcr.io/digitalcrop/ai-digital:latest

docker stop daytracker || true
docker rm daytracker || true

docker run -d \
  --name daytracker \
  -p 80:80 \
  --restart always \
  ghcr.io/digitalcrop/ai-digital:latest
```

Or: `IMAGE=ghcr.io/digitalcrop/ai-digital:latest ./deploy.sh`

### 5. Verify

```bash
docker ps
docker logs daytracker
curl http://127.0.0.1/health
```

`--restart always` keeps the container running after droplet reboots.

## Production improvements (recommended next steps)

| Improvement | Why |
|-------------|-----|
| **Docker `HEALTHCHECK`** | Already in the `Dockerfile` (`/health`). Wire it to your orchestrator or `docker ps` status. |
| **Versioned tags** | Pipeline pushes `:latest` **and** `:<short-sha>`. Prefer deploying by SHA for auditability. |
| **Rollback** | Re-run `deploy.sh` with the previous SHA tag, e.g. `IMAGE=ghcr.io/.../ai-digital:abc1234 ./deploy.sh`. |
| **Nginx reverse proxy** | Put host Nginx/Caddy in front of the container (or map to `127.0.0.1:8080`) for multiple apps on one droplet. |
| **HTTPS (Let’s Encrypt)** | Use Caddy, Nginx + Certbot, or DigitalOcean Load Balancer TLS in front of port 80. |
| **Lint / test in CI** | When you add `lint` / `test` scripts to `package.json`, enable them in the workflow step that currently only runs `npm run build`. |

## License

MIT — feel free to adapt for your own projects.
