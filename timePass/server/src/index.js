import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './db.js';
import { repository } from './services/repository.js';
import { RoomManager } from './services/roomManager.js';
import { registerSocketHandlers } from './socket.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { path: '/timepass/socket.io', cors: config.isProduction ? undefined : { origin: config.clientUrl, methods: ['GET','POST'] }, maxHttpBufferSize: 16_384, pingTimeout: 20_000 });
const manager = new RoomManager({ repository, reconnectGraceMs: config.reconnectGraceMs, roomExpiryMs: config.roomExpiryMs, sessionSecret: config.sessionSecret });
registerSocketHandlers(io, manager, config.clientUrl);
const cleanupTimer = setInterval(() => manager.cleanup(), 10_000); cleanupTimer.unref();

server.listen(config.port, '0.0.0.0', () => console.log(`[timePass] listening on port ${config.port}`));
async function shutdown(signal) {
  console.log(`[timePass] ${signal} received; shutting down`); clearInterval(cleanupTimer);
  io.close(); await new Promise((resolve) => server.close(resolve)); await prisma.$disconnect(); process.exit(0);
}
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
