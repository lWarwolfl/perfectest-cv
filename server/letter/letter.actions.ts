'use server'

import { db } from '@/drizzle'
import { Letter, Resume } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'
import { mergeCustomization, normalizeLetterDesign } from '@/features/letter/types'
import type { LetterDesign } from '@/features/letter/types'
import type { LetterDateMode } from '@/features/resume/types'

export type LetterContentPatch = Partial<{
  body: string
  subject: string
  dateMode: LetterDateMode
  dateCustom: string
  senderName: string
  senderPhotoImageId: string
  senderPhotoFileId: string
  senderJobTitle: string
  senderEmail: string
  senderPhone: string
  senderAddress: string
  senderWebsite: string
  senderLinkedIn: string
  senderGitHub: string
  recipientName: string
  recipientPosition: string
  recipientCompany: string
  recipientAddress: string
  signatureName: string
  signaturePlace: string
  signatureDate: string
  signatureImageId: string
}>

export async function listLettersAction() {
  const user = await requireUser()
  return db.query.Letter.findMany({
    where: eq(Letter.userId, user.id),
    orderBy: [desc(Letter.updatedAt)],
    columns: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      lng: true,
      tags: true,
      order: true,
    },
  })
}
export type TListLettersAction = Awaited<ReturnType<typeof listLettersAction>>

export async function listLetterPreviewsAction() {
  const user = await requireUser()
  return db.query.Letter.findMany({
    where: eq(Letter.userId, user.id),
    orderBy: [desc(Letter.updatedAt)],
    columns: {
      id: true, title: true, updatedAt: true, design: true,
      webResumeLive: true,
      body: true, subject: true, dateMode: true, dateCustom: true,
      senderName: true, senderJobTitle: true, senderEmail: true, senderPhone: true,
      senderAddress: true, senderWebsite: true, senderLinkedIn: true, senderGitHub: true,
      recipientName: true, recipientPosition: true, recipientCompany: true, recipientAddress: true,
      signatureName: true, signaturePlace: true, signatureDate: true, signatureImageId: true,
    },
  })
}
export type TListLetterPreviewsAction = Awaited<ReturnType<typeof listLetterPreviewsAction>>

export async function getLetterAction(id: string) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!letter) redirect('/app/dashboard')
  return letter
}

export async function createLetterAction(title?: string) {
  const user = await requireUser()
  const [letter] = await db.insert(Letter).values({ userId: user.id, ...(title ? { title } : {}) }).returning()
  return letter
}

export async function duplicateLetterAction(letterId: string) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({ where: eq(Letter.id, letterId) })
  if (!letter) throw new Error('Letter not found')
  const [copy] = await db
    .insert(Letter)
    .values({
      ...letter,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      userId: user.id,
      title: `${letter.title} (copy)`,
    })
    .returning()
  return copy
}

export async function renameLetterAction(letterId: string, title: string) {
  await requireUser()
  await db.update(Letter).set({ title }).where(eq(Letter.id, letterId))
}

export async function deleteLetterAction(id: string) {
  await requireUser()
  await db.delete(Letter).where(eq(Letter.id, id))
}

export async function saveLetterContentAction(id: string, patch: LetterContentPatch) {
  await requireUser()
  await db.update(Letter).set(patch).where(eq(Letter.id, id))
}

export async function saveLetterDesignAction(id: string, design: LetterDesign) {
  await requireUser()
  await db.update(Letter).set({ design }).where(eq(Letter.id, id))
}

export async function setLetterShareAction(letterId: string, live: boolean) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { and }) => and(eq(t.id, letterId), eq(t.userId, user.id)),
  })
  if (!letter) throw new Error('Letter not found')
  const token = live ? crypto.randomUUID() : null
  await db.update(Letter).set({ webResumeLive: live, webToken: token }).where(eq(Letter.id, letterId))
  if (letter.webToken) revalidatePath(`/share/letter/${letter.webToken}`)
  if (token) revalidatePath(`/share/letter/${token}`)
  return { live, token }
}

export async function getPublicLetterAction(shareCode: string) {
  return db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.webToken, shareCode), eq(t.webResumeLive, true)),
  })
}

export async function copyResumeDetailsAction(letterId: string, resumeId: string) {
  await requireUser()
  const resume = await db.query.Resume.findFirst({ where: eq(Resume.id, resumeId) })
  if (!resume) throw new Error('Resume not found')
  const p = { ...EMPTY_PERSONAL_DETAILS, ...(resume.personalDetails || {}) }
  const patch: LetterContentPatch = {
    senderName: p.fullName,
    senderJobTitle: p.jobTitle,
    senderEmail: p.displayEmail,
    senderPhone: p.phone,
    senderAddress: p.address,
    senderWebsite: p.website,
    senderLinkedIn: p.social.linkedIn.display || p.social.linkedIn.link,
    senderGitHub: p.social.github.display || p.social.github.link,
    senderPhotoImageId: p.photo?.imageId || '',
    senderPhotoFileId: p.photo?.fileId || '',
  }
  await db.update(Letter).set(patch).where(eq(Letter.id, letterId))
  return patch
}

export async function copyResumeDesignAction(letterId: string, resumeId: string) {
  await requireUser()
  const resume = await db.query.Resume.findFirst({ where: eq(Resume.id, resumeId) })
  if (!resume) throw new Error('Resume not found')
  const letter = await db.query.Letter.findFirst({ where: eq(Letter.id, letterId) })
  if (!letter) throw new Error('Letter not found')
  const prev = normalizeLetterDesign(letter.design)
  const c = mergeCustomization(resume.customization)
  const design: LetterDesign = {
    ...prev,
    customization: c,
    syncedFromResume: true,
  }
  await db.update(Letter).set({ design }).where(eq(Letter.id, letterId))
  return design
}
