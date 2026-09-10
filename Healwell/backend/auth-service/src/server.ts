import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { authRouter } from './controllers/auth.controller'

dotenv.config()

export const app = express()
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

app.use(cors({ origin: true, credentials: true }))

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60
  })
)

app.use('/api/auth', authRouter)

// Minimal domain endpoints for local development and MFEs
app.get('/api/policies', (_req, res) => {
  res.json([
    { id: '1', policyNumber: 'POL-1001', holderName: 'Jane Doe', status: 'Active' },
    { id: '2', policyNumber: 'POL-1002', holderName: 'John Smith', status: 'Lapsed' }
  ])
})

app.get('/api/claims', (_req, res) => {
  res.json([
    { id: 'c1', claimNumber: 'CLM-2001', claimant: 'Jane Doe', status: 'Submitted' },
    { id: 'c2', claimNumber: 'CLM-2002', claimant: 'John Smith', status: 'Processing' }
  ])
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 4000
  app.listen(port, () => {
    console.log(`auth-service listening on port ${port}`)
  })
}

export default app
