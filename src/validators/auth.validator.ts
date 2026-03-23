import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(120, 'Email must not exceed 120 characters')
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must not exceed 64 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Password must include uppercase, lowercase, and a number',
    ),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .transform((value) => value.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(64, 'Password must not exceed 64 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>