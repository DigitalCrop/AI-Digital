import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { AuthPayload } from '../middleware/auth';
import type { WSMessage } from '@smarttrade/shared';
import { logger } from '../utils/logger';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
}

const clients = new Map<string, Set<ClientConnection>>();

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    let payload: AuthPayload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    const connection: ClientConnection = { ws, userId: payload.userId };
    if (!clients.has(payload.userId)) {
      clients.set(payload.userId, new Set());
    }
    clients.get(payload.userId)!.add(connection);

    logger.info('WebSocket client connected', { userId: payload.userId });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleClientMessage(connection, message);
      } catch {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid message format' } }));
      }
    });

    ws.on('close', () => {
      clients.get(payload.userId)?.delete(connection);
      if (clients.get(payload.userId)?.size === 0) {
        clients.delete(payload.userId);
      }
      logger.info('WebSocket client disconnected', { userId: payload.userId });
    });

    ws.send(JSON.stringify({
      type: 'connected',
      payload: { userId: payload.userId },
      timestamp: new Date().toISOString(),
    }));
  });

  // Broadcast market updates every 3 seconds
  setInterval(() => {
    broadcastMarketUpdates();
  }, 3000);
}

function handleClientMessage(connection: ClientConnection, message: { type: string; payload?: unknown }): void {
  switch (message.type) {
    case 'subscribe':
      connection.ws.send(JSON.stringify({
        type: 'subscribed',
        payload: message.payload,
        timestamp: new Date().toISOString(),
      }));
      break;
    case 'ping':
      connection.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
  }
}

export function broadcastToUser(userId: string, message: WSMessage): void {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const data = JSON.stringify(message);
  for (const client of userClients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

export function broadcastToAll(message: WSMessage): void {
  const data = JSON.stringify(message);
  for (const userClients of clients.values()) {
    for (const client of userClients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }
}

async function broadcastMarketUpdates(): Promise<void> {
  broadcastToAll({
    type: 'quote_update',
    payload: { message: 'Market data refresh' },
    timestamp: new Date().toISOString(),
  });
}
