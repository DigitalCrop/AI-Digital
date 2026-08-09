import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Table,
  TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { useState } from 'react';
import { apiPost } from '../services/api';
import type { BacktestMetrics } from '@smarttrade/shared';

export default function BacktestingPage() {
  const [name, setName] = useState('RSI Strategy Backtest');
  const [symbols, setSymbols] = useState('RELIANCE,TCS,INFY');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-01-01');
  const [capital, setCapital] = useState(100000);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const result = await apiPost<{ id: string; metrics: BacktestMetrics }>('/trading/backtest', {
        name, symbols: symbols.split(',').map((s) => s.trim()), startDate, endDate, initialCapital: capital,
      });
      setMetrics(result.metrics);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Backtesting</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Backtest Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Symbols" value={symbols} onChange={(e) => setSymbols(e.target.value)} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth label="Start Date" type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth label="End Date" type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Initial Capital" type="number" value={capital}
                onChange={(e) => setCapital(+e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={runBacktest} disabled={loading}>
                {loading ? 'Running...' : 'Run Backtest'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {metrics && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Results</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ['CAGR', `${metrics.cagr}%`],
                  ['Sharpe Ratio', metrics.sharpeRatio],
                  ['Max Drawdown', `${metrics.maxDrawdown}%`],
                  ['Win Rate', `${metrics.winRate}%`],
                  ['Profit Factor', metrics.profitFactor],
                  ['Total Trades', metrics.totalTrades],
                  ['Total Return', `${metrics.totalReturn}%`],
                ].map(([label, value]) => (
                  <TableRow key={String(label)}>
                    <TableCell>{label}</TableCell>
                    <TableCell align="right">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
