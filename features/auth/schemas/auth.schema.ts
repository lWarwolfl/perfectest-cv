import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export const signUpSchema = z
  .object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Confirm your password' }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type TSignIn = z.infer<typeof signInSchema>
export type TSignUp = z.infer<typeof signUpSchema>
export type TForgotPassword = z.infer<typeof forgotPasswordSchema>
export type TResetPassword = z.infer<typeof resetPasswordSchema>
