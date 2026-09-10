import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role, User } from '@mfe/shared-contracts';
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTokenLoading: boolean;
  login(email: string): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  recoverSession(): Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({
  children,
  identityUrl = 'http://localhost:4001',
  bootstrap,
}: {
  children: ReactNode;
  identityUrl?: string;
  bootstrap?: User | null;
}) {
  const [user, setUser] = useState<User | null>(bootstrap ?? null);
  const [isLoading, setLoading] = useState(bootstrap === undefined);
  const [isTokenLoading, setTokenLoading] = useState(false);
  const recoverSession = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${identityUrl}/session`, { credentials: 'include' });
      setUser(r.ok ? ((await r.json()) as { user: User }).user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [identityUrl]);
  useEffect(() => {
    if (bootstrap === undefined) void recoverSession();
  }, [bootstrap, recoverSession]);
  const login = useCallback(
    async (email: string) => {
      const r = await fetch(`${identityUrl}/session/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error('Login failed');
      setUser(((await r.json()) as { user: User }).user);
    },
    [identityUrl],
  );
  const logout = useCallback(async () => {
    await fetch(`${identityUrl}/session/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  }, [identityUrl]);
  const getAccessToken = useCallback(async () => {
    setTokenLoading(true);
    try {
      const r = await fetch(`${identityUrl}/session/token`, { credentials: 'include' });
      if (r.status === 401) {
        setUser(null);
        return null;
      }
      if (!r.ok) throw new Error('Token request failed');
      return ((await r.json()) as { accessToken: string }).accessToken;
    } finally {
      setTokenLoading(false);
    }
  }, [identityUrl]);
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isTokenLoading,
      login,
      logout,
      getAccessToken,
      recoverSession,
    }),
    [user, isLoading, isTokenLoading, login, logout, getAccessToken, recoverSession],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error('useAuth must be used within the shell-owned AuthProvider');
  return v;
}
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading) return <p role="status">Loading session…</p>;
  return auth.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  return user && roles.some((role) => user.roles.includes(role)) ? (
    <>{children}</>
  ) : (
    <Navigate to="/unauthorized" replace />
  );
}
