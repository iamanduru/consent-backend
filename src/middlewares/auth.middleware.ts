import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type AuthPayload = {
  userId: number
  email: string
  role: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required',
    })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload
    req.user = decoded
    next()
  } catch {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}

export function authorizeRoles(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: insufficient permissions',
      })
      return
    }

    next()
  }
}