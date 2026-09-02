import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { RequireRole, useAuth } from '@mfe/shared-auth';
import type { Product } from '@mfe/shared-contracts';
import { subscribe } from '@mfe/shared-events';
import { Alert, Card, Spinner } from '@mfe/shared-ui';
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/v1';
function useProducts() {
  const { getAccessToken, recoverSession } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          await recoverSession();
          return;
        }
        const correlationId = crypto.randomUUID();
        console.info(
          JSON.stringify({ level: 'info', event: 'api-request', correlationId, path: '/products' }),
        );
        const r = await fetch(`${apiUrl}/products`, {
          headers: { authorization: `Bearer ${token}`, 'x-correlation-id': correlationId },
        });
        if (r.status === 401) {
          await recoverSession();
          return;
        }
        if (r.status === 403) {
          navigate('/unauthorized');
          return;
        }
        if (!r.ok) throw new Error('Products request failed');
        setData((await r.json()) as Product[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
      }
    })();
  }, [getAccessToken, recoverSession, navigate]);
  return { data, error };
}
function ProductList() {
  const { data, error } = useProducts();
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(
    () =>
      subscribe('order-created', (event) =>
        setNotice(`Order ${event.orderId} was created for product ${event.productId}.`),
      ),
    [],
  );
  const shown = useMemo(
    () => data?.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [data, query],
  );
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!shown) return <Spinner label="Loading products…" />;
  return (
    <>
      <h1>Products</h1>
      {notice && <Alert tone="success">{notice}</Alert>}
      <label>
        Search products <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <div className="grid">
        {shown.map((p) => (
          <Card key={p.id} title={p.name}>
            <p>{p.description}</p>
            <p>${p.price.toFixed(2)}</p>
            <Link to={p.id}>View details</Link>
          </Card>
        ))}
      </div>
    </>
  );
}
function ProductDetail() {
  const { id } = useParams();
  const { data } = useProducts();
  const product = data?.find((p) => p.id === id);
  if (!data) return <Spinner />;
  return product ? (
    <Card title={product.name}>
      <p>{product.description}</p>
      <p>Stock: {product.stock}</p>
      <Link to="..">Back to products</Link>
    </Card>
  ) : (
    <Alert tone="error">Product not found.</Alert>
  );
}
export default function ProductRoutes() {
  return (
    <Routes>
      <Route index element={<ProductList />} />
      <Route
        path=":id"
        element={
          <RequireRole roles={['viewer', 'admin']}>
            <ProductDetail />
          </RequireRole>
        }
      />
    </Routes>
  );
}
