import type {
  BrokerProvider,
  BrokerOrderRequest,
  BrokerHoldings,
  BrokerMargin,
  Order,
  Exchange,
} from '@smarttrade/shared';

export interface BrokerAdapter {
  readonly provider: BrokerProvider;
  connect(credentials: BrokerCredentials): Promise<void>;
  disconnect(): Promise<void>;
  placeOrder(order: BrokerOrderRequest): Promise<{ brokerOrderId: string }>;
  modifyOrder(brokerOrderId: string, updates: Partial<BrokerOrderRequest>): Promise<void>;
  cancelOrder(brokerOrderId: string): Promise<void>;
  getOrderStatus(brokerOrderId: string): Promise<{ status: string; filledQty: number; avgPrice: number }>;
  getHoldings(): Promise<BrokerHoldings[]>;
  getPositions(): Promise<BrokerHoldings[]>;
  getMargins(): Promise<BrokerMargin>;
  refreshToken?(): Promise<void>;
}

export interface BrokerCredentials {
  apiKey: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
}

export abstract class BaseBrokerAdapter implements BrokerAdapter {
  abstract readonly provider: BrokerProvider;
  protected credentials: BrokerCredentials | null = null;
  protected connected = false;

  async connect(credentials: BrokerCredentials): Promise<void> {
    this.credentials = credentials;
    await this.authenticate();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.credentials = null;
  }

  protected ensureConnected(): void {
    if (!this.connected || !this.credentials) {
      throw new Error(`Broker ${this.provider} not connected`);
    }
  }

  protected abstract authenticate(): Promise<void>;
  abstract placeOrder(order: BrokerOrderRequest): Promise<{ brokerOrderId: string }>;
  abstract modifyOrder(brokerOrderId: string, updates: Partial<BrokerOrderRequest>): Promise<void>;
  abstract cancelOrder(brokerOrderId: string): Promise<void>;
  abstract getOrderStatus(brokerOrderId: string): Promise<{ status: string; filledQty: number; avgPrice: number }>;
  abstract getHoldings(): Promise<BrokerHoldings[]>;
  abstract getPositions(): Promise<BrokerHoldings[]>;
  abstract getMargins(): Promise<BrokerMargin>;
}
