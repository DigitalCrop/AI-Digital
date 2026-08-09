import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, MarketDashboard, RiskSettings } from '@smarttrade/shared';
import { apiPost, apiGet, apiPut } from '../services/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      login: async (email, password, totpCode) => {
        const result = await apiPost<{ user: User; tokens: AuthTokens }>('/auth/login', {
          email, password, totpCode,
        });
        localStorage.setItem('accessToken', result.tokens.accessToken);
        localStorage.setItem('refreshToken', result.tokens.refreshToken);
        set({ user: result.user, tokens: result.tokens, isAuthenticated: true });
      },

      register: async (data) => {
        const result = await apiPost<{ user: User; tokens: AuthTokens }>('/auth/register', data);
        localStorage.setItem('accessToken', result.tokens.accessToken);
        localStorage.setItem('refreshToken', result.tokens.refreshToken);
        set({ user: result.user, tokens: result.tokens, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        const user = await apiGet<User>('/auth/me');
        set({ user, isAuthenticated: true });
      },
    }),
    { name: 'smarttrade-auth', partialize: (s) => ({ tokens: s.tokens }) }
  )
);

interface MarketState {
  dashboard: MarketDashboard | null;
  loading: boolean;
  fetchDashboard: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set) => ({
  dashboard: null,
  loading: false,
  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const dashboard = await apiGet<MarketDashboard>('/market/dashboard');
      set({ dashboard, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

interface TradingState {
  emergencyStopActive: boolean;
  autoTradingEnabled: boolean;
  pendingOrders: number;
  setEmergencyStop: (active: boolean) => void;
  fetchRiskSettings: () => Promise<void>;
  triggerEmergencyStop: () => Promise<void>;
  updateRiskSettings: (settings: Partial<RiskSettings>) => Promise<void>;
}

export const useTradingStore = create<TradingState>((set) => ({
  emergencyStopActive: false,
  autoTradingEnabled: false,
  pendingOrders: 0,

  setEmergencyStop: (active) => set({ emergencyStopActive: active }),

  fetchRiskSettings: async () => {
    const settings = await apiGet<Record<string, unknown>>('/trading/risk-settings');
    set({
      emergencyStopActive: Boolean(settings.emergency_stop_active),
      autoTradingEnabled: Boolean(settings.auto_trading_enabled),
    });
  },

  triggerEmergencyStop: async () => {
    await apiPost('/trading/emergency-stop');
    set({ emergencyStopActive: true, autoTradingEnabled: false });
  },

  updateRiskSettings: async (settings) => {
    await apiPut('/trading/risk-settings', settings);
    await useTradingStore.getState().fetchRiskSettings();
  },
}));

interface ThemeState {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'smarttrade-theme' }
  )
);

interface WSState {
  connected: boolean;
  lastMessage: unknown;
  connect: (token: string) => void;
  disconnect: () => void;
}

let wsInstance: WebSocket | null = null;

export const useWSStore = create<WSState>((set) => ({
  connected: false,
  lastMessage: null,

  connect: (token) => {
    if (wsInstance?.readyState === WebSocket.OPEN) return;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/smarttrade/ws?token=${token}`;
    wsInstance = new WebSocket(wsUrl);
    wsInstance.onopen = () => set({ connected: true });
    wsInstance.onclose = () => set({ connected: false });
    wsInstance.onmessage = (event) => {
      const message = JSON.parse(event.data);
      set({ lastMessage: message });
      if (message.type === 'emergency_stop') {
        useTradingStore.getState().setEmergencyStop(true);
      }
    };
  },

  disconnect: () => {
    wsInstance?.close();
    wsInstance = null;
    set({ connected: false });
  },
}));
