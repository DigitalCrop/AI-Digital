# timePass

timePass is a bright, account-free multiplayer game room for 2–4 friends. Create a temporary private room, share its five-character code, ready up, and play five real-time games. The Node server owns and validates every move; browsers only send actions.

## Stack and structure

- React 19 + Vite frontend, plain responsive CSS
- Express 5 + Socket.IO server
- SQLite + Prisma for room metadata, player scores, and completed matches
- Zod schemas shared by client/server packages
- Vitest and Testing Library
- One multi-stage, non-root Docker image

```text
timePass/
├── client/                 React screens and one board component per game
├── server/
│   ├── prisma/             schema and committed migration
│   └── src/
│       ├── games/          five authoritative game engines
│       ├── services/       rooms, sessions, and persistence
│       └── test/           server and engine tests
├── shared/                 events, constants, and Zod schemas
├── data/                   local SQLite data (ignored)
├── deploy/                 Nginx and Caddy examples
├── Dockerfile
├── docker-compose.yml
├── docker-compose.caddy.yml
├── .env.example
└── DEPLOYMENT.md
```

## Local development without Docker

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env
# For host development, change DATABASE_URL in .env to file:./data/timepass.db
npm install
npm run db:generate
npm run db:dev
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies API and Socket.IO traffic to the server on port 3000. Create `data/` if needed. On PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Docker start

First inspect shared-host resources and confirm the selected port is unused:

```bash
docker ps
docker network ls
docker volume ls
sudo ss -ltnp
cp .env.example .env
docker compose -p timepass up -d --build
docker compose -p timepass ps
curl http://127.0.0.1:3100/timepass/api/health
```

Only the `timepass` Compose project is started. The host mapping defaults to `127.0.0.1:3100`; change `TIMEPASS_HOST` or `TIMEPASS_PORT` in `.env` if needed. The app listens on port 3000 only inside its container. SQLite lives in the named `timepass-data` volume at `/app/data/timepass.db`.

Useful project-scoped operations:

```bash
docker compose -p timepass logs -f timepass-app
docker compose -p timepass restart timepass-app
docker compose -p timepass exec timepass-app npm run db:migrate
docker compose -p timepass up -d --build
docker compose -p timepass down
```

`docker compose down` keeps the database volume. Never add `-v` during normal operation.

## Environment variables

| Variable | Purpose | Default/example |
|---|---|---|
| `NODE_ENV` | Runtime mode | `production` |
| `PORT` | Internal application port | `3000` |
| `TIMEPASS_HOST` | Host interface for Compose | `127.0.0.1` |
| `TIMEPASS_PORT` | Host port for Compose | `3100` |
| `DATABASE_URL` | Prisma SQLite URL | `file:/app/data/timepass.db` |
| `APP_DOMAIN` | Public hostname for optional Caddy | `timepass.example.com` |
| `CLIENT_URL` | Public invite origin / development CORS origin | `https://timepass.example.com` |
| `ROOM_EXPIRY_MINUTES` | Inactive room lifetime | `120` |
| `RECONNECT_GRACE_SECONDS` | Disconnected player reservation | `60` |
| `SESSION_SECRET` | Long random session-token hashing secret | change in production |

Do not commit `.env`. Generate a secret with `openssl rand -base64 48`.

## Multiplayer behavior

The server keeps live rooms and game state in memory. A cryptographically random player token is stored in browser local storage and only sent to the same Socket.IO server for reconnection. Refreshing within the configured grace period restores the same seat. Names are trimmed, sanitized, limited to 20 characters, and unique per room. Disconnected, ready, and host states are visible. If a host does not return before the grace period, the next connected player becomes host.

Create/join attempts are rate-limited. Payloads are small and Zod-validated, duplicate action IDs are rejected, and every game engine validates turn order and move legality. A socket can only receive the room it joined. Helmet headers, a restrictive content policy, request limits, health checks, and graceful process shutdown are enabled.

### Socket.IO events

Client requests: `room:create`, `room:join`, `room:reconnect`, `room:leave`, `player:ready`, `game:select`, `game:start`, `game:move`, `game:rematch`, and `game:return-lobby`. Server updates: `room:state`, `room:error`, `game:complete`, and `player:connection`. Each request uses an acknowledgement object shaped as `{ ok: true, ... }` or `{ ok: false, error }`.

## Game rules

- **Snakes & Ladders:** 2–4 players, start at 0, server rolls a six-sided die, fixed snakes/ladders apply, exact landing is required for 100, and a six gives another turn.
- **Tic-Tac-Toe:** exactly 2 players, alternating X/O, first line of three wins; a filled board is a draw.
- **Connect Four:** exactly 2 players, discs fall to the lowest open row, and four horizontal, vertical, or diagonal discs win.
- **Memory Match:** 2–4 players, 16 shuffled cards / 8 pairs. Flip two; a match scores one pair and keeps the turn, otherwise play passes. Most pairs wins, with tied final scores reported as a draw. Hidden card symbols are not sent to clients.
- **Pakida / Kavidi:** this project implements a documented Kerala-inspired cowrie race variant. Four kavidi are thrown by the server. The number of open shells scores 1, 2, 3, or 4; zero open scores 8. Each player has four pieces on a shared 24-step track. A piece enters step 0 only on 1, 4, or 8. Throws must land exactly on step 24. Landing on an opponent returns all opposing pieces on that square home, except on safe squares 0, 6, 12, and 18. Throws of 4 or 8 and captures grant another throw. The first player to finish all four pieces wins.

Kavidi rules are not placeholders. Important regional values are isolated in `server/src/games/pakidaKavidi.js` as `KAVIDI_RULES`: shell count, throw mapping, pieces per player, track length, entry throws, bonus throws, safe squares, capture bonus, and exact-finish behavior. Change or inject that configuration to match a local tradition.

## Database and migrations

The committed initial migration creates `Room`, `Player`, and `Match`. Production startup runs `prisma migrate deploy` before starting the server.

```bash
npm run db:generate
npm run db:migrate
# Create a new migration during development:
npm run db:dev
```

## Test and build

```bash
npm test
npm run lint
npm run build
docker build -t timepass-app:local .
```

For a manual multiplayer check, create a room in one browser window, copy the invite into a private/incognito window, join with a different name, select a two-player game, ready both players, and verify an out-of-turn board is disabled. Refresh one window and confirm its seat reconnects.

## Known limitations

- Run exactly one application instance. Active rooms live in process memory. Multiple replicas require a shared Socket.IO adapter (such as Redis), shared authoritative game/room state, and load-balancer affinity or equivalent routing.
- Active matches do not survive an application restart, but persisted room metadata, scores, and match summaries do.
- Rooms are capped at four players and have no spectators or chat.
- Rules for traditional Kavidi vary by region; this implementation is explicit and configurable rather than claiming to be universal.

See [DEPLOYMENT.md](DEPLOYMENT.md) for a shared-Droplet-safe production runbook, HTTPS proxy examples, updates, backup/restore, and troubleshooting.
