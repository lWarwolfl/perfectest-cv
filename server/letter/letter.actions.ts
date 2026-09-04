'use server'

import { db } from '@/drizzle'
import { Letter, Resume } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import { EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'
import { EMPTY_LETTER_DESIGN } from '@/features/letter/types'
import type { LetterDesign } from '@/features/letter/types'
import type { LetterDateMode } from '@/features/resume/types'

export type LetterContentPatch = Partial<{
  body: string
  subject: string
  dateMode: LetterDateMode
  dateCustom: string
  senderName: string
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
  const c = { ...DEFAULT_CUSTOMIZATION, ...(resume.customization || {}) }
  const design: LetterDesign = {
    ...EMPTY_LETTER_DESIGN,
    ...(letter.design || {}),
    fontFamily: c.font.fontFamily,
    fontSizePt: 10 + Number(c.spacing.fontSize),
    lineHeightPct: 1.2 + Number(c.spacing.lineHeight) * 0.1,
    nameFontSizePt: c.spacing.nameFontSizePt,
    jobTitleFontSizePt: c.spacing.jobTitleFontSizePt,
    colors: {
      mode: 'basic',
      basic: {
        single: c.colors.basic.single,
        multi: c.colors.basic.multi,
        selected: 'single',
      },
    },
    verticalMarginMm: 10 + Number(c.spacing.marginVertical),
    horizontalMarginMm: 10 + Number(c.spacing.marginHorizontal),
    headerSettings: c.header,
    syncedFromResume: true,
  }
  await db.update(Letter).set({ design }).where(eq(Letter.id, letterId))
  return design
}
