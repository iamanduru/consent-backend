import { Response } from 'express'
import { ZodError } from 'zod'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import {
  createConsentSchema,
  decideConsentSchema,
  validateAccessSchema,
} from '../validators/consent.validator'
import {
  createConsentRequest,
  decideConsent,
  validateConsentAccess,
  getConsentSummaryForUser,
  listConsentsForUser,
  listRecentAuditLogsForUser,
  getTopDataConsumersForUser,
  getConsentByIdForUser,
} from '../services/consent.service'

export async function createConsent(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const parsed = createConsentSchema.parse(req.body)
    const consent = await createConsentRequest(parsed)

    res.status(201).json({
      success: true,
      message: 'Consent request created successfully',
      data: consent,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      })
      return
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}

export async function updateConsentDecision(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const consentId = Number(req.params.id)
    const parsed = decideConsentSchema.parse(req.body)

    const updated = await decideConsent(consentId, parsed, req.user?.userId)

    res.status(200).json({
      success: true,
      message: 'Consent updated successfully',
      data: updated,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      })
      return
    }

    const message =
      error instanceof Error ? error.message : 'Internal server error'

    res.status(message === 'Consent not found' ? 404 : 500).json({
      success: false,
      message,
    })
  }
}

export async function validateAccess(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const parsed = validateAccessSchema.parse(req.body)
    const result = await validateConsentAccess(parsed)

    res.status(200).json({
      success: true,
      message: result.isAllowed ? 'Access granted' : 'Access denied',
      data: result,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      })
      return
    }

    const message =
      error instanceof Error ? error.message : 'Internal server error'

    res.status(message === 'Consent not found' ? 404 : 500).json({
      success: false,
      message,
    })
  }
}

export async function getMyConsentSummary(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const summary = await getConsentSummaryForUser(req.user.userId)

    res.status(200).json({
      success: true,
      data: summary,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function getMyConsents(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined
    const search =
      typeof req.query.search === 'string' ? req.query.search : undefined

    const consents = await listConsentsForUser(req.user.userId, {
      status,
      search,
    })

    res.status(200).json({
      success: true,
      data: consents,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function getMyConsentById(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const consentId = Number(req.params.id)
    const consent = await getConsentByIdForUser(req.user.userId, consentId)

    res.status(200).json({
      success: true,
      data: consent,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'

    res.status(message === 'Consent not found' ? 404 : 500).json({
      success: false,
      message,
    })
  }
}

export async function getMyRecentAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const logs = await listRecentAuditLogsForUser(req.user.userId)

    res.status(200).json({
      success: true,
      data: logs,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function getMyTopConsumers(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    const consumers = await getTopDataConsumersForUser(req.user.userId)

    res.status(200).json({
      success: true,
      data: consumers,
    })
  } catch {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}