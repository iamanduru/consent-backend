import { AuditAction, ConsentStatus, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { createAuditLog } from './audit.service'
import type {
  CreateConsentInput,
  DecideConsentInput,
  ValidateAccessInput,
} from '../validators/consent.validator'

export async function createConsentRequest(input: CreateConsentInput) {
  const consent = await prisma.consent.create({
    data: {
      userId: input.userId,
      requesterName: input.requesterName,
      dataType: input.dataType,
      purpose: input.purpose,
      allowedActions: input.allowedActions,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      status: ConsentStatus.REQUESTED,
    },
  })

  await createAuditLog({
    userId: input.userId,
    consentId: consent.id,
    action: AuditAction.CONSENT_REQUESTED,
    details: `Consent requested by ${input.requesterName} for ${input.dataType} with purpose: ${input.purpose}`,
  })

  return consent
}

export async function decideConsent(
  consentId: number,
  input: DecideConsentInput,
  actorUserId?: number,
) {
  const existing = await prisma.consent.findUnique({
    where: { id: consentId },
  })

  if (!existing) {
    throw new Error('Consent not found')
  }

  const nextStatus = input.status as ConsentStatus

  if (
    existing.status === ConsentStatus.REVOKED ||
    existing.status === ConsentStatus.EXPIRED
  ) {
    throw new Error('This consent can no longer be changed')
  }

  const updated = await prisma.consent.update({
    where: { id: consentId },
    data: {
      status: nextStatus,
      allowedActions: input.allowedActions ?? existing.allowedActions,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : existing.expiresAt,
      revokedAt:
        nextStatus === ConsentStatus.REVOKED ? new Date() : existing.revokedAt,
      decisionAt: new Date(),
    },
  })

  const actionMap: Record<string, AuditAction> = {
    GRANTED: AuditAction.CONSENT_GRANTED,
    DENIED: AuditAction.CONSENT_DENIED,
    LIMITED: AuditAction.CONSENT_LIMITED,
    REVOKED: AuditAction.CONSENT_REVOKED,
  }

  await createAuditLog({
    userId: actorUserId ?? existing.userId,
    consentId,
    action: actionMap[input.status],
    details: `Consent updated to ${input.status}`,
  })

  return updated
}

export async function validateConsentAccess(input: ValidateAccessInput) {
  const consent = await prisma.consent.findUnique({
    where: { id: input.consentId },
  })

  if (!consent) {
    throw new Error('Consent not found')
  }

  let effectiveStatus = consent.status

  if (
    consent.expiresAt &&
    consent.expiresAt.getTime() < Date.now() &&
    consent.status !== ConsentStatus.EXPIRED
  ) {
    await prisma.consent.update({
      where: { id: consent.id },
      data: { status: ConsentStatus.EXPIRED },
    })

    await createAuditLog({
      userId: consent.userId,
      consentId: consent.id,
      action: AuditAction.CONSENT_EXPIRED,
      details: 'Consent automatically marked as expired during access validation',
    })

    effectiveStatus = ConsentStatus.EXPIRED
  }

  let isAllowed = false
  let reason = 'Access denied'

  if (
    effectiveStatus === ConsentStatus.GRANTED ||
    effectiveStatus === ConsentStatus.LIMITED
  ) {
    const purposeMatches =
      consent.purpose.trim().toLowerCase() ===
      input.requestedPurpose.trim().toLowerCase()

    const requesterMatches =
      consent.requesterName.trim().toLowerCase() ===
      input.requesterName.trim().toLowerCase()

    const actionAllowed =
      !consent.allowedActions ||
      consent.allowedActions
        .toLowerCase()
        .split(',')
        .map((item) => item.trim())
        .includes(input.requestedAction.trim().toLowerCase())

    if (purposeMatches && requesterMatches && actionAllowed) {
      isAllowed = true
      reason = 'Access granted: consent is valid and matches constraints'
    } else {
      reason = 'Access denied: purpose, requester, or action does not match consent'
    }
  } else if (effectiveStatus === ConsentStatus.REVOKED) {
    reason = 'Access denied: consent has been revoked'
  } else if (effectiveStatus === ConsentStatus.EXPIRED) {
    reason = 'Access denied: consent has expired'
  } else if (effectiveStatus === ConsentStatus.REQUESTED) {
    reason = 'Access denied: consent decision is still pending'
  } else if (effectiveStatus === ConsentStatus.DENIED) {
    reason = 'Access denied: consent was denied'
  }

  const accessRequest = await prisma.dataAccessRequest.create({
    data: {
      consentId: consent.id,
      requesterName: input.requesterName,
      requestedAction: input.requestedAction,
      requestedPurpose: input.requestedPurpose,
      isAllowed,
      reason,
    },
  })

  await createAuditLog({
    userId: consent.userId,
    consentId: consent.id,
    action: isAllowed ? AuditAction.ACCESS_GRANTED : AuditAction.ACCESS_DENIED,
    details: `${reason}. Requester: ${input.requesterName}, action: ${input.requestedAction}`,
  })

  return {
    consentId: consent.id,
    status: effectiveStatus,
    isAllowed,
    reason,
    accessRequestId: accessRequest.id,
  }
}

export async function getConsentSummaryForUser(userId: number) {
  const [activeConsents, pendingRequests, revokedConsents, expiredExpiring, recentActivity] =
    await Promise.all([
      prisma.consent.count({
        where: {
          userId,
          status: { in: [ConsentStatus.GRANTED, ConsentStatus.LIMITED] },
        },
      }),
      prisma.consent.count({
        where: {
          userId,
          status: ConsentStatus.REQUESTED,
        },
      }),
      prisma.consent.count({
        where: {
          userId,
          status: ConsentStatus.REVOKED,
        },
      }),
      prisma.consent.count({
        where: {
          userId,
          OR: [
            { status: ConsentStatus.EXPIRED },
            {
              expiresAt: {
                lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
              },
              status: { in: [ConsentStatus.GRANTED, ConsentStatus.LIMITED] },
            },
          ],
        },
      }),
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

  return {
    activeConsents,
    pendingRequests,
    revokedConsents,
    expiredExpiring,
    recentActivity,
  }
}

export async function listConsentsForUser(
  userId: number,
  filters?: {
    status?: string
    search?: string
  },
) {
  const where: Prisma.ConsentWhereInput = {
    userId,
  }

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status as ConsentStatus
  }

  if (filters?.search) {
    where.OR = [
      {
        requesterName: {
          contains: filters.search,
        },
      },
      {
        purpose: {
          contains: filters.search,
        },
      },
      {
        dataType: {
          contains: filters.search,
        },
      },
    ]
  }

  return prisma.consent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

export async function listRecentAuditLogsForUser(userId: number) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

export async function getTopDataConsumersForUser(userId: number) {
  const grouped = await prisma.consent.groupBy({
    by: ['requesterName'],
    where: {
      userId,
      status: {
        in: [ConsentStatus.GRANTED, ConsentStatus.LIMITED],
      },
    },
    _count: {
      requesterName: true,
    },
    orderBy: {
      _count: {
        requesterName: 'desc',
      },
    },
    take: 5,
  })

  return grouped.map((item) => ({
    requesterName: item.requesterName,
    consentCount: item._count.requesterName,
  }))
}

export async function getConsentByIdForUser(userId: number, consentId: number) {
  const consent = await prisma.consent.findFirst({
    where: {
      id: consentId,
      userId,
    },
  })

  if (!consent) {
    throw new Error('Consent not found')
  }

  return consent
}