import { z } from 'zod'

export const createConsentSchema = z.object({
  userId: z.number().int().positive(),
  requesterName: z.string().min(2).max(100),
  dataType: z.string().min(2).max(100),
  purpose: z.string().min(3).max(255),
  allowedActions: z.string().max(255).optional(),
  expiresAt: z.string().datetime().optional(),
})

export const decideConsentSchema = z.object({
  status: z.enum(['GRANTED', 'DENIED', 'LIMITED', 'REVOKED']),
  allowedActions: z.string().max(255).optional(),
  expiresAt: z.string().datetime().optional(),
})

export const validateAccessSchema = z.object({
  consentId: z.number().int().positive(),
  requesterName: z.string().min(2).max(100),
  requestedAction: z.string().min(2).max(100),
  requestedPurpose: z.string().min(3).max(255),
})

export type CreateConsentInput = z.infer<typeof createConsentSchema>
export type DecideConsentInput = z.infer<typeof decideConsentSchema>
export type ValidateAccessInput = z.infer<typeof validateAccessSchema>