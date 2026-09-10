# Healthcare Portal Monorepo

Scaffolded monorepo for the Healthcare Micro-Frontend Platform. Contains apps and shared libs.

Local dev (after installing dependencies):

```bash
npm install
# Prepare Prisma client for auth-service (safe, fast)
npm run dev:prep
npm install
# Build shared UI library used by MFEs
npm --prefix libs/ui install
npm --prefix libs/ui run build

# Start auth-service + MFEs + Shell (runs all dev servers)
npm run dev:all
npm run dev:all
```

Quick verification (after servers are up):

```bash
# run smoke checks to verify endpoints and remote entries
npm run smoke
```

Open the Shell at http://localhost:3000 and navigate to `/policies` and `/claims` to confirm the remotes load.
