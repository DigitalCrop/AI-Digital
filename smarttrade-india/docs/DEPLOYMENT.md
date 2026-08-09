# SmartTrade India - Deployment Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

## DigitalOcean deployment

This project now includes a dedicated GitHub Actions workflow at `.github/workflows/smarttrade-india-build-deploy.yml`. It deploys only when files under `smarttrade-india/**` change, so other projects in the repo are not rebuilt or redeployed.

Required repository secrets:
- `DO_HOST`
- `DO_USERNAME`
- `DO_SSH_KEY`
- `DO_SSH_PASSPHRASE` (optional)
- `GITHUB_TOKEN` is provided automatically by GitHub Actions

By default the remote Nginx proxy binds to `127.0.0.1:8080` on the droplet to avoid colliding with other running services.

## Quick Start (Development)

### 1. Clone and install

```bash
cd smarttrade-india
npm install
```

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit JWT_SECRET and ENCRYPTION_KEY for production
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- WebSocket: ws://localhost:4000/ws

## Production Deployment (Docker)

### Full stack

```bash
docker compose up -d --build
```

Services:
| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 | Reverse proxy |
| frontend | 3000 | React SPA |
| backend | 4000 | API + WebSocket |
| postgres | 5432 | Database |
| redis | 6379 | Cache |

### Environment variables (production)

Set these in `docker-compose.yml` or via secrets manager:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Min 32 chars, cryptographically random |
| `ENCRYPTION_KEY` | Yes | 64 hex chars (32 bytes) for AES-256 |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `CORS_ORIGIN` | Yes | Frontend URL |
| `REQUIRE_ORDER_APPROVAL` | No | Default `true` |

## Database Migration

Schema auto-applies on first PostgreSQL container start via `docker-entrypoint-initdb.d`.

For production deployments, the GitHub Actions workflow now runs incremental migrations from the backend image. It tracks applied migrations in a `schema_migrations` table and applies only new SQL files from `database/migrations/`.

This means:
- the Postgres engine is deployed automatically as a Docker container
- you do not need `psql` installed on the host for standard deployments
- only new migration files are run on each deploy

Manual migration (for local or one-off use):
```bash
psql $DATABASE_URL -f database/migrations/001_initial_schema.sql
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):
1. Install dependencies
2. Build shared, backend, frontend
3. Run tests
4. Build Docker images (on main branch)
5. Security audit

## Monitoring

- Health endpoint: `GET /health`
- Logs: Winston JSON logging to stdout
- Audit trail: `audit_logs` table

## Security Checklist

- [ ] Change `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Enable HTTPS via nginx/Let's Encrypt
- [ ] Restrict PostgreSQL/Redis to internal network
- [ ] Set `REQUIRE_ORDER_APPROVAL=true`
- [ ] Configure SMTP/Telegram for alerts
- [ ] Enable 2FA for all trader accounts
- [ ] Review SEBI compliance for your use case

## Scaling

1. **Horizontal API scaling**: Run multiple backend instances behind nginx load balancer
2. **Trading engine**: Extract to dedicated worker with BullMQ job queue
3. **Market data**: Replace mock provider with NSE/BSE feed or broker WebSocket
4. **Read replicas**: PostgreSQL read replica for analytics queries

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection refused | Wait for postgres healthcheck; verify DATABASE_URL |
| Redis connection error | Ensure redis container is running |
| 401 on API calls | Check JWT expiry; re-login |
| WebSocket disconnect | Verify token in query param; check nginx WS proxy |
