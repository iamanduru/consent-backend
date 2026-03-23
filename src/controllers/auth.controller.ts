import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, comparePassword } from '../utils/hash'
import { signAccessToken } from '../utils/jwt'
import { loginSchema, registerSchema } from '../validators/auth.validator'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const { fullName, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      })
      return
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: user,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.flatten().fieldErrors,
      })
      return
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    const passwordMatches = await comparePassword(password, user.passwordHash)

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function getCurrentUser(
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        mfaEnabled: true,
        createdAt: true,
      },
    })

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export async function adminOnlyTest(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin. Protected route accessed successfully.',
  })
}