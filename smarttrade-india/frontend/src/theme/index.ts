import { createTheme, alpha } from '@mui/material/styles';

const tradingColors = {
  profit: '#00C853',
  loss: '#FF1744',
  warning: '#FF9100',
  buy: '#00E676',
  sell: '#FF5252',
};

export function getTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#42A5F5' : '#1565C0' },
      secondary: { main: isDark ? '#AB47BC' : '#7B1FA2' },
      success: { main: tradingColors.profit },
      error: { main: tradingColors.loss },
      warning: { main: tradingColors.warning },
      background: {
        default: isDark ? '#0A0E17' : '#F5F7FA',
        paper: isDark ? '#131A2B' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#E8EDF5' : '#1A1A2E',
        secondary: isDark ? '#8892A4' : '#5A6478',
      },
      divider: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.08),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      body2: { fontSize: '0.8125rem' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? '#334155 #0A0E17' : '#CBD5E1 #F5F7FA',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderBottom: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.08)}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.08)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06)}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.06) },
        },
      },
    },
  });
}

export { tradingColors };
