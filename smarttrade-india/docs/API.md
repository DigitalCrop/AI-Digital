# SmartTrade India - API Specification

Base URL: `http://localhost:4000/api`

All authenticated endpoints require: `Authorization: Bearer <accessToken>`

Response format:
```json
{ "success": true, "data": {}, "error": { "code": "", "message": "" } }
```

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login (supports 2FA) |
| GET | `/auth/me` | Yes | Get current user |
| PUT | `/auth/profile` | Yes | Update profile |
| POST | `/auth/2fa/setup` | Yes | Initialize 2FA |
| POST | `/auth/2fa/enable` | Yes | Enable 2FA with token |

### POST /auth/register
```json
{ "email": "user@example.com", "password": "securepass", "firstName": "Raj", "lastName": "Kumar" }
```

### POST /auth/login
```json
{ "email": "user@example.com", "password": "securepass", "totpCode": "123456" }
```

---

## Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/market/dashboard` | Full dashboard (indices, breadth, gainers/losers) |
| GET | `/market/quote/:symbol?exchange=NSE` | Single stock quote |
| GET | `/market/search?q=REL` | Symbol search |
| POST | `/market/scanner/run` | Run stock scanner |

### POST /market/scanner/run
```json
{
  "exchange": "NSE",
  "filters": {
    "priceMin": 100, "priceMax": 5000,
    "volumeMultiplier": 2, "rsiMax": 70,
    "deliveryPctMin": 40, "macdCrossover": "bullish"
  }
}
```

---

## Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trading/strategies` | List user strategies |
| POST | `/trading/strategies` | Create strategy |
| POST | `/trading/strategies/sample` | Create sample RSI strategy |
| PATCH | `/trading/strategies/:id/status` | Activate/pause/stop |
| GET | `/trading/orders` | List orders |
| POST | `/trading/orders/:id/approve` | Approve pending order |
| GET | `/trading/positions` | Open positions |
| GET | `/trading/portfolio` | Portfolio + holdings |
| GET | `/trading/risk-settings` | Get risk config |
| PUT | `/trading/risk-settings` | Update risk config |
| POST | `/trading/emergency-stop` | Emergency halt |
| POST | `/trading/brokers/connect` | Connect broker |
| POST | `/trading/backtest` | Run backtest |
| GET | `/trading/recommendations` | AI recommendations |

### POST /trading/strategies
```json
{
  "name": "RSI Strategy",
  "symbols": ["RELIANCE", "TCS"],
  "entryRules": {
    "operator": "AND",
    "conditions": [
      { "id": "1", "field": "RSI", "comparator": "<", "value": 30, "period": 14 }
    ]
  },
  "exitRules": {
    "operator": "OR",
    "conditions": [
      { "id": "2", "field": "RSI", "comparator": ">", "value": 70, "period": 14 }
    ]
  },
  "riskConfig": { "stopLossPct": 2, "targetPct": 4 },
  "requiresManualApproval": true
}
```

### POST /trading/brokers/connect
```json
{
  "provider": "ZERODHA",
  "apiKey": "...",
  "apiSecret": "...",
  "clientId": "...",
  "consentGiven": true
}
```

### POST /trading/backtest
```json
{
  "name": "Q1 Backtest",
  "symbols": ["RELIANCE", "TCS"],
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  "initialCapital": 100000
}
```

---

## WebSocket

**URL**: `ws://localhost:4000/ws?token=<JWT>`

### Server → Client Events
| Type | Payload |
|------|---------|
| `connected` | `{ userId }` |
| `quote_update` | Market refresh notification |
| `signal_generated` | `{ strategyId, symbol, signal, signalId }` |
| `order_update` | `{ orderId, status, message }` |
| `trade_executed` | `{ symbol, side, quantity, price }` |
| `emergency_stop` | `{ message }` |
| `alert` | Alert notification |

### Client → Server
| Type | Description |
|------|-------------|
| `subscribe` | Subscribe to symbol channels |
| `ping` | Keepalive |

---

## Health Check

`GET /health` — Returns database, Redis, and engine status.
