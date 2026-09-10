import crypto from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import type { User } from '@mfe/shared-contracts';
const app = express();
const port = Number(process.env.PORT ?? 4001);
const secret = process.env.JWT_SECRET ?? 'local-learning-secret-change-me';
const sessions = new Map<string, User>();
const users: Record<string, User> = {
  'viewer@example.com': {
    id: 'viewer',
    email: 'viewer@example.com',
    name: 'Demo Viewer',
    roles: ['viewer'],
  },
  'admin@example.com': {
    id: 'admin',
    email: 'admin@example.com',
    name: 'Demo Admin',
    roles: ['admin'],
  },
};
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mock-identity-provider' }));
app.post('/session/login', (req, res) => {
  const user = users[String(req.body.email)];
  if (!user) return res.status(401).json({ message: 'Unknown demo user' });
  const id = crypto.randomUUID();
  sessions.set(id, user);
  res.cookie('mfe_session', id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 3_600_000,
  });
  return res.json({ user });
});
app.get('/session', (req, res) => {
  const user = sessions.get(req.cookies.mfe_session);
  return user ? res.json({ user }) : res.status(401).json({ message: 'No active session' });
});
app.get('/session/token', (req, res) => {
  const user = sessions.get(req.cookies.mfe_session);
  if (!user) return res.status(401).json({ message: 'No active session' });
  return res.json({
    accessToken: jwt.sign({ sub: user.id, email: user.email, roles: user.roles }, secret, {
      issuer: 'mock-idp',
      audience: 'mock-api',
      expiresIn: '5m',
    }),
  });
});
app.post('/session/logout', (req, res) => {
  sessions.delete(req.cookies.mfe_session);
  res.clearCookie('mfe_session');
  res.status(204).end();
});
app.listen(port, () =>
  console.log(JSON.stringify({ level: 'info', service: 'mock-idp', event: 'listening', port })),
);
