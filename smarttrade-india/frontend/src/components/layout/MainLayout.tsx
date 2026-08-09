import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Badge, Chip, Button,
  useMediaQuery, Tooltip,
} from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/ManageSearch';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CircleIcon from '@mui/icons-material/Circle';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useAuthStore, useThemeStore, useTradingStore, useWSStore } from '../../store';

const DRAWER_WIDTH = 240;

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/scanner', label: 'Scanner', icon: <SearchIcon /> },
  { path: '/strategy', label: 'Strategy Builder', icon: <AutoGraphIcon /> },
  { path: '/automation', label: 'Automation Center', icon: <SmartToyIcon /> },
  { path: '/portfolio', label: 'Portfolio', icon: <AccountBalanceWalletIcon /> },
  { path: '/orders', label: 'Orders', icon: <ReceiptLongIcon /> },
  { path: '/positions', label: 'Positions', icon: <TrendingUpIcon /> },
  { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { path: '/backtesting', label: 'Backtesting', icon: <HistoryIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const { mode, toggleMode } = useThemeStore();
  const { emergencyStopActive, triggerEmergencyStop } = useTradingStore();
  const wsConnected = useWSStore((s) => s.connected);

  const drawer = (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" color="primary" fontWeight={700}>
          SmartTrade
        </Typography>
        <Chip label="India" size="small" color="secondary" sx={{ ml: 'auto', fontSize: '0.65rem' }} />
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary' }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            NSE/BSE Live Trading Terminal
          </Typography>

          <Tooltip title={wsConnected ? 'WebSocket Connected' : 'Disconnected'}>
            <CircleIcon sx={{ fontSize: 10, mr: 2, color: wsConnected ? 'success.main' : 'error.main' }} />
          </Tooltip>

          <IconButton onClick={toggleMode} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<StopCircleIcon />}
            onClick={triggerEmergencyStop}
            disabled={emergencyStopActive}
            sx={{ mr: 2 }}
          >
            {emergencyStopActive ? 'STOPPED' : 'Emergency Stop'}
          </Button>

          <Badge color="primary" variant="dot" invisible={!user}>
            <Typography variant="body2">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </Typography>
          </Badge>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              mt: '64px',
              height: 'calc(100% - 64px)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
