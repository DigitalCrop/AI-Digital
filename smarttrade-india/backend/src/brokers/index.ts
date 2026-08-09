import type { BrokerProvider } from '@smarttrade/shared';
import type { BrokerAdapter } from './BrokerAdapter';
import { ZerodhaAdapter } from './ZerodhaAdapter';
import { UpstoxAdapter, AngelOneAdapter, ICICIDirectAdapter } from './UpstoxAdapter';

const adapterInstances = new Map<BrokerProvider, BrokerAdapter>();

export function getBrokerAdapter(provider: BrokerProvider): BrokerAdapter {
  if (!adapterInstances.has(provider)) {
    const adapter = createAdapter(provider);
    adapterInstances.set(provider, adapter);
  }
  return adapterInstances.get(provider)!;
}

function createAdapter(provider: BrokerProvider): BrokerAdapter {
  switch (provider) {
    case 'ZERODHA':
      return new ZerodhaAdapter();
    case 'UPSTOX':
      return new UpstoxAdapter();
    case 'ANGEL_ONE':
      return new AngelOneAdapter();
    case 'ICICI_DIRECT':
      return new ICICIDirectAdapter();
    case 'GROWW':
      throw new Error('Groww integration coming soon');
    default:
      throw new Error(`Unknown broker: ${provider}`);
  }
}

export { ZerodhaAdapter, UpstoxAdapter, AngelOneAdapter, ICICIDirectAdapter };
