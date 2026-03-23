import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles,
} from '../middlewares/auth.middleware'
import {
  createConsent,
  updateConsentDecision,
  validateAccess,
  getMyConsentSummary,
  getMyConsents,
  getMyRecentAuditLogs,
  getMyTopConsumers,
  getMyConsentById,
} from '../controllers/consent.controller'

const router = Router()

router.use(authenticateToken)

/**
 * @swagger
 * /api/consents/summary/me:
 *   get:
 *     summary: Get consent summary for the currently authenticated user
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Consent summary returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/summary/me', getMyConsentSummary)

/**
 * @swagger
 * /api/consents/me:
 *   get:
 *     summary: List all consents for the currently authenticated user
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: GRANTED
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: Health
 *     responses:
 *       200:
 *         description: Consents returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getMyConsents)

/**
 * @swagger
 * /api/consents/{id}:
 *   get:
 *     summary: Get a single consent for the currently authenticated user
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Consent returned successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Consent not found
 */
router.get('/:id', getMyConsentById)

/**
 * @swagger
 * /api/consents/activity/me:
 *   get:
 *     summary: Get recent audit logs for the currently authenticated user
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent audit logs returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/activity/me', getMyRecentAuditLogs)

/**
 * @swagger
 * /api/consents/top-consumers/me:
 *   get:
 *     summary: Get top data consumers for the currently authenticated user
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top consumers returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/top-consumers/me', getMyTopConsumers)

/**
 * @swagger
 * /api/consents:
 *   post:
 *     summary: Create a new consent request
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConsentRequest'
 *     responses:
 *       201:
 *         description: Consent request created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authorizeRoles('ADMIN', 'COMPLIANCE_OFFICER'),
  createConsent,
)

/**
 * @swagger
 * /api/consents/{id}/decision:
 *   patch:
 *     summary: Update a consent decision
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Consent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DecideConsentRequest'
 *     responses:
 *       200:
 *         description: Consent updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Consent not found
 */
router.patch(
  '/:id/decision',
  authorizeRoles('USER', 'ADMIN', 'COMPLIANCE_OFFICER'),
  updateConsentDecision,
)

/**
 * @swagger
 * /api/consents/validate-access:
 *   post:
 *     summary: Validate whether a data access request is allowed under a consent
 *     tags: [Consents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateAccessRequest'
 *     responses:
 *       200:
 *         description: Access validation completed
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Consent not found
 */
router.post(
  '/validate-access',
  authorizeRoles('ADMIN', 'COMPLIANCE_OFFICER'),
  validateAccess,
)

export default router