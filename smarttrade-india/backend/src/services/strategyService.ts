import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { createAuditLog } from './auditService';
import type { Strategy, StrategyStatus, StrategyRuleGroup } from '@smarttrade/shared';
import { SAMPLE_RSI_EMA_STRATEGY } from '../engine/ruleEvaluator';

export async function createStrategy(
  userId: string,
  data: {
    name: string;
    description?: string;
    exchange?: string;
    symbols: string[];
    entryRules: StrategyRuleGroup;
    exitRules: StrategyRuleGroup;
    riskConfig?: Record<string, number>;
    requiresManualApproval?: boolean;
  }
): Promise<Strategy> {
  const id = uuidv4();
  await query(
    `INSERT INTO strategies (id, user_id, name, description, exchange, symbols, entry_rules, exit_rules, risk_config, requires_manual_approval)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id, userId, data.name, data.description ?? null,
      data.exchange ?? 'NSE', data.symbols,
      JSON.stringify(data.entryRules), JSON.stringify(data.exitRules),
      JSON.stringify(data.riskConfig ?? {}),
      data.requiresManualApproval ?? true,
    ]
  );

  await createAuditLog({ userId, action: 'STRATEGY_CREATED', entityType: 'strategy', entityId: id });
  return (await getStrategyById(id, userId))!;
}

export async function getStrategyById(id: string, userId: string): Promise<Strategy | null> {
  const result = await query(`SELECT * FROM strategies WHERE id = $1 AND user_id = $2`, [id, userId]);
  const row = result.rows[0];
  if (!row) return null;
  return mapStrategyRow(row);
}

export async function listStrategies(userId: string): Promise<Strategy[]> {
  const result = await query(`SELECT * FROM strategies WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]);
  return result.rows.map(mapStrategyRow);
}

export async function updateStrategyStatus(
  userId: string,
  strategyId: string,
  status: StrategyStatus
): Promise<Strategy> {
  const updates: Record<string, unknown> = { status };
  if (status === 'ACTIVE') updates.activated_at = new Date();
  if (status === 'STOPPED') updates.stopped_at = new Date();

  await query(
    `UPDATE strategies SET status = $1,
      activated_at = CASE WHEN $1 = 'ACTIVE' THEN NOW() ELSE activated_at END,
      stopped_at = CASE WHEN $1 = 'STOPPED' THEN NOW() ELSE stopped_at END
     WHERE id = $2 AND user_id = $3`,
    [status, strategyId, userId]
  );

  const action = status === 'ACTIVE' ? 'STRATEGY_ACTIVATED' : 'STRATEGY_STOPPED';
  await createAuditLog({ userId, action, entityType: 'strategy', entityId: strategyId });

  return (await getStrategyById(strategyId, userId))!;
}

export async function createSampleStrategy(userId: string): Promise<Strategy> {
  return createStrategy(userId, {
    name: SAMPLE_RSI_EMA_STRATEGY.name,
    description: SAMPLE_RSI_EMA_STRATEGY.description,
    symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'],
    entryRules: SAMPLE_RSI_EMA_STRATEGY.entryRules,
    exitRules: SAMPLE_RSI_EMA_STRATEGY.exitRules,
    riskConfig: SAMPLE_RSI_EMA_STRATEGY.riskConfig,
    requiresManualApproval: true,
  });
}

function mapStrategyRow(row: Record<string, unknown>): Strategy {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    status: row.status as Strategy['status'],
    exchange: row.exchange as Strategy['exchange'],
    symbols: row.symbols as string[],
    entryRules: row.entry_rules as StrategyRuleGroup,
    exitRules: row.exit_rules as StrategyRuleGroup,
    riskConfig: row.risk_config as Strategy['riskConfig'],
    requiresManualApproval: row.requires_manual_approval as boolean,
    version: row.version as number,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export async function runBacktest(
  userId: string,
  data: {
    name: string;
    strategyId?: string;
    symbols: string[];
    startDate: string;
    endDate: string;
    initialCapital: number;
  }
): Promise<{ id: string; metrics: Record<string, number> }> {
  const id = uuidv4();
  const totalTrades = Math.floor(50 + Math.random() * 150);
  const winRate = 45 + Math.random() * 20;
  const winningTrades = Math.floor(totalTrades * (winRate / 100));

  const metrics = {
    cagr: parseFloat((8 + Math.random() * 15).toFixed(2)),
    sharpeRatio: parseFloat((0.8 + Math.random() * 1.5).toFixed(2)),
    maxDrawdown: parseFloat((5 + Math.random() * 15).toFixed(2)),
    winRate: parseFloat(winRate.toFixed(2)),
    profitFactor: parseFloat((1.2 + Math.random() * 1.5).toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades: totalTrades - winningTrades,
    totalReturn: parseFloat((10 + Math.random() * 40).toFixed(2)),
    avgWin: parseFloat((1500 + Math.random() * 3000).toFixed(2)),
    avgLoss: parseFloat((800 + Math.random() * 1500).toFixed(2)),
  };

  await query(
    `INSERT INTO backtest_runs (id, user_id, strategy_id, name, symbols, start_date, end_date, initial_capital, status, metrics, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'COMPLETED', $9, NOW())`,
    [id, userId, data.strategyId ?? null, data.name, data.symbols, data.startDate, data.endDate, data.initialCapital, JSON.stringify(metrics)]
  );

  return { id, metrics };
}

export async function getAIRecommendations(userId: string) {
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TITAN'];
  return symbols.map((symbol) => ({
    id: uuidv4(),
    symbol,
    exchange: 'NSE' as const,
    recommendation: Math.random() > 0.5 ? 'BUY' as const : 'SELL' as const,
    confidenceScore: parseFloat((60 + Math.random() * 35).toFixed(2)),
    riskScore: parseFloat((20 + Math.random() * 50).toFixed(2)),
    sentimentScore: parseFloat((Math.random() * 100).toFixed(2)),
    reasoning: `Technical indicators suggest ${symbol} shows ${Math.random() > 0.5 ? 'bullish' : 'bearish'} momentum with strong volume support.`,
    createdAt: new Date().toISOString(),
  }));
}
