import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableHead, TableRow, Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useState } from 'react';
import { apiPost } from '../services/api';
import type { ScannerFilters } from '@smarttrade/shared';

interface ScanResult {
  symbol: string;
  matchScore: number;
  indicators: Record<string, number>;
}

export default function ScannerPage() {
  const [filters, setFilters] = useState<ScannerFilters>({
    priceMin: 100,
    priceMax: 5000,
    volumeMultiplier: 2,
    rsiMax: 70,
    deliveryPctMin: 40,
  });
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setLoading(true);
    try {
      const data = await apiPost<ScanResult[]>('/market/scanner/run', { filters, exchange: 'NSE' });
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Stock Scanner</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Min Price" type="number" size="small"
                value={filters.priceMin ?? ''} onChange={(e) => setFilters({ ...filters, priceMin: +e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Max Price" type="number" size="small"
                value={filters.priceMax ?? ''} onChange={(e) => setFilters({ ...filters, priceMax: +e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Volume Multiplier" type="number" size="small"
                value={filters.volumeMultiplier ?? ''} onChange={(e) => setFilters({ ...filters, volumeMultiplier: +e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="RSI Max" type="number" size="small"
                value={filters.rsiMax ?? ''} onChange={(e) => setFilters({ ...filters, rsiMax: +e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth label="Delivery % Min" type="number" size="small"
                value={filters.deliveryPctMin ?? ''} onChange={(e) => setFilters({ ...filters, deliveryPctMin: +e.target.value })} />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>MACD Crossover</InputLabel>
                <Select value={filters.macdCrossover ?? ''} label="MACD Crossover"
                  onChange={(e) => setFilters({ ...filters, macdCrossover: e.target.value as 'bullish' | 'bearish' })}>
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="bullish">Bullish</MenuItem>
                  <MenuItem value="bearish">Bearish</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>VWAP Signal</InputLabel>
                <Select value={filters.vwapSignal ?? ''} label="VWAP Signal"
                  onChange={(e) => setFilters({ ...filters, vwapSignal: e.target.value as 'above' | 'below' })}>
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="above">Above VWAP</MenuItem>
                  <MenuItem value="below">Below VWAP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={runScan} disabled={loading}>
                {loading ? 'Scanning...' : 'Run Scanner'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Results ({results.length})</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Match Score</TableCell>
                  <TableCell align="right">RSI</TableCell>
                  <TableCell align="right">Momentum</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.symbol} hover>
                    <TableCell><Chip label={r.symbol} size="small" /></TableCell>
                    <TableCell align="right">{r.matchScore}</TableCell>
                    <TableCell align="right">{r.indicators.rsi?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell align="right">{r.indicators.momentum?.toFixed(2) ?? '-'}</TableCell>
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
