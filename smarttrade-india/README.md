# SmartTrade India

Production-grade Indian Stock Market trading platform with real-time NSE/BSE monitoring and automated trade execution.

## Features

- **Market Dashboard** — NIFTY50, BANKNIFTY, market breadth, gainers/losers, sector performance
- **Stock Scanner** — RSI, MACD, EMA/SMA crossover, VWAP, volume, delivery %, breakout filters
- **Strategy Builder** — No-code rule creation with AND/OR logic
- **Automated Trading Engine** — Rule evaluation, signal generation, order execution with retry
- **Broker Integration** — Pluggable adapters for Zerodha, Upstox, Angel One, ICICI Direct
- **Risk Management** — Daily loss limits, position sizing, trailing stops, emergency stop
- **Portfolio & Analytics** — P&L tracking, equity curve, win/loss distribution
- **Backtesting** — CAGR, Sharpe ratio, max drawdown, win rate, profit factor
- **AI Recommendations** — Trade opportunities with confidence and risk scores
- **Compliance** — Manual approval, broker consent, audit logs, risk warnings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Material UI, Zustand |
| Charts | TradingView Lightweight Charts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Real-time | WebSocket (ws) |
| Deployment | Docker, nginx, GitHub Actions |

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL + Redis
docker compose up postgres redis -d

# Configure backend
cp backend/.env.example backend/.env

# Run dev servers
npm run dev
```

Open http://localhost:5173 — register an account and explore the platform.

## Project Structure

```
smarttrade-india/
├── frontend/          # React trading terminal UI
├── backend/           # API, trading engine, broker adapters
├── packages/shared/   # Shared TypeScript types
├── database/          # PostgreSQL migrations
├── docker/            # Dockerfiles and nginx config
└── docs/              # Architecture, API, deployment guides
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, trading workflow, compliance
- [API Specification](docs/API.md) — REST endpoints and WebSocket events
- [Deployment Guide](docs/DEPLOYMENT.md) — Docker, CI/CD, production checklist

## Compliance Notice

**This platform does not place trades without explicit user authorization by default.**

- All automated orders require manual approval unless explicitly disabled
- Broker connection requires explicit consent
- Emergency stop button halts all automated trading immediately
- Complete audit trail maintained for regulatory review

Trading in securities involves substantial risk. Past performance does not guarantee future results.

## License

Proprietary — All rights reserved.
