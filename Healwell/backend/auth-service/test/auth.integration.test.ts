import request from 'supertest'
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import app from '../src/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import Redis from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL)

let testEmail = `test.user.${Date.now()}@example.com`
let testPassword = 'Test@1234!'

beforeAll(async () => {
  // create test user
  const passwordHash = await bcrypt.hash(testPassword, 10)
  await prisma.user.create({ data: { email: testEmail, passwordHash } })
})

afterAll(async () => {
  // cleanup
  await prisma.user.deleteMany({ where: { email: testEmail } })
  await prisma.refreshToken.deleteMany({ where: {} })
  await prisma.$disconnect()
  await redis.quit()
})

describe('Auth refresh rotation and reuse detection', () => {
  it('logs in, refreshes (rotates), then detects reuse', async () => {
    // login
    const loginRes = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword })
    expect(loginRes.status).toBe(200)
    const setCookie = loginRes.header['set-cookie']
    expect(setCookie).toBeDefined()
    const cookieStr = setCookie[0]
    const match = cookieStr.match(/refreshToken=([^;]+);/)
    expect(match).not.toBeNull()
    const initialToken = match![1]

    // refresh -> rotates token
    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', [`refreshToken=${initialToken}`]).send()
    expect(refreshRes.status).toBe(200)
    const newSetCookie = refreshRes.header['set-cookie']
    expect(newSetCookie).toBeDefined()
    const newCookieMatch = newSetCookie[0].match(/refreshToken=([^;]+);/)
    expect(newCookieMatch).not.toBeNull()
    const rotatedToken = newCookieMatch![1]
    expect(rotatedToken).not.toBe(initialToken)

    // reuse old token should be detected and cause revocation
    const reuseRes = await request(app).post('/api/auth/refresh').set('Cookie', [`refreshToken=${initialToken}`]).send()
    expect(reuseRes.status).toBe(401)
    expect(reuseRes.body).toHaveProperty('error')
    expect(reuseRes.body.error.message).toMatch(/reuse/i)
  })
})
