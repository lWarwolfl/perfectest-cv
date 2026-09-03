'use server'

import { db } from '@/drizzle'
import { Letter } from '@/drizzle/schema'
import { getCurrentUser } from '@/lib/auth/server'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type { LetterContent, LetterDesign } from '@/features/letter/types'

export async function listLettersAction() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  return db.query.Letter.findMany({
    where: eq(Letter.userId, user.id),
    orderBy: [desc(Letter.updatedAt)],
  })
}
export type TListLettersAction = Awaited<ReturnType<typeof listLettersAction>>

export async function getLetterAction(id: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const letter = await db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!letter) redirect('/app/dashboard')
  return letter
}

export async function createLetterAction() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const [letter] = await db.insert(Letter).values({ userId: user.id }).returning()
  return letter
}

export async function deleteLetterAction(id: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.delete(Letter).where(eq(Letter.id, id))
}

export async function saveLetterContentAction(id: string, content: LetterContent) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Letter).set({ content }).where(eq(Letter.id, id))
}

export async function saveLetterDesignAction(id: string, design: LetterDesign) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Letter).set({ design }).where(eq(Letter.id, id))
}