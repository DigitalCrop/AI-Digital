const numberFromEnv = (name, fallback) => {
  const parsed = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = Object.freeze({
  port: numberFromEnv('PORT', 3000),
  clientUrl: (process.env.CLIENT_URL || 'http://127.0.0.1:5173/timepass').replace(/\/+$/, ''),
  roomExpiryMs: numberFromEnv('ROOM_EXPIRY_MINUTES', 120) * 60_000,
  reconnectGraceMs: numberFromEnv('RECONNECT_GRACE_SECONDS', 60) * 1_000,
  sessionSecret: process.env.SESSION_SECRET || 'development-only-secret-change-me',
  isProduction: process.env.NODE_ENV === 'production'
});
