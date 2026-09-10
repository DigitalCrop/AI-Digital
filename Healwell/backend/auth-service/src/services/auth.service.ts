import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import Redis from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL)

const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_DAYS = 7

function refreshRedisKey(token: string) {
  return `refresh:${token}`
}

export class AuthService {
  async register({ email, password, firstName, lastName, dob }: { email: string; password: string; firstName?: string; lastName?: string; dob?: string | null }) {
    // basic validation
    if (!email || !password) throw new Error('Email and password are required')
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email already registered')

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        customers: { create: { firstName: firstName || '', lastName: lastName || '', dob: dob ? new Date(dob) : undefined } }
      },
      include: { customers: true }
    })

    // In production, send verification email / OTP. For now, log placeholder.
    console.log(`Registered user ${user.email} (id=${user.id})`)

    return { id: user.id, email: user.email }
  }
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Invalid credentials')

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) throw new Error('Invalid credentials')

    const accessToken = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: ACCESS_EXPIRES_IN
    })

    const refreshToken = uuidv4()
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000)

    // store audit record in DB
    await prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } })

    // store active token in Redis for fast validation and rotation
    const expiresSec = REFRESH_EXPIRES_DAYS * 24 * 60 * 60
    await redis.set(refreshRedisKey(refreshToken), user.id, 'EX', expiresSec)

    return { accessToken, refreshToken, user: { id: user.id, email: user.email } }
  }

  async revokeRefreshToken(token: string) {
    // mark DB record revoked for audit
    await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } })
    // remove from Redis so it cannot be used
    await redis.del(refreshRedisKey(token))
  }

  async refresh(token: string | undefined) {
    if (!token) throw new Error('No refresh token')

    const userId = await redis.get(refreshRedisKey(token))
    if (!userId) {
      // token not in Redis - possible reuse or expiration
      const dbRecord = await prisma.refreshToken.findUnique({ where: { token } })
      if (dbRecord) {
        if (dbRecord.revoked && dbRecord.replacedBy) {
          // Token reuse detected: an old token was used after rotation
          // Revoke all refresh tokens for this user and remove from Redis
          await prisma.refreshToken.updateMany({ where: { userId: dbRecord.userId }, data: { revoked: true } })
          const tokens = await prisma.refreshToken.findMany({ where: { userId: dbRecord.userId }, select: { token: true } })
          const keys = tokens.map((t) => refreshRedisKey(t.token))
          if (keys.length) await redis.del(...keys)
          // Emit security audit and alert
          try {
            const AuditService = require('./audit.service').default
            await AuditService.log(
              'REFRESH_TOKEN_REUSE',
              `Refresh token reuse detected for user ${dbRecord.userId}`,
              { token, replacedBy: dbRecord.replacedBy },
              dbRecord.userId
            )
          } catch (e) {
            console.error('Failed to log audit for token reuse', e)
          }
          throw new Error('Refresh token reuse detected; all sessions revoked')
        }
        // otherwise treat as invalid/expired
        await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } })
      }
      throw new Error('Invalid refresh token')
    }

    // rotate refresh token: revoke old, issue new
    const oldRecord = await prisma.refreshToken.findUnique({ where: { token } })
    await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } })
    await redis.del(refreshRedisKey(token))

    const newToken = uuidv4()
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({ data: { userId, token: newToken, expiresAt } })
    // update old DB record to point to the new token for reuse detection
    if (oldRecord) {
      await prisma.refreshToken.update({ where: { id: oldRecord.id }, data: { replacedBy: newToken } })
    }
    const expiresSec = REFRESH_EXPIRES_DAYS * 24 * 60 * 60
    await redis.set(refreshRedisKey(newToken), userId, 'EX', expiresSec)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('Invalid refresh token')

    const accessToken = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: ACCESS_EXPIRES_IN
    })

    return { accessToken, refreshToken: newToken }
  }
}
