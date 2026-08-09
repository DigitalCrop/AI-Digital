import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { checkDatabase } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');
const appBasePath = '/timepass';

export function createApp({ databaseCheck = checkDatabase } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'", 'ws:', 'wss:'], upgradeInsecureRequests: null } } }));
  app.use(compression());
  app.use(express.json({ limit: '16kb' }));
  app.use(`${appBasePath}/api`, rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get(`${appBasePath}/api/health`, async (_req, res) => {
    try { await databaseCheck(); res.json({ status: 'ok', database: 'ok', service: 'timepass', timestamp: new Date().toISOString() }); }
    catch (error) { res.status(503).json({ status: 'error', database: 'unavailable', message: error.message }); }
  });
  app.use(`${appBasePath}/api`, (_req, res) => res.status(404).json({ error: 'API route not found.' }));
  if (fs.existsSync(clientDist)) {
    app.use(appBasePath, express.static(clientDist, { maxAge: '1h', index: false }));
    app.use((req, res, next) => req.method === 'GET' && (req.path === appBasePath || req.path.startsWith(`${appBasePath}/`)) && req.accepts('html') ? res.sendFile(path.join(clientDist, 'index.html')) : next());
  }
  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
  return app;
}
