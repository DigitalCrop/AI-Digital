import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell,
  TableHead, TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import { tradingColors } from '../theme';

export default function PortfolioPage() {
  const [data, setData] = useState<{ portfolio: Record<string, number>; holdings: Record<string, unknown>[] } | null>(null);

  useEffect(() => {
    apiGet('/trading/portfolio').then(setData);
  }, []);

  const p = data?.portfolio;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Portfolio</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Value', value: p?.total_value ?? 0 },
          { label: 'Invested', value: p?.invested_value ?? 0 },
          { label: 'Day P&L', value: p?.day_pnl ?? 0, colored: true },
          { label: 'Total P&L', value: p?.total_pnl ?? 0, colored: true },
        ].map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5" fontWeight={700}
                  color={item.colored ? (item.value >= 0 ? tradingColors.profit : tradingColors.loss) : undefined}>
                  ₹{Number(item.value).toLocaleString('en-IN')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Holdings</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Avg Price</TableCell>
                <TableCell align="right">LTP</TableCell>
                <TableCell align="right">P&L</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.holdings ?? []).map((h) => (
                <TableRow key={String(h.symbol)}>
                  <TableCell>{String(h.symbol)}</TableCell>
                  <TableCell align="right">{Number(h.quantity)}</TableCell>
                  <TableCell align="right">₹{Number(h.average_price).toFixed(2)}</TableCell>
                  <TableCell align="right">₹{Number(h.current_price ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: Number(h.unrealized_pnl) >= 0 ? tradingColors.profit : tradingColors.loss }}>
                    ₹{Number(h.unrealized_pnl).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {(data?.holdings ?? []).length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No holdings. Connect a broker to sync.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
