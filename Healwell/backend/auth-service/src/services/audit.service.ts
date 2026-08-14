import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

export class AuditService {
  async log(eventType: string, message: string, metadata?: any, userId?: string) {
    try {
      await prisma.auditLog.create({ data: { eventType, message, metadata, userId } })
    } catch (e) {
      console.error('Failed to write audit log', e)
    }

    // optionally post to an external alerting webhook
    const webhook = process.env.ALERT_WEBHOOK_URL
    if (webhook) {
      try {
        await axios.post(webhook, { eventType, message, metadata, timestamp: new Date().toISOString() })
      } catch (e) {
        console.error('Failed to send alert webhook', e)
      }
    }
  }
}

export default new AuditService()
