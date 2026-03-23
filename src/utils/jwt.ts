import jwt from 'jsonwebtoken'

type JwtPayload = {
  userId: number
  email: string
  role: string
}

export function signAccessToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1d',
  })
}