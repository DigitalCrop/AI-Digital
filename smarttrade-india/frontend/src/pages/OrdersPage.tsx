import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Button,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);

  const fetchOrders = () => apiGet<Record<string, unknown>[]>('/trading/orders').then(setOrders);

  useEffect(() => { fetchOrders(); }, []);

  const approveOrder = async (id: string) => {
    await apiPost(`/trading/orders/${id}/approve`);
    fetchOrders();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Orders</Typography>
      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={String(o.id)}>
                  <TableCell>{String(o.symbol)}</TableCell>
                  <TableCell>
                    <Chip label={String(o.side)} size="small" color={o.side === 'BUY' ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell>{String(o.order_type)}</TableCell>
                  <TableCell align="right">{Number(o.quantity)}</TableCell>
                  <TableCell align="right">₹{Number(o.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={String(o.status)} size="small"
                      color={o.status === 'COMPLETE' ? 'success' : o.status === 'PENDING' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>
                    {o.status === 'PENDING' && o.requires_approval && (
                      <Button size="small" variant="contained" onClick={() => approveOrder(String(o.id))}>
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No orders yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
