import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/drizzle'
import * as drizzleSchema from '@/drizzle/schema'
import { sendBrandEmail } from '@/lib/auth/mail'

const adapterSchema = {
  user: drizzleSchema.User,
  session: drizzleSchema.Session,
  account: drizzleSchema.Account,
  verification: drizzleSchema.Verification,
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: adapterSchema }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendBrandEmail({
        to: user.email,
        subject: 'Reset your password',
        heading: 'Password reset',
        body: `Hi ${user.name}, we received a request to reset your Perfectest CV password. This link expires in 1 hour.`,
        ctaLabel: 'Reset password',
        ctaUrl: url,
        footer: 'If you did not request a password reset, you can safely ignore this email.',
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendBrandEmail({
        to: user.email,
        subject: 'Verify your email',
        heading: 'Verify your email',
        body: `Hi ${user.name}, welcome to Perfectest CV. Confirm your email address to activate your account.`,
        ctaLabel: 'Verify email',
        ctaUrl: url,
        footer: 'If you did not create an account, you can ignore this email.',
      })
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user' },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
