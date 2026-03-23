import { Router } from 'express'
import authRoutes from './auth.routes'
import consentRoutes from './consent.routes'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DD Consent API is running',
  })
})

router.use('/auth', authRoutes)
router.use('/consents', consentRoutes)

export default router