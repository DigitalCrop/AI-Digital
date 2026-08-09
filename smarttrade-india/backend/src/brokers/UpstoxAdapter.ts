import { BaseBrokerAdapter } from './BrokerAdapter';
import type { BrokerOrderRequest, BrokerHoldings, BrokerMargin } from '@smarttrade/shared';
import { logger } from '../utils/logger';

export class UpstoxAdapter extends BaseBrokerAdapter {
  readonly provider = 'UPSTOX' as const;

  protected async authenticate(): Promise<void> {
    logger.info('Upstox: Authenticating');
  }

  async placeOrder(order: BrokerOrderRequest): Promise<{ brokerOrderId: string }> {
    this.ensureConnected();
    return { brokerOrderId: `UPSTOX-${Date.now()}` };
  }

  async modifyOrder(brokerOrderId: string): Promise<void> {
    this.ensureConnected();
    logger.info('Upstox: Modifying', { brokerOrderId });
  }

  async cancelOrder(brokerOrderId: string): Promise<void> {
    this.ensureConnected();
  }

  async getOrderStatus(): Promise<{ status: string; filledQty: number; avgPrice: number }> {
    return { status: 'COMPLETE', filledQty: 0, avgPrice: 0 };
  }

  async getHoldings(): Promise<BrokerHoldings[]> { return []; }
  async getPositions(): Promise<BrokerHoldings[]> { return []; }
  async getMargins(): Promise<BrokerMargin> {
    return { available: 100000, used: 0, total: 100000 };
  }
}

export class AngelOneAdapter extends BaseBrokerAdapter {
  readonly provider = 'ANGEL_ONE' as const;

  protected async authenticate(): Promise<void> {
    logger.info('Angel One: Authenticating via SmartAPI');
  }

  async placeOrder(order: BrokerOrderRequest): Promise<{ brokerOrderId: string }> {
    this.ensureConnected();
    return { brokerOrderId: `ANGEL-${Date.now()}` };
  }

  async modifyOrder(): Promise<void> { this.ensureConnected(); }
  async cancelOrder(): Promise<void> { this.ensureConnected(); }
  async getOrderStatus(): Promise<{ status: string; filledQty: number; avgPrice: number }> {
    return { status: 'COMPLETE', filledQty: 0, avgPrice: 0 };
  }
  async getHoldings(): Promise<BrokerHoldings[]> { return []; }
  async getPositions(): Promise<BrokerHoldings[]> { return []; }
  async getMargins(): Promise<BrokerMargin> {
    return { available: 100000, used: 0, total: 100000 };
  }
}

export class ICICIDirectAdapter extends BaseBrokerAdapter {
  readonly provider = 'ICICI_DIRECT' as const;

  protected async authenticate(): Promise<void> {
    logger.info('ICICI Direct: Authenticating');
  }

  async placeOrder(order: BrokerOrderRequest): Promise<{ brokerOrderId: string }> {
    this.ensureConnected();
    return { brokerOrderId: `ICICI-${Date.now()}` };
  }

  async modifyOrder(): Promise<void> { this.ensureConnected(); }
  async cancelOrder(): Promise<void> { this.ensureConnected(); }
  async getOrderStatus(): Promise<{ status: string; filledQty: number; avgPrice: number }> {
    return { status: 'COMPLETE', filledQty: 0, avgPrice: 0 };
  }
  async getHoldings(): Promise<BrokerHoldings[]> { return []; }
  async getPositions(): Promise<BrokerHoldings[]> { return []; }
  async getMargins(): Promise<BrokerMargin> {
    return { available: 100000, used: 0, total: 100000 };
  }
}
