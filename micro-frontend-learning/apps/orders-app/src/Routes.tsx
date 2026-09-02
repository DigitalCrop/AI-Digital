import { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@mfe/shared-auth';
import type { Order } from '@mfe/shared-contracts';
import { publish } from '@mfe/shared-events';
import { Alert, Button, Card, Spinner } from '@mfe/shared-ui';
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
export default function OrderRoutes() {
  const auth = useAuth();
  const { getAccessToken, recoverSession } = auth;
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const isAdmin = auth.user?.roles.includes('admin') ?? false;
  const request = useCallback(
    async (path: string, init?: RequestInit) => {
      const token = await getAccessToken();
      if (!token) {
        await recoverSession();
        throw new Error('Your session expired');
      }
      const correlationId = crypto.randomUUID();
      console.info(JSON.stringify({ level: 'info', event: 'api-request', correlationId, path }));
      const r = await fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
          ...init?.headers,
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          'x-correlation-id': correlationId,
        },
      });
      if (r.status === 401) {
        await recoverSession();
        throw new Error('Your session expired');
      }
      if (r.status === 403) {
        navigate('/unauthorized');
        throw new Error('Forbidden');
      }
      if (!r.ok) throw new Error('Order request failed');
      return r;
    },
    [getAccessToken, recoverSession, navigate],
  );
  const load = useCallback(async () => {
    try {
      setOrders((await (await request('/orders')).json()) as Order[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    }
  }, [request]);
  useEffect(() => {
    void load();
  }, [load]);
  async function create() {
    const order = (await (
      await request('/orders', {
        method: 'POST',
        body: JSON.stringify({ productId: 'p1', quantity: 1 }),
      })
    ).json()) as Order;
    publish('order-created', {
      orderId: order.id,
      productId: order.productId,
      quantity: order.quantity,
      occurredAt: new Date().toISOString(),
    });
    await load();
  }
  async function cancel(id: string) {
    await request(`/orders/${id}/cancel`, { method: 'POST' });
    await load();
  }
  if (error && !orders) return <Alert tone="error">{error}</Alert>;
  if (!orders) return <Spinner label="Loading orders…" />;
  return (
    <Routes>
      <Route
        index
        element={
          <>
            <div className="row">
              <h1>Orders</h1>
              <Button
                disabled={!isAdmin}
                title={!isAdmin ? 'Admin role required' : undefined}
                onClick={() => void create()}
              >
                Create order
              </Button>
            </div>
            {!isAdmin && (
              <Alert>Viewer accounts can read orders but cannot create or cancel them.</Alert>
            )}
            {orders.map((o) => (
              <Card key={o.id} title={`Order ${o.id}`}>
                <p>
                  {o.productName} · Qty {o.quantity} · {o.status}
                </p>
                <div className="row">
                  <Link to={o.id}>Details</Link>
                  <Button
                    disabled={!isAdmin || o.status === 'cancelled'}
                    onClick={() => void cancel(o.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </>
        }
      />
      <Route path=":id" element={<OrderDetail orders={orders} />} />
    </Routes>
  );
}
function OrderDetail({ orders }: { orders: Order[] }) {
  const { id } = useParams();
  const order = orders.find((item) => item.id === id);
  return order ? (
    <Card title={`Order ${order.id}`}>
      <p>{order.productName}</p>
      <p>Status: {order.status}</p>
      <Link to="..">Back to orders</Link>
    </Card>
  ) : (
    <Alert tone="error">Order not found.</Alert>
  );
}
