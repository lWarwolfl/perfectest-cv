import 'dotenv/config'
import postgres from 'postgres'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL missing')
const sql = postgres(url)

async function main() {
  await sql`ALTER TABLE "letter" ADD COLUMN IF NOT EXISTS "sender_photo_image_id" text NOT NULL DEFAULT ''`
  await sql`ALTER TABLE "letter" ADD COLUMN IF NOT EXISTS "sender_photo_file_id" text NOT NULL default ''`
  console.log('ok')
  await sql.end()
}
main()
