import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect } from 'react';
import { getTheme } from './theme';
import { useAuthStore, useThemeStore, useWSStore } from './store';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import StrategyBuilderPage from './pages/StrategyBuilderPage';
import AutomationCenterPage from './pages/AutomationCenterPage';
import PortfolioPage from './pages/PortfolioPage';
import OrdersPage from './pages/OrdersPage';
import PositionsPage from './pages/PositionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BacktestingPage from './pages/BacktestingPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tokens = useAuthStore((s) => s.tokens);

  if (!isAuthenticated && !tokens && !localStorage.getItem('accessToken')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const connect = useWSStore((s) => s.connect);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetchUser().catch(() => {});
      connect(token);
    }
  }, [fetchUser, connect]);

  return <>{children}</>;
}

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppInitializer>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="strategy" element={<StrategyBuilderPage />} />
              <Route path="automation" element={<AutomationCenterPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="positions" element={<PositionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="backtesting" element={<BacktestingPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AppInitializer>
      </BrowserRouter>
    </ThemeProvider>
  );
}
