import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';
import { tradingColors } from '../theme';

export default function PositionsPage() {
  const [positions, setPositions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    apiGet<Record<string, unknown>[]>('/trading/positions').then(setPositions);
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Open Positions</Typography>
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Avg Price</TableCell>
                <TableCell align="right">LTP</TableCell>
                <TableCell align="right">Unrealized P&L</TableCell>
                <TableCell align="right">Stop Loss</TableCell>
                <TableCell align="right">Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={String(p.id)}>
                  <TableCell>{String(p.symbol)}</TableCell>
                  <TableCell align="right">{Number(p.quantity)}</TableCell>
                  <TableCell align="right">₹{Number(p.average_price).toFixed(2)}</TableCell>
                  <TableCell align="right">₹{Number(p.last_price ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: Number(p.unrealized_pnl) >= 0 ? tradingColors.profit : tradingColors.loss }}>
                    ₹{Number(p.unrealized_pnl).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{p.stop_loss ? `₹${Number(p.stop_loss).toFixed(2)}` : '-'}</TableCell>
                  <TableCell align="right">{p.target_price ? `₹${Number(p.target_price).toFixed(2)}` : '-'}</TableCell>
                </TableRow>
              ))}
              {positions.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No open positions</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
