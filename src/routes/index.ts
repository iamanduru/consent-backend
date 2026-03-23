import { Router } from 'express'
import authRoutes from './auth.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DD Consent API is running',
  })
})

router.use('/auth', authRoutes)

export default router