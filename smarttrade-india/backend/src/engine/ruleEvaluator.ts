import type {
  StrategyCondition,
  StrategyRuleGroup,
  StockQuote,
  OrderSide,
} from '@smarttrade/shared';

export interface IndicatorValues {
  rsi?: number;
  macd?: { macd: number; signal: number; histogram: number };
  ema?: Record<number, number>;
  sma?: Record<number, number>;
  vwap?: number;
  price?: number;
  volume?: number;
  avgVolume?: number;
  deliveryPct?: number;
  momentum?: number;
  high52w?: number;
  low52w?: number;
}

export interface EvaluationContext {
  symbol: string;
  quote: StockQuote;
  indicators: IndicatorValues;
  position?: { quantity: number; averagePrice: number; stopLoss?: number; targetPrice?: number };
}

export function evaluateCondition(
  condition: StrategyCondition,
  ctx: EvaluationContext
): boolean {
  const { field, comparator, value, period } = condition;

  let actual: number | undefined;

  switch (field) {
    case 'RSI':
      actual = ctx.indicators.rsi;
      break;
    case 'MACD':
      return evaluateMacdCrossover(comparator, ctx.indicators.macd);
    case 'EMA':
      actual = period ? ctx.indicators.ema?.[period] : undefined;
      break;
    case 'SMA':
      actual = period ? ctx.indicators.sma?.[period] : undefined;
      break;
    case 'VWAP':
      actual = ctx.indicators.vwap;
      if (comparator === 'crosses_above' || comparator === 'crosses_below') {
        if (actual === undefined) return false;
        return compareValues(ctx.quote.ltp, actual, comparator === 'crosses_above' ? '>' : '<');
      }
      break;
    case 'PRICE':
      actual = ctx.quote.ltp;
      break;
    case 'VOLUME':
      actual = ctx.indicators.avgVolume
        ? ctx.quote.volume / ctx.indicators.avgVolume
        : ctx.quote.volume;
      break;
    case 'DELIVERY_PCT':
      actual = ctx.indicators.deliveryPct;
      break;
    case 'MOMENTUM':
      actual = ctx.indicators.momentum;
      break;
    case 'BREAKOUT':
      return evaluateBreakout(String(value), ctx);
    case 'STOP_LOSS':
      if (ctx.position?.stopLoss) {
        return ctx.quote.ltp <= ctx.position.stopLoss;
      }
      return false;
    case 'TARGET':
      if (ctx.position?.targetPrice) {
        return ctx.quote.ltp >= ctx.position.targetPrice;
      }
      return false;
  }

  if (actual === undefined) return false;
  const target = typeof value === 'number' ? value : parseFloat(String(value));
  return compareValues(actual, target, comparator);
}

function compareValues(
  actual: number,
  target: number,
  comparator: StrategyCondition['comparator']
): boolean {
  switch (comparator) {
    case '>': return actual > target;
    case '<': return actual < target;
    case '>=': return actual >= target;
    case '<=': return actual <= target;
    case '==': return Math.abs(actual - target) < 0.001;
    default: return false;
  }
}

function evaluateMacdCrossover(
  comparator: StrategyCondition['comparator'],
  macd?: IndicatorValues['macd']
): boolean {
  if (!macd) return false;
  const bullish = macd.histogram > 0 && macd.macd > macd.signal;
  const bearish = macd.histogram < 0 && macd.macd < macd.signal;
  if (comparator === 'crosses_above') return bullish;
  if (comparator === 'crosses_below') return bearish;
  return false;
}

function evaluateBreakout(type: string, ctx: EvaluationContext): boolean {
  const { quote, indicators } = ctx;
  switch (type) {
    case '52w_high':
      return indicators.high52w ? quote.ltp >= indicators.high52w : false;
    case '52w_low':
      return indicators.low52w ? quote.ltp <= indicators.low52w : false;
    default:
      return false;
  }
}

export function evaluateRuleGroup(
  group: StrategyRuleGroup,
  ctx: EvaluationContext
): boolean {
  const results = group.conditions.map((c) => evaluateCondition(c, ctx));
  return group.operator === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

export function generateSignal(
  entryRules: StrategyRuleGroup,
  exitRules: StrategyRuleGroup,
  ctx: EvaluationContext
): OrderSide | null {
  if (ctx.position && ctx.position.quantity > 0) {
    if (evaluateRuleGroup(exitRules, ctx)) return 'SELL';
    return null;
  }
  if (evaluateRuleGroup(entryRules, ctx)) return 'BUY';
  return null;
}

// Sample RSI + EMA + Volume strategy
export const SAMPLE_RSI_EMA_STRATEGY = {
  name: 'RSI EMA Volume Strategy',
  description: 'Buy when RSI < 30, price above 20 EMA, volume > 2x average. Sell when RSI > 70 or stop loss/target hit.',
  entryRules: {
    operator: 'AND' as const,
    conditions: [
      { id: '1', field: 'RSI' as const, comparator: '<' as const, value: 30, period: 14 },
      { id: '2', field: 'PRICE' as const, comparator: '>' as const, value: 0, period: 20 },
      { id: '3', field: 'VOLUME' as const, comparator: '>' as const, value: 2 },
    ],
  },
  exitRules: {
    operator: 'OR' as const,
    conditions: [
      { id: '4', field: 'RSI' as const, comparator: '>' as const, value: 70, period: 14 },
      { id: '5', field: 'STOP_LOSS' as const, comparator: '<=' as const, value: 0 },
      { id: '6', field: 'TARGET' as const, comparator: '>=' as const, value: 0 },
    ],
  },
  riskConfig: {
    stopLossPct: 2,
    targetPct: 4,
    trailingStopPct: 1,
    positionSizePct: 10,
  },
};
