import { AuditAction } from '@prisma/client'
import { prisma } from '../lib/prisma'

type CreateAuditLogInput = {
  userId?: number
  consentId?: number
  action: AuditAction
  details: string
}

export async function createAuditLog(input: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId,
      consentId: input.consentId,
      action: input.action,
      details: input.details,
    },
  })
}