import crypto from 'node:crypto';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Order, Product, Role } from '@mfe/shared-contracts';
const app = express();
const port = Number(process.env.PORT ?? 4000);
const secret = process.env.JWT_SECRET ?? 'local-learning-secret-change-me';
const products: Product[] = [
  {
    id: 'p1',
    name: 'Architecture Notebook',
    description: 'Sketch boundaries, contracts, and flows.',
    price: 12,
    stock: 42,
  },
  {
    id: 'p2',
    name: 'Federation Mug',
    description: 'One mug, shared at runtime.',
    price: 18.5,
    stock: 20,
  },
  {
    id: 'p3',
    name: 'Resilience Hoodie',
    description: 'Warm fallback for unavailable remotes.',
    price: 56,
    stock: 8,
  },
];
const orders: Order[] = [
  { id: 'o1', productId: 'p2', productName: 'Federation Mug', quantity: 1, status: 'created' },
];
interface AuthedRequest extends Request {
  auth?: { sub: string; roles: Role[] };
}
app.use(
  cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] }),
);
app.use(express.json());
app.use((req, res, next) => {
  const correlationId = String(req.headers['x-correlation-id'] ?? crypto.randomUUID());
  res.setHeader('x-correlation-id', correlationId);
  console.log(
    JSON.stringify({
      level: 'info',
      service: 'mock-api',
      event: 'request',
      method: req.method,
      path: req.path,
      correlationId,
    }),
  );
  next();
});
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mock-api' }));
function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer /, '');
  if (!token) return res.status(401).json({ code: 'unauthenticated' });
  try {
    req.auth = jwt.verify(token, secret, { issuer: 'mock-idp', audience: 'mock-api' }) as {
      sub: string;
      roles: Role[];
    };
    return next();
  } catch {
    return res.status(401).json({ code: 'invalid_token' });
  }
}
function admin(req: AuthedRequest, res: Response, next: NextFunction) {
  return req.auth?.roles.includes('admin') ? next() : res.status(403).json({ code: 'forbidden' });
}
app.use('/v1', authenticate);
app.get('/v1/products', (_req, res) => res.json(products));
app.get('/v1/orders', (_req, res) => res.json(orders));
app.post('/v1/orders', admin, (req, res) => {
  const product = products.find((p) => p.id === req.body.productId);
  if (!product) return res.status(400).json({ code: 'unknown_product' });
  const order: Order = {
    id: `o${orders.length + 1}`,
    productId: product.id,
    productName: product.name,
    quantity: Number(req.body.quantity ?? 1),
    status: 'created',
  };
  orders.push(order);
  return res.status(201).json(order);
});
app.post('/v1/orders/:id/cancel', admin, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ code: 'not_found' });
  order.status = 'cancelled';
  return res.json(order);
});
app.listen(port, () =>
  console.log(JSON.stringify({ level: 'info', service: 'mock-api', event: 'listening', port })),
);
