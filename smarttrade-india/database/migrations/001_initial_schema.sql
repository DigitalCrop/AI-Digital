-- SmartTrade India - Initial Database Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'trader', 'viewer', 'analyst');
CREATE TYPE exchange_type AS ENUM ('NSE', 'BSE');
CREATE TYPE order_side AS ENUM ('BUY', 'SELL');
CREATE TYPE order_type AS ENUM ('MARKET', 'LIMIT', 'SL', 'SL-M');
CREATE TYPE order_status AS ENUM ('PENDING', 'OPEN', 'COMPLETE', 'CANCELLED', 'REJECTED', 'FAILED');
CREATE TYPE product_type AS ENUM ('CNC', 'MIS', 'NRML');
CREATE TYPE strategy_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'STOPPED', 'ARCHIVED');
CREATE TYPE alert_channel AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM', 'PUSH');
CREATE TYPE alert_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'ACKNOWLEDGED');
CREATE TYPE broker_provider AS ENUM ('ZERODHA', 'UPSTOX', 'ANGEL_ONE', 'ICICI_DIRECT', 'GROWW');
CREATE TYPE audit_action AS ENUM (
  'LOGIN', 'LOGOUT', 'ORDER_PLACED', 'ORDER_MODIFIED', 'ORDER_CANCELLED',
  'STRATEGY_CREATED', 'STRATEGY_ACTIVATED', 'STRATEGY_STOPPED', 'EMERGENCY_STOP',
  'BROKER_CONNECTED', 'BROKER_DISCONNECTED', 'SETTINGS_UPDATED', 'TRADE_EXECUTED'
);

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'trader',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_secret VARCHAR(255),
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  pan_number_encrypted BYTEA,
  default_exchange exchange_type DEFAULT 'NSE',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  risk_tolerance VARCHAR(20) DEFAULT 'moderate',
  trading_experience VARCHAR(20) DEFAULT 'intermediate',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BROKERS
-- ============================================================

CREATE TABLE broker_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider broker_provider NOT NULL,
  client_id VARCHAR(255),
  api_key_encrypted BYTEA NOT NULL,
  api_secret_encrypted BYTEA,
  access_token_encrypted BYTEA,
  refresh_token_encrypted BYTEA,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================================
-- RISK MANAGEMENT
-- ============================================================

CREATE TABLE risk_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  capital_allocation_pct DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  max_daily_loss DECIMAL(15,2) NOT NULL DEFAULT 5000.00,
  max_open_positions INTEGER NOT NULL DEFAULT 5,
  default_position_size_pct DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  min_risk_reward_ratio DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  default_stop_loss_pct DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  trailing_stop_enabled BOOLEAN NOT NULL DEFAULT false,
  trailing_stop_pct DECIMAL(5,2) DEFAULT 1.00,
  auto_trading_enabled BOOLEAN NOT NULL DEFAULT false,
  emergency_stop_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STRATEGIES
-- ============================================================

CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status strategy_status NOT NULL DEFAULT 'DRAFT',
  exchange exchange_type NOT NULL DEFAULT 'NSE',
  symbols TEXT[] DEFAULT '{}',
  entry_rules JSONB NOT NULL DEFAULT '[]',
  exit_rules JSONB NOT NULL DEFAULT '[]',
  risk_config JSONB NOT NULL DEFAULT '{}',
  schedule JSONB DEFAULT '{"enabled": false}',
  requires_manual_approval BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  activated_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE strategy_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  signal_type order_side NOT NULL,
  confidence_score DECIMAL(5,2),
  indicators JSONB NOT NULL DEFAULT '{}',
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed BOOLEAN NOT NULL DEFAULT false,
  order_id UUID
);

-- ============================================================
-- SCANNERS
-- ============================================================

CREATE TABLE scanners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  exchange exchange_type NOT NULL DEFAULT 'NSE',
  filters JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scanner_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scanner_id UUID NOT NULL REFERENCES scanners(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  match_score DECIMAL(5,2),
  indicators JSONB NOT NULL DEFAULT '{}',
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS & TRADES
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_connection_id UUID REFERENCES broker_connections(id),
  strategy_id UUID REFERENCES strategies(id),
  broker_order_id VARCHAR(100),
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  side order_side NOT NULL,
  order_type order_type NOT NULL,
  product_type product_type NOT NULL DEFAULT 'CNC',
  quantity INTEGER NOT NULL,
  price DECIMAL(15,4),
  trigger_price DECIMAL(15,4),
  filled_quantity INTEGER NOT NULL DEFAULT 0,
  average_price DECIMAL(15,4),
  status order_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  placed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  strategy_id UUID REFERENCES strategies(id),
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  side order_side NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  brokerage DECIMAL(15,4) DEFAULT 0,
  taxes DECIMAL(15,4) DEFAULT 0,
  net_amount DECIMAL(15,4) NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_connection_id UUID REFERENCES broker_connections(id),
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  product_type product_type NOT NULL DEFAULT 'CNC',
  quantity INTEGER NOT NULL DEFAULT 0,
  average_price DECIMAL(15,4) NOT NULL DEFAULT 0,
  last_price DECIMAL(15,4),
  unrealized_pnl DECIMAL(15,4) DEFAULT 0,
  realized_pnl DECIMAL(15,4) DEFAULT 0,
  stop_loss DECIMAL(15,4),
  target_price DECIMAL(15,4),
  trailing_stop_pct DECIMAL(5,2),
  opened_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, exchange, product_type)
);

-- ============================================================
-- PORTFOLIO
-- ============================================================

CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_value DECIMAL(15,4) DEFAULT 0,
  invested_value DECIMAL(15,4) DEFAULT 0,
  cash_balance DECIMAL(15,4) DEFAULT 0,
  day_pnl DECIMAL(15,4) DEFAULT 0,
  total_pnl DECIMAL(15,4) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  quantity INTEGER NOT NULL,
  average_price DECIMAL(15,4) NOT NULL,
  current_price DECIMAL(15,4),
  invested_value DECIMAL(15,4) NOT NULL,
  current_value DECIMAL(15,4),
  unrealized_pnl DECIMAL(15,4) DEFAULT 0,
  unrealized_pnl_pct DECIMAL(8,4) DEFAULT 0,
  sector VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, exchange)
);

CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_value DECIMAL(15,4) NOT NULL,
  day_pnl DECIMAL(15,4) NOT NULL,
  cumulative_pnl DECIMAL(15,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, snapshot_date)
);

-- ============================================================
-- TRADE JOURNAL
-- ============================================================

CREATE TABLE trade_journal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id),
  strategy_id UUID REFERENCES strategies(id),
  symbol VARCHAR(50) NOT NULL,
  entry_reason TEXT,
  exit_reason TEXT,
  entry_price DECIMAL(15,4),
  exit_price DECIMAL(15,4),
  pnl DECIMAL(15,4),
  pnl_pct DECIMAL(8,4),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  screenshot_urls TEXT[] DEFAULT '{}',
  emotions VARCHAR(50),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ALERTS
-- ============================================================

CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  channels alert_channel[] NOT NULL DEFAULT '{EMAIL}',
  conditions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  config_id UUID REFERENCES alert_configs(id),
  channel alert_channel NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'PENDING',
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BACKTESTING
-- ============================================================

CREATE TABLE backtest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id),
  name VARCHAR(255) NOT NULL,
  symbols TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_capital DECIMAL(15,4) NOT NULL DEFAULT 100000,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  results JSONB,
  metrics JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AI RECOMMENDATIONS
-- ============================================================

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  recommendation order_side NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL,
  sentiment_score DECIMAL(5,2),
  news_impact JSONB DEFAULT '{}',
  reasoning TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MARKET DATA CACHE (supplementary)
-- ============================================================

CREATE TABLE market_symbols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  name VARCHAR(255),
  sector VARCHAR(100),
  industry VARCHAR(100),
  isin VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  lot_size INTEGER DEFAULT 1,
  tick_size DECIMAL(10,4) DEFAULT 0.05,
  UNIQUE(symbol, exchange)
);

CREATE TABLE ohlcv_daily (
  symbol VARCHAR(50) NOT NULL,
  exchange exchange_type NOT NULL,
  trade_date DATE NOT NULL,
  open DECIMAL(15,4) NOT NULL,
  high DECIMAL(15,4) NOT NULL,
  low DECIMAL(15,4) NOT NULL,
  close DECIMAL(15,4) NOT NULL,
  volume BIGINT NOT NULL DEFAULT 0,
  delivery_pct DECIMAL(8,4),
  PRIMARY KEY (symbol, exchange, trade_date)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_symbol ON orders(symbol, exchange);
CREATE INDEX idx_trades_user_executed ON trades(user_id, executed_at DESC);
CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_strategies_user_status ON strategies(user_id, status);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_alerts_user_status ON alerts(user_id, status);
CREATE INDEX idx_scanner_results_scanner ON scanner_results(scanner_id, scanned_at DESC);
CREATE INDEX idx_strategy_signals_strategy ON strategy_signals(strategy_id, triggered_at DESC);
CREATE INDEX idx_ohlcv_symbol_date ON ohlcv_daily(symbol, exchange, trade_date DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_risk_settings_updated_at BEFORE UPDATE ON risk_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_broker_connections_updated_at BEFORE UPDATE ON broker_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PRIVILEGES
-- ============================================================
ALTER DATABASE smarttrade_db OWNER TO smarttrade;
GRANT ALL PRIVILEGES ON DATABASE smarttrade_db TO smarttrade;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smarttrade;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smarttrade;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO smarttrade;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smarttrade;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smarttrade;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO smarttrade;
