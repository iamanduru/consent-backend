import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import pinoHttp from 'pino-http'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(helmet())

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(pinoHttp())

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again later.',
    },
  }),
)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Consent API is running',
  })
})

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})