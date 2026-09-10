import { Router } from 'express'
import { AuthService } from '../services/auth.service'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dob: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export const authRouter = Router()
const authService = new AuthService()

// Registration endpoint
authRouter.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.format() } })
    }
    const { email, password, firstName, lastName, dob } = parsed.data
    const result = await authService.register({ email, password, firstName, lastName, dob })
    res.json({ success: true, data: result })
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: err.message } })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.format() } })
    }
    const { email, password } = parsed.data
    const { accessToken, refreshToken, user } = await authService.login(email, password)

    // set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ success: true, data: { accessToken, user } })
  } catch (err: any) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: err.message } })
  }
})

authRouter.post('/logout', async (req, res) => {
  const token = req.cookies['refreshToken']
  if (token) {
    await authService.revokeRefreshToken(token)
  }
  res.clearCookie('refreshToken')
  res.json({ success: true })
})

authRouter.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies['refreshToken']
    const { accessToken, refreshToken } = await authService.refresh(token)
    // set new refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ success: true, data: { accessToken } })
  } catch (err: any) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: err.message } })
  }
})

authRouter.get('/me', async (req, res) => {
  try {
    // auth middleware will set req.userId if Authorization header present
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } })
    const token = authHeader.split(' ')[1]
    const jwt = require('jsonwebtoken')
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { customers: true } })
    await prisma.$disconnect()
    if (!user) return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND' } })
    res.json({ success: true, data: { user: { id: user.id, email: user.email }, customers: user.customers } })
  } catch (err: any) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: err.message } })
  }
})
