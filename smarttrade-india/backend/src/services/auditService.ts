import { query } from '../utils/database';
import type { AuditAction } from '@smarttrade/shared';
import { logger } from '../utils/logger';

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.userId ?? null,
        input.action,
        input.entityType ?? null,
        input.entityId ?? null,
        input.ipAddress ?? null,
        input.userAgent ?? null,
        JSON.stringify(input.details ?? {}),
      ]
    );
  } catch (error) {
    logger.error('Failed to create audit log', { error, action: input.action });
  }
}

export async function getAuditLogs(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ logs: Record<string, unknown>[]; total: number }> {
  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM audit_logs WHERE user_id = $1',
    [userId]
  );
  const result = await query(
    `SELECT id, action, entity_type, entity_id, details, ip_address, created_at
     FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return {
    logs: result.rows,
    total: parseInt(countResult.rows[0]?.count ?? '0', 10),
  };
}
