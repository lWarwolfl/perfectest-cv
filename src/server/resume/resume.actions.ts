'use server'

import { db } from '@/drizzle'
import { Resume } from '@/drizzle/schema'
import { getCurrentUser } from '@/lib/auth/server'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type { Content, Customization, PersonalDetails } from '@/features/resume/types'

export async function listResumesAction() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  return db.query.Resume.findMany({
    where: eq(Resume.userId, user.id),
    orderBy: [desc(Resume.updatedAt)],
  })
}
export type TListResumesAction = Awaited<ReturnType<typeof listResumesAction>>

export async function getResumeAction(id: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const resume = await db.query.Resume.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!resume) redirect('/app/dashboard')
  return resume
}

export async function createResumeAction() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const [resume] = await db
    .insert(Resume)
    .values({ userId: user.id })
    .returning()
  return resume
}

export async function duplicateResumeAction(resumeId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const original = await getResumeAction(resumeId)
  const [resume] = await db
    .insert(Resume)
    .values({
      userId: user.id,
      title: `${original.title} (copy)`,
      personalDetails: original.personalDetails,
      content: original.content,
      customization: original.customization,
      lng: original.lng,
      tags: original.tags,
    })
    .returning()
  return resume
}

export async function deleteResumeAction(resumeId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.delete(Resume).where(eq(Resume.id, resumeId))
}

export async function renameResumeAction(resumeId: string, title: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Resume).set({ title }).where(eq(Resume.id, resumeId))
}

export async function saveResumePersonalDetailsAction(
  resumeId: string,
  personalDetails: PersonalDetails
) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Resume).set({ personalDetails }).where(eq(Resume.id, resumeId))
}

export async function saveResumeContentAction(resumeId: string, content: Content) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Resume).set({ content }).where(eq(Resume.id, resumeId))
}

export async function saveResumeCustomizationAction(
  resumeId: string,
  customization: Customization
) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Resume).set({ customization }).where(eq(Resume.id, resumeId))
}

export async function applyResumeTemplateAction(resumeId: string, templateId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const { RESUME_TEMPLATES } = await import('@/features/resume/templates')
  const template = RESUME_TEMPLATES.find((t) => t.id === templateId)
  if (!template) throw new Error('Template not found')
  await db
    .update(Resume)
    .set({ content: template.content, customization: template.customization })
    .where(eq(Resume.id, resumeId))
}

export async function getPublicResumeAction(shareCode: string) {
  const resume = await db.query.Resume.findFirst({
    where: (t, { eq, and }) => and(eq(t.webToken, shareCode), eq(t.webResumeLive, true)),
  })
  return resume
}