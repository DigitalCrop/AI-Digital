import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as strategyService from '../services/strategyService';
import { approveOrder, emergencyStopAll } from '../engine/tradingEngine';
import { orderRateLimiter } from '../middleware/rateLimiter';
import { query } from '../utils/database';
import { encrypt } from '../utils/encryption';
import { getBrokerAdapter } from '../brokers';
import { createAuditLog } from '../services/auditService';
import type { BrokerProvider } from '@smarttrade/shared';

const router = Router();

const strategySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  exchange: z.enum(['NSE', 'BSE']).optional(),
  symbols: z.array(z.string()).min(1),
  entryRules: z.object({
    operator: z.enum(['AND', 'OR']),
    conditions: z.array(z.object({
      id: z.string(),
      field: z.enum([
        'RSI', 'MACD', 'EMA', 'SMA', 'VWAP', 'PRICE', 'VOLUME',
        'DELIVERY_PCT', 'BREAKOUT', 'MOMENTUM', 'STOP_LOSS', 'TARGET',
      ]),
      comparator: z.enum(['>', '<', '>=', '<=', '==', 'crosses_above', 'crosses_below']),
      value: z.union([z.number(), z.string()]),
      period: z.number().optional(),
    })),
  }),
  exitRules: z.object({
    operator: z.enum(['AND', 'OR']),
    conditions: z.array(z.object({
      id: z.string(),
      field: z.enum([
        'RSI', 'MACD', 'EMA', 'SMA', 'VWAP', 'PRICE', 'VOLUME',
        'DELIVERY_PCT', 'BREAKOUT', 'MOMENTUM', 'STOP_LOSS', 'TARGET',
      ]),
      comparator: z.enum(['>', '<', '>=', '<=', '==', 'crosses_above', 'crosses_below']),
      value: z.union([z.number(), z.string()]),
      period: z.number().optional(),
    })),
  }),
  riskConfig: z.record(z.number()).optional(),
  requiresManualApproval: z.boolean().optional(),
});

router.get('/strategies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const strategies = await strategyService.listStrategies(req.user!.userId);
    res.json({ success: true, data: strategies });
  } catch (error) {
    next(error);
  }
});

router.post('/strategies', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = strategySchema.parse(req.body);
    const strategy = await strategyService.createStrategy(req.user!.userId, data);
    res.status(201).json({ success: true, data: strategy });
  } catch (error) {
    next(error);
  }
});

router.post('/strategies/sample', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const strategy = await strategyService.createSampleStrategy(req.user!.userId);
    res.status(201).json({ success: true, data: strategy });
  } catch (error) {
    next(error);
  }
});

router.patch('/strategies/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const strategy = await strategyService.updateStrategyStatus(
      req.user!.userId,
      String(req.params.id),
      req.body.status
    );
    res.json({ success: true, data: strategy });
  } catch (error) {
    next(error);
  }
});

router.post('/orders/:id/approve', orderRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await approveOrder(req.user!.userId, String(req.params.id));
    res.json({ success: true, data: { approved: true } });
  } catch (error) {
    next(error);
  }
});

router.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/positions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT * FROM positions WHERE user_id = $1 AND quantity > 0`,
      [req.user!.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.get('/portfolio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const portfolio = await query(`SELECT * FROM portfolios WHERE user_id = $1`, [req.user!.userId]);
    const holdings = await query(`SELECT * FROM holdings WHERE user_id = $1`, [req.user!.userId]);
    res.json({ success: true, data: { portfolio: portfolio.rows[0], holdings: holdings.rows } });
  } catch (error) {
    next(error);
  }
});

router.get('/risk-settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(`SELECT * FROM risk_settings WHERE user_id = $1`, [req.user!.userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/risk-settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const d = req.body;
    await query(
      `UPDATE risk_settings SET
        capital_allocation_pct = COALESCE($2, capital_allocation_pct),
        max_daily_loss = COALESCE($3, max_daily_loss),
        max_open_positions = COALESCE($4, max_open_positions),
        default_position_size_pct = COALESCE($5, default_position_size_pct),
        auto_trading_enabled = COALESCE($6, auto_trading_enabled)
       WHERE user_id = $1`,
      [userId, d.capitalAllocationPct, d.maxDailyLoss, d.maxOpenPositions, d.defaultPositionSizePct, d.autoTradingEnabled]
    );
    await createAuditLog({ userId, action: 'SETTINGS_UPDATED', details: d });
    const result = await query(`SELECT * FROM risk_settings WHERE user_id = $1`, [userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

router.post('/emergency-stop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await emergencyStopAll(req.user!.userId);
    res.json({ success: true, data: { stopped: true } });
  } catch (error) {
    next(error);
  }
});

router.post('/brokers/connect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, apiKey, apiSecret, clientId, consentGiven } = req.body;
    const userId = req.user!.userId;

    if (!consentGiven) {
      res.status(400).json({
        success: false,
        error: { code: 'CONSENT_REQUIRED', message: 'Broker consent is required before connecting' },
      });
      return;
    }

    const adapter = getBrokerAdapter(provider as BrokerProvider);
    await adapter.connect({ apiKey, apiSecret, clientId });

    await query(
      `INSERT INTO broker_connections (user_id, provider, client_id, api_key_encrypted, api_secret_encrypted, is_active, is_consent_given, consent_given_at)
       VALUES ($1, $2, $3, $4, $5, true, true, NOW())
       ON CONFLICT (user_id, provider) DO UPDATE SET
         api_key_encrypted = $4, api_secret_encrypted = $5, is_active = true, is_consent_given = true, consent_given_at = NOW()`,
      [userId, provider, clientId, encrypt(apiKey), apiSecret ? encrypt(apiSecret) : null]
    );

    await createAuditLog({ userId, action: 'BROKER_CONNECTED', details: { provider } });
    res.json({ success: true, data: { connected: true, provider } });
  } catch (error) {
    next(error);
  }
});

router.post('/backtest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await strategyService.runBacktest(req.user!.userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recommendations = await strategyService.getAIRecommendations(req.user!.userId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
});

export default router;
