import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../utils/database';
import { config } from '../config';
import { logger } from '../utils/logger';
import { evaluateRuleGroup, generateSignal, type IndicatorValues } from './ruleEvaluator';
import { getBrokerAdapter } from '../brokers';
import { createAuditLog } from '../services/auditService';
import { getQuote, calculateIndicators } from '../services/marketService';
import { broadcastToUser } from '../websocket/server';
import type { StrategyRuleGroup, OrderSide, BrokerProvider } from '@smarttrade/shared';

interface ActiveStrategy {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  entryRules: StrategyRuleGroup;
  exitRules: StrategyRuleGroup;
  riskConfig: Record<string, number>;
  requiresManualApproval: boolean;
}

let engineRunning = false;
let engineInterval: ReturnType<typeof setInterval> | null = null;

export function startTradingEngine(): void {
  if (engineRunning) return;
  engineRunning = true;
  logger.info('Trading engine started', { intervalMs: config.TRADING_ENGINE_INTERVAL_MS });

  engineInterval = setInterval(async () => {
    try {
      await runEngineCycle();
    } catch (error) {
      logger.error('Trading engine cycle failed', { error });
    }
  }, config.TRADING_ENGINE_INTERVAL_MS);
}

export function stopTradingEngine(): void {
  if (engineInterval) {
    clearInterval(engineInterval);
    engineInterval = null;
  }
  engineRunning = false;
  logger.info('Trading engine stopped');
}

export async function emergencyStopAll(userId: string): Promise<void> {
  await query(
    `UPDATE risk_settings SET emergency_stop_active = true, auto_trading_enabled = false WHERE user_id = $1`,
    [userId]
  );
  await query(
    `UPDATE strategies SET status = 'STOPPED', stopped_at = NOW() WHERE user_id = $1 AND status = 'ACTIVE'`,
    [userId]
  );
  await createAuditLog({
    userId,
    action: 'EMERGENCY_STOP',
    details: { timestamp: new Date().toISOString() },
  });
  broadcastToUser(userId, {
    type: 'emergency_stop',
    payload: { message: 'Emergency stop activated. All automated trading halted.' },
    timestamp: new Date().toISOString(),
  });
  logger.warn('Emergency stop activated', { userId });
}

async function runEngineCycle(): Promise<void> {
  const strategies = await getActiveStrategies();
  for (const strategy of strategies) {
    const riskCheck = await checkRiskLimits(strategy.userId);
    if (!riskCheck.allowed) {
      logger.warn('Risk limit blocked strategy', { strategyId: strategy.id, reason: riskCheck.reason });
      continue;
    }

    for (const symbol of strategy.symbols) {
      await evaluateStrategyForSymbol(strategy, symbol);
    }
  }
}

async function getActiveStrategies(): Promise<ActiveStrategy[]> {
  const result = await query<{
    id: string;
    user_id: string;
    name: string;
    symbols: string[];
    entry_rules: StrategyRuleGroup;
    exit_rules: StrategyRuleGroup;
    risk_config: Record<string, number>;
    requires_manual_approval: boolean;
  }>(
    `SELECT s.* FROM strategies s
     JOIN risk_settings rs ON rs.user_id = s.user_id
     WHERE s.status = 'ACTIVE'
       AND rs.auto_trading_enabled = true
       AND rs.emergency_stop_active = false`
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    symbols: row.symbols,
    entryRules: row.entry_rules,
    exitRules: row.exit_rules,
    riskConfig: row.risk_config,
    requiresManualApproval: row.requires_manual_approval,
  }));
}

async function checkRiskLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const riskResult = await query<{
    max_daily_loss: number;
    max_open_positions: number;
    emergency_stop_active: boolean;
  }>('SELECT * FROM risk_settings WHERE user_id = $1', [userId]);

  const risk = riskResult.rows[0];
  if (!risk || risk.emergency_stop_active) {
    return { allowed: false, reason: 'Emergency stop active' };
  }

  const posResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM positions WHERE user_id = $1 AND quantity > 0',
    [userId]
  );
  const openPositions = parseInt(posResult.rows[0]?.count ?? '0', 10);
  if (openPositions >= risk.max_open_positions) {
    return { allowed: false, reason: 'Max open positions reached' };
  }

  const pnlResult = await query<{ day_pnl: number }>(
    'SELECT day_pnl FROM portfolios WHERE user_id = $1',
    [userId]
  );
  const dayPnl = pnlResult.rows[0]?.day_pnl ?? 0;
  if (dayPnl <= -risk.max_daily_loss) {
    return { allowed: false, reason: 'Daily loss limit reached' };
  }

  return { allowed: true };
}

async function evaluateStrategyForSymbol(strategy: ActiveStrategy, symbol: string): Promise<void> {
  const quote = await getQuote(symbol, 'NSE');
  if (!quote) return;

  const indicators = await calculateIndicators(symbol, 'NSE');
  const position = await getPosition(strategy.userId, symbol);

  const signal = generateSignal(strategy.entryRules, strategy.exitRules, {
    symbol,
    quote,
    indicators,
    position: position ?? undefined,
  });

  if (!signal) return;

  const signalId = uuidv4();
  await query(
    `INSERT INTO strategy_signals (id, strategy_id, symbol, exchange, signal_type, confidence_score, indicators)
     VALUES ($1, $2, $3, 'NSE', $4, $5, $6)`,
    [signalId, strategy.id, symbol, signal, 75, JSON.stringify(indicators)]
  );

  broadcastToUser(strategy.userId, {
    type: 'signal_generated',
    payload: { strategyId: strategy.id, symbol, signal, signalId },
    timestamp: new Date().toISOString(),
  });

  const requiresApproval = strategy.requiresManualApproval || config.REQUIRE_ORDER_APPROVAL;
  if (requiresApproval) {
    await createPendingOrder(strategy, symbol, signal, quote.ltp);
    return;
  }

  await executeOrder(strategy.userId, strategy.id, symbol, signal, quote.ltp, strategy.riskConfig);
}

async function createPendingOrder(
  strategy: ActiveStrategy,
  symbol: string,
  side: OrderSide,
  price: number
): Promise<void> {
  const quantity = calculatePositionSize(strategy.riskConfig, price);
  const orderId = uuidv4();

  await query(
    `INSERT INTO orders (id, user_id, strategy_id, symbol, exchange, side, order_type, quantity, price, status, requires_approval)
     VALUES ($1, $2, $3, $4, 'NSE', $5, 'LIMIT', $6, $7, 'PENDING', true)`,
    [orderId, strategy.userId, strategy.id, symbol, side, quantity, price]
  );

  broadcastToUser(strategy.userId, {
    type: 'order_update',
    payload: { orderId, status: 'PENDING', message: 'Order awaiting your approval' },
    timestamp: new Date().toISOString(),
  });
}

export async function approveOrder(userId: string, orderId: string): Promise<void> {
  const result = await query<{
    id: string;
    strategy_id: string;
    symbol: string;
    side: OrderSide;
    quantity: number;
    price: number;
    status: string;
  }>(
    `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = 'PENDING' AND requires_approval = true`,
    [orderId, userId]
  );

  const order = result.rows[0];
  if (!order) throw Object.assign(new Error('Order not found or not pending approval'), { status: 404 });

  await query(
    `UPDATE orders SET approved_at = NOW(), approved_by = $1 WHERE id = $2`,
    [userId, orderId]
  );

  const strategyResult = await query<{ risk_config: Record<string, number> }>(
    'SELECT risk_config FROM strategies WHERE id = $1',
    [order.strategy_id]
  );

  await executeOrder(
    userId,
    order.strategy_id,
    order.symbol,
    order.side,
    order.price,
    strategyResult.rows[0]?.risk_config ?? {}
  );
}

async function executeOrder(
  userId: string,
  strategyId: string,
  symbol: string,
  side: OrderSide,
  price: number,
  riskConfig: Record<string, number>
): Promise<void> {
  const brokerConn = await getActiveBrokerConnection(userId);
  if (!brokerConn) {
    logger.error('No active broker connection', { userId });
    return;
  }

  const quantity = calculatePositionSize(riskConfig, price);
  const adapter = getBrokerAdapter(brokerConn.provider as BrokerProvider);

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      const { brokerOrderId } = await adapter.placeOrder({
        symbol,
        exchange: 'NSE',
        side,
        orderType: 'MARKET',
        productType: 'CNC',
        quantity,
      });

      await withTransaction(async (client) => {
        const orderId = uuidv4();
        await client.query(
          `INSERT INTO orders (id, user_id, broker_connection_id, strategy_id, broker_order_id, symbol, exchange, side, order_type, product_type, quantity, price, status, requires_approval, placed_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'NSE', $7, 'MARKET', 'CNC', $8, $9, 'COMPLETE', false, NOW())`,
          [orderId, userId, brokerConn.id, strategyId, brokerOrderId, symbol, side, quantity, price]
        );

        await client.query(
          `INSERT INTO trades (user_id, order_id, strategy_id, symbol, exchange, side, quantity, price, net_amount)
           VALUES ($1, $2, $3, $4, 'NSE', $5, $6, $7, $8)`,
          [userId, orderId, strategyId, symbol, side, quantity, price, quantity * price]
        );
      });

      await createAuditLog({
        userId,
        action: 'TRADE_EXECUTED',
        entityType: 'order',
        details: { symbol, side, quantity, price, strategyId },
      });

      broadcastToUser(userId, {
        type: 'trade_executed',
        payload: { symbol, side, quantity, price },
        timestamp: new Date().toISOString(),
      });

      return;
    } catch (error) {
      retries++;
      logger.warn('Order execution retry', { retries, error, symbol });
      if (retries >= maxRetries) {
        await createAuditLog({
          userId,
          action: 'ORDER_PLACED',
          details: { symbol, side, status: 'FAILED', retries },
        });
      }
      await new Promise((r) => setTimeout(r, 1000 * retries));
    }
  }
}

function calculatePositionSize(riskConfig: Record<string, number>, price: number): number {
  const capital = 100000;
  const pct = riskConfig.positionSizePct ?? 10;
  const amount = capital * (pct / 100);
  return Math.max(1, Math.floor(amount / price));
}

async function getPosition(userId: string, symbol: string) {
  const result = await query<{
    quantity: number;
    average_price: number;
    stop_loss: number | null;
    target_price: number | null;
  }>(
    'SELECT quantity, average_price, stop_loss, target_price FROM positions WHERE user_id = $1 AND symbol = $2',
    [userId, symbol]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    quantity: row.quantity,
    averagePrice: row.average_price,
    stopLoss: row.stop_loss ?? undefined,
    targetPrice: row.target_price ?? undefined,
  };
}

async function getActiveBrokerConnection(userId: string) {
  const result = await query<{ id: string; provider: string }>(
    `SELECT id, provider FROM broker_connections WHERE user_id = $1 AND is_active = true AND is_consent_given = true LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}
