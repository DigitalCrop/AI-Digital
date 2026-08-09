import { Router, Request, Response, NextFunction } from 'express';
import { getMarketDashboard, getQuote, searchSymbols, runScanner } from '../services/marketService';

const router = Router();

router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await getMarketDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
});

router.get('/quote/:symbol', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exchange = (req.query.exchange as 'NSE' | 'BSE') ?? 'NSE';
    const quote = await getQuote(String(req.params.symbol), exchange);
    if (!quote) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Symbol not found' } });
      return;
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '');
    const results = await searchSymbols(q);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.post('/scanner/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filters, exchange } = req.body;
    const results = await runScanner(filters ?? {}, exchange ?? 'NSE');
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

export default router;
