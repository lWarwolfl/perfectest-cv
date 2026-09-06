import * as schema from '@/drizzle/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const globalForDb = globalThis as unknown as { dbClient?: ReturnType<typeof postgres> }

// Neon pooler connections go stale/drop intermittently (ETIMEDOUT flakes);
// cap lifetime and idle so psql.js reconnects instead of failing on a dead socket.
export const dbClient =
  globalForDb.dbClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.dbClient = dbClient

export const db = drizzle(dbClient, { schema })
export type TDatabase = typeof db
