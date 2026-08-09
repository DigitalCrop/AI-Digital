// User & Auth
export type UserRole = 'admin' | 'trader' | 'viewer' | 'analyst';
export type Exchange = 'NSE' | 'BSE';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type OrderStatus = 'PENDING' | 'OPEN' | 'COMPLETE' | 'CANCELLED' | 'REJECTED' | 'FAILED';
export type ProductType = 'CNC' | 'MIS' | 'NRML';
export type StrategyStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'ARCHIVED';
export type BrokerProvider = 'ZERODHA' | 'UPSTOX' | 'ANGEL_ONE' | 'ICICI_DIRECT' | 'GROWW';
export type AlertChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM' | 'PUSH';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Strategy Builder
export type RuleOperator = 'AND' | 'OR';
export type ConditionField =
  | 'RSI' | 'MACD' | 'EMA' | 'SMA' | 'VWAP' | 'PRICE' | 'VOLUME'
  | 'DELIVERY_PCT' | 'BREAKOUT' | 'MOMENTUM' | 'STOP_LOSS' | 'TARGET';

export type ConditionComparator = '>' | '<' | '>=' | '<=' | '==' | 'crosses_above' | 'crosses_below';

export interface StrategyCondition {
  id: string;
  field: ConditionField;
  comparator: ConditionComparator;
  value: number | string;
  period?: number;
  params?: Record<string, unknown>;
}

export interface StrategyRuleGroup {
  operator: RuleOperator;
  conditions: StrategyCondition[];
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: StrategyStatus;
  exchange: Exchange;
  symbols: string[];
  entryRules: StrategyRuleGroup;
  exitRules: StrategyRuleGroup;
  riskConfig: RiskConfig;
  requiresManualApproval: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RiskConfig {
  stopLossPct?: number;
  targetPct?: number;
  trailingStopPct?: number;
  positionSizePct?: number;
  maxPositions?: number;
}

export interface RiskSettings {
  capitalAllocationPct: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  defaultPositionSizePct: number;
  minRiskRewardRatio: number;
  defaultStopLossPct: number;
  trailingStopEnabled: boolean;
  trailingStopPct: number;
  autoTradingEnabled: boolean;
  emergencyStopActive: boolean;
}

// Orders & Trades
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  exchange: Exchange;
  side: OrderSide;
  orderType: OrderType;
  productType: ProductType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  filledQuantity: number;
  averagePrice?: number;
  status: OrderStatus;
  requiresApproval: boolean;
  strategyId?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  symbol: string;
  exchange: Exchange;
  quantity: number;
  averagePrice: number;
  lastPrice?: number;
  unrealizedPnl: number;
  stopLoss?: number;
  targetPrice?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  exchange: Exchange;
  side: OrderSide;
  quantity: number;
  price: number;
  netAmount: number;
  executedAt: string;
}

// Market Data
export interface StockQuote {
  symbol: string;
  exchange: Exchange;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  deliveryPct?: number;
  timestamp: string;
}

export interface IndexQuote {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  timestamp: string;
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
  advanceDeclineRatio: number;
  timestamp: string;
}

export interface SectorPerformance {
  sector: string;
  changePct: number;
  topGainer?: string;
  topLoser?: string;
}

export interface MarketDashboard {
  indices: IndexQuote[];
  breadth: MarketBreadth;
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  volumeMovers: StockQuote[];
  sectorPerformance: SectorPerformance[];
}

// Scanner
export interface ScannerFilters {
  priceMin?: number;
  priceMax?: number;
  volumeMin?: number;
  volumeMultiplier?: number;
  deliveryPctMin?: number;
  rsiMin?: number;
  rsiMax?: number;
  macdCrossover?: 'bullish' | 'bearish';
  emaCrossover?: { fast: number; slow: number; direction: 'bullish' | 'bearish' };
  smaCrossover?: { fast: number; slow: number; direction: 'bullish' | 'bearish' };
  vwapSignal?: 'above' | 'below';
  breakout?: '52w_high' | '52w_low' | 'resistance' | 'support';
  momentumMin?: number;
}

export interface Scanner {
  id: string;
  name: string;
  exchange: Exchange;
  filters: ScannerFilters;
  isActive: boolean;
}

export interface ScannerResult {
  symbol: string;
  matchScore: number;
  indicators: Record<string, number>;
  scannedAt: string;
}

// Backtesting
export interface BacktestMetrics {
  cagr: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalReturn: number;
  avgWin: number;
  avgLoss: number;
}

export interface BacktestRun {
  id: string;
  name: string;
  symbols: string[];
  startDate: string;
  endDate: string;
  initialCapital: number;
  status: string;
  metrics?: BacktestMetrics;
}

// AI Recommendations
export interface AIRecommendation {
  id: string;
  symbol: string;
  exchange: Exchange;
  recommendation: OrderSide;
  confidenceScore: number;
  riskScore: number;
  sentimentScore?: number;
  reasoning: string;
  createdAt: string;
}

// WebSocket Events
export type WSEventType =
  | 'quote_update'
  | 'order_update'
  | 'trade_executed'
  | 'signal_generated'
  | 'alert'
  | 'emergency_stop'
  | 'portfolio_update';

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// Broker
export interface BrokerOrderRequest {
  symbol: string;
  exchange: Exchange;
  side: OrderSide;
  orderType: OrderType;
  productType: ProductType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
}

export interface BrokerHoldings {
  symbol: string;
  exchange: Exchange;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

export interface BrokerMargin {
  available: number;
  used: number;
  total: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: { page?: number; limit?: number; total?: number };
}

// Audit
export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'ORDER_PLACED' | 'ORDER_MODIFIED' | 'ORDER_CANCELLED'
  | 'STRATEGY_CREATED' | 'STRATEGY_ACTIVATED' | 'STRATEGY_STOPPED' | 'EMERGENCY_STOP'
  | 'BROKER_CONNECTED' | 'BROKER_DISCONNECTED' | 'SETTINGS_UPDATED' | 'TRADE_EXECUTED';

export interface AuditLog {
  id: string;
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  details: Record<string, unknown>;
  createdAt: string;
}
