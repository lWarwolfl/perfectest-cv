import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/drizzle'
import * as drizzleSchema from '@/drizzle/schema'

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
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user' },
    },
  },
})
