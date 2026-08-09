import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config';
import { logger } from './utils/logger';
import { healthCheck } from './utils/database';
import { redis, redisHealthCheck } from './utils/redis';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import { setupWebSocket } from './websocket/server';
import { startTradingEngine, stopTradingEngine } from './engine/tradingEngine';

import authRoutes from './routes/auth';
import marketRoutes from './routes/market';
import tradingRoutes from './routes/trading';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(globalRateLimiter);

app.get('/health', async (_req, res) => {
  const dbOk = await healthCheck();
  const redisOk = await redisHealthCheck();
  const status = dbOk && redisOk ? 'healthy' : 'degraded';
  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    services: { database: dbOk, redis: redisOk, tradingEngine: true },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/market', authenticate, marketRoutes);
app.use('/api/trading', authenticate, tradingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

setupWebSocket(wss);

async function bootstrap(): Promise<void> {
  try {
    await redis.connect();
    startTradingEngine();
    server.listen(config.PORT, () => {
      logger.info(`SmartTrade India API running on port ${config.PORT}`);
      logger.info(`WebSocket available at ws://localhost:${config.PORT}/ws`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  stopTradingEngine();
  server.close();
  process.exit(0);
});

bootstrap();

export { app, server };