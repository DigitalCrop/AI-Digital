import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useEffect } from 'react';
import { useMarketStore } from '../store';
import TradingChart from '../components/charts/TradingChart';
import { tradingColors } from '../theme';

function ChangeIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? tradingColors.profit : tradingColors.loss }}>
      {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
      <Typography variant="body2" fontWeight={600}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const { dashboard, fetchDashboard } = useMarketStore();

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (!dashboard) {
    // Show loading skeleton while dashboard data is not available
    return <Skeleton variant="rectangular" height={400} />;
  }

  const d = dashboard;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Market Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {d.indices.map((idx) => (
          <Grid item xs={12} sm={4} key={idx.symbol}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{idx.name}</Typography>
                <Typography variant="h5" fontWeight={700}>{idx.ltp.toLocaleString('en-IN')}</Typography>
                <ChangeIndicator value={idx.changePct} />
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Market Breadth</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip label={`↑ ${d.breadth.advances}`} color="success" size="small" />
                <Chip label={`↓ ${d.breadth.declines}`} color="error" size="small" />
                <Chip label={`A/D ${d.breadth.advanceDeclineRatio}`} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>NIFTY 50 Chart</Typography>
          <TradingChart symbol="NIFTY50" height={350} />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">Top Gainers</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">LTP</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.topGainers.map((s) => (
                    <TableRow key={s.symbol}>
                      <TableCell>{s.symbol}</TableCell>
                      <TableCell align="right">{s.ltp.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: tradingColors.profit }}>+{s.changePct.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error.main">Top Losers</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">LTP</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.topLosers.map((s) => (
                    <TableRow key={s.symbol}>
                      <TableCell>{s.symbol}</TableCell>
                      <TableCell align="right">{s.ltp.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: tradingColors.loss }}>{s.changePct.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sector Performance</Typography>
              {d.sectorPerformance.map((sec) => (
                <Box key={sec.sector} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2">{sec.sector}</Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={sec.changePct >= 0 ? tradingColors.profit : tradingColors.loss}
                  >
                    {sec.changePct >= 0 ? '+' : ''}{sec.changePct}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
