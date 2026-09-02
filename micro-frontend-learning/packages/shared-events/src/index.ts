export interface AppEvents {
  'order-created': { orderId: string; productId: string; quantity: number; occurredAt: string };
}
type EventName = keyof AppEvents;
const fallbackTarget = new EventTarget();
const target = () => (typeof window === 'undefined' ? fallbackTarget : window);
export function publish<K extends EventName>(name: K, detail: AppEvents[K]) {
  target().dispatchEvent(new CustomEvent(name, { detail }));
}
export function subscribe<K extends EventName>(name: K, listener: (detail: AppEvents[K]) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<AppEvents[K]>).detail);
  target().addEventListener(name, handler);
  return () => target().removeEventListener(name, handler);
}
