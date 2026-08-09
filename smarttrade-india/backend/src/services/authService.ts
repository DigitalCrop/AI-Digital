import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../utils/database';
import { hashToken } from '../utils/encryption';
import { generateAccessToken, generateRefreshToken, type AuthPayload } from '../middleware/auth';
import { createAuditLog } from './auditService';
import type { AuthTokens, User } from '@smarttrade/shared';

const SALT_ROUNDS = 12;

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export async function registerUser(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
  const existing = await query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const userId = uuidv4();

  await query(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, input.email.toLowerCase(), passwordHash, input.firstName, input.lastName, input.phone ?? null]
  );

  await query(
    `INSERT INTO user_profiles (user_id) VALUES ($1)`,
    [userId]
  );

  await query(
    `INSERT INTO risk_settings (user_id) VALUES ($1)`,
    [userId]
  );

  await query(
    `INSERT INTO portfolios (user_id) VALUES ($1)`,
    [userId]
  );

  const user = await getUserById(userId);
  const tokens = await createSession(user!, input.email);

  await createAuditLog({ userId, action: 'LOGIN', details: { event: 'registration' } });

  return { user: user!, tokens };
}

export async function loginUser(
  email: string,
  password: string,
  totpCode?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: User; tokens: AuthTokens }> {
  const result = await query<{
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    two_factor_enabled: boolean;
    two_factor_secret: string | null;
    avatar_url: string | null;
    created_at: Date;
  }>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

  const row = result.rows[0];
  if (!row || !row.is_active) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  if (row.two_factor_enabled) {
    if (!totpCode || !row.two_factor_secret) {
      throw Object.assign(new Error('2FA code required'), { status: 401, code: '2FA_REQUIRED' });
    }
    const verified = speakeasy.totp.verify({
      secret: row.two_factor_secret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });
    if (!verified) {
      throw Object.assign(new Error('Invalid 2FA code'), { status: 401 });
    }
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [row.id]);

  const user = mapUserRow(row);
  const tokens = await createSession(user, email, ipAddress, userAgent);

  await createAuditLog({
    userId: row.id,
    action: 'LOGIN',
    ipAddress,
    userAgent,
  });

  return { user, tokens };
}

async function createSession(
  user: User,
  _email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthTokens> {
  const payload: AuthPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await query(
    `INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
    [user.id, hashToken(refreshToken), ipAddress ?? null, userAgent ?? null]
  );

  return { accessToken, refreshToken, expiresIn: 900 };
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    two_factor_enabled: boolean;
    avatar_url: string | null;
    created_at: Date;
  }>('SELECT * FROM users WHERE id = $1', [userId]);

  const row = result.rows[0];
  return row ? mapUserRow(row) : null;
}

function mapUserRow(row: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  avatar_url: string | null;
  created_at: Date;
}): User {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    role: row.role as User['role'],
    isActive: row.is_active,
    twoFactorEnabled: row.two_factor_enabled,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function setup2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
  const secret = speakeasy.generateSecret({ name: `SmartTrade India (${userId})` });
  await query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret.base32, userId]);
  return { secret: secret.base32, qrCodeUrl: secret.otpauth_url ?? '' };
}

export async function enable2FA(userId: string, token: string): Promise<void> {
  const result = await query<{ two_factor_secret: string }>(
    'SELECT two_factor_secret FROM users WHERE id = $1',
    [userId]
  );
  const secret = result.rows[0]?.two_factor_secret;
  if (!secret) throw new Error('2FA not initialized');

  const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
  if (!verified) throw Object.assign(new Error('Invalid token'), { status: 400 });

  await query('UPDATE users SET two_factor_enabled = true WHERE id = $1', [userId]);
}

export async function updateProfile(
  userId: string,
  data: { firstName?: string; lastName?: string; phone?: string }
): Promise<User> {
  await query(
    `UPDATE users SET
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      phone = COALESCE($4, phone)
     WHERE id = $1`,
    [userId, data.firstName, data.lastName, data.phone]
  );
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');
  return user;
}
