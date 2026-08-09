import type { StockQuote, IndexQuote, MarketDashboard, MarketBreadth, SectorPerformance, Exchange } from '@smarttrade/shared';
import { cacheGet, cacheSet } from '../utils/redis';
import type { IndicatorValues } from '../engine/ruleEvaluator';

const NIFTY50_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'ITC', 'SBIN',
  'BHARTIARTL', 'KOTAKBANK', 'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'TITAN',
  'BAJFINANCE', 'HCLTECH', 'WIPRO', 'ULTRACEMCO', 'NESTLEIND',
];

const BASE_PRICES: Record<string, number> = {
  RELIANCE: 2435,
  TCS: 3300,
  HDFCBANK: 1660,
  INFY: 1720,
  ICICIBANK: 880,
  HINDUNILVR: 2500,
  ITC: 450,
  SBIN: 560,
  BHARTIARTL: 720,
  KOTAKBANK: 1890,
  LT: 2850,
  AXISBANK: 760,
  ASIANPAINT: 3400,
  MARUTI: 8500,
  TITAN: 3000,
  BAJFINANCE: 6500,
  HCLTECH: 1020,
  WIPRO: 390,
  ULTRACEMCO: 4300,
  NESTLEIND: 24000,
};

const BASE_VOLATILITY: Record<string, number> = {
  RELIANCE: 0.015,
  TCS: 0.012,
  HDFCBANK: 0.018,
  INFY: 0.013,
  ICICIBANK: 0.02,
  HINDUNILVR: 0.01,
  ITC: 0.017,
  SBIN: 0.022,
  BHARTIARTL: 0.018,
  KOTAKBANK: 0.016,
  LT: 0.014,
  AXISBANK: 0.02,
  ASIANPAINT: 0.013,
  MARUTI: 0.015,
  TITAN: 0.014,
  BAJFINANCE: 0.017,
  HCLTECH: 0.015,
  WIPRO: 0.02,
  ULTRACEMCO: 0.013,
  NESTLEIND: 0.011,
};

function generateMockQuote(symbol: string, exchange: Exchange = 'NSE'): StockQuote {
  const basePrice = BASE_PRICES[symbol] ?? 500;
  const volatility = BASE_VOLATILITY[symbol] ?? 0.015;
  const change = basePrice * volatility * (Math.random() - 0.5);
  const open = basePrice;
  const ltp = parseFloat((open + change).toFixed(2));
  const high = parseFloat((Math.max(open, ltp) + Math.abs(change) * 0.7).toFixed(2));
  const low = parseFloat((Math.min(open, ltp) - Math.abs(change) * 0.7).toFixed(2));
  const close = parseFloat(open.toFixed(2));
  const changePct = parseFloat(((ltp - close) / close * 100).toFixed(2));

  return {
    symbol,
    exchange,
    name: symbol,
    ltp,
    change: parseFloat((ltp - close).toFixed(2)),
    changePct,
    open,
    high,
    low,
    close,
    volume: Math.floor(500000 + Math.random() * 2500000),
    deliveryPct: parseFloat((10 + Math.random() * 15).toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

export async function getQuote(symbol: string, exchange: Exchange = 'NSE'): Promise<StockQuote | null> {
  const cacheKey = `quote:${exchange}:${symbol}`;
  const cached = await cacheGet<StockQuote>(cacheKey);
  if (cached) return cached;

  const quote = generateMockQuote(symbol, exchange);
  await cacheSet(cacheKey, quote, 5);
  return quote;
}

export async function getIndexQuote(indexSymbol: string): Promise<IndexQuote> {
  const baseValues: Record<string, number> = {
    NIFTY50: 24500,
    BANKNIFTY: 52000,
    SENSEX: 80500,
  };
  const base = baseValues[indexSymbol] ?? 20000;
  const change = (Math.random() - 0.5) * 200;
  return {
    symbol: indexSymbol,
    name: indexSymbol,
    ltp: parseFloat((base + change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(((change / base) * 100).toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

export async function getMarketDashboard(): Promise<MarketDashboard> {
  const cached = await cacheGet<MarketDashboard>('market:dashboard');
  if (cached) return cached;

  const allQuotes = (await Promise.all(NIFTY50_SYMBOLS.map((s) => getQuote(s))))
    .filter((quote): quote is StockQuote => quote !== null);
  const sorted = [...allQuotes].sort((a, b) => b.changePct - a.changePct);

  const dashboard: MarketDashboard = {
    indices: await Promise.all(['NIFTY50', 'BANKNIFTY', 'SENSEX'].map(getIndexQuote)),
    breadth: getMarketBreadth(),
    topGainers: sorted.slice(0, 5),
    topLosers: sorted.slice(-5).reverse(),
    volumeMovers: [...allQuotes].sort((a, b) => b.volume - a.volume).slice(0, 5),
    sectorPerformance: getSectorPerformance(),
  };

  await cacheSet('market:dashboard', dashboard, 10);
  return dashboard;
}

function getMarketBreadth(): MarketBreadth {
  const advances = Math.floor(1200 + Math.random() * 400);
  const declines = Math.floor(800 + Math.random() * 400);
  const unchanged = Math.floor(50 + Math.random() * 100);
  return {
    advances,
    declines,
    unchanged,
    advanceDeclineRatio: parseFloat((advances / declines).toFixed(2)),
    timestamp: new Date().toISOString(),
  };
}

function getSectorPerformance(): SectorPerformance[] {
  const sectors = ['IT', 'Banking', 'Pharma', 'Auto', 'FMCG', 'Metal', 'Energy', 'Realty'];
  return sectors.map((sector) => ({
    sector,
    changePct: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
    topGainer: NIFTY50_SYMBOLS[Math.floor(Math.random() * NIFTY50_SYMBOLS.length)],
    topLoser: NIFTY50_SYMBOLS[Math.floor(Math.random() * NIFTY50_SYMBOLS.length)],
  }));
}

export async function calculateIndicators(symbol: string, exchange: Exchange): Promise<IndicatorValues> {
  const quote = await getQuote(symbol, exchange);
  if (!quote) return {};

  return {
    rsi: parseFloat((20 + Math.random() * 60).toFixed(2)),
    macd: {
      macd: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      signal: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      histogram: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
    },
    ema: { 9: quote.ltp * 0.99, 20: quote.ltp * 0.98, 50: quote.ltp * 0.95 },
    sma: { 20: quote.ltp * 0.97, 50: quote.ltp * 0.94, 200: quote.ltp * 0.90 },
    vwap: parseFloat((quote.ltp * (0.98 + Math.random() * 0.04)).toFixed(2)),
    price: quote.ltp,
    volume: quote.volume,
    avgVolume: quote.volume * 0.6,
    deliveryPct: quote.deliveryPct,
    momentum: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
    high52w: quote.ltp * 1.15,
    low52w: quote.ltp * 0.75,
  };
}

export async function searchSymbols(query: string): Promise<StockQuote[]> {
  const upper = query.toUpperCase();
  const matches = NIFTY50_SYMBOLS.filter((s) => s.includes(upper)).slice(0, 10);
  const quotes = await Promise.all(matches.map((s) => getQuote(s)));
  return quotes.filter((quote): quote is StockQuote => quote !== null);
}

export async function runScanner(
  filters: Record<string, unknown>,
  exchange: Exchange = 'NSE'
): Promise<{ symbol: string; matchScore: number; indicators: IndicatorValues }[]> {
  const results = [];
  for (const symbol of NIFTY50_SYMBOLS) {
    const quote = await getQuote(symbol, exchange);
    const indicators = await calculateIndicators(symbol, exchange);
    if (!quote) continue;

    let score = 0;
    if (filters.priceMin && quote.ltp < Number(filters.priceMin)) continue;
    if (filters.priceMax && quote.ltp > Number(filters.priceMax)) continue;
    if (filters.rsiMax && indicators.rsi && indicators.rsi > Number(filters.rsiMax)) continue;
    if (filters.rsiMin && indicators.rsi && indicators.rsi < Number(filters.rsiMin)) continue;
    if (filters.volumeMultiplier && indicators.avgVolume) {
      if (quote.volume < indicators.avgVolume * Number(filters.volumeMultiplier)) continue;
      score += 30;
    }
    if (indicators.rsi && indicators.rsi < 30) score += 25;
    if (indicators.rsi && indicators.rsi > 70) score += 15;
    score += Math.random() * 20;

    results.push({ symbol, matchScore: parseFloat(score.toFixed(2)), indicators });
  }
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
