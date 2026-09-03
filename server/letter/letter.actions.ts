'use server'

import { db } from '@/drizzle'
import { Letter, Resume } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type { LetterDesign } from '@/features/letter/types'
import type { LetterDateMode } from '@/features/resume/types'

// partial update over any flat letter column(s)
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

export async function getLetterAction(id: string) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!letter) redirect('/app/dashboard')
  return letter
}

export async function createLetterAction() {
  const user = await requireUser()
  const [letter] = await db.insert(Letter).values({ userId: user.id }).returning()
  return letter
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

// copy typography/color/paper design from a resume onto this letter
export async function copyResumeDesignAction(letterId: string, resumeId: string) {
  await requireUser()
  const resume = await db.query.Resume.findFirst({ where: eq(Resume.id, resumeId) })
  if (!resume) throw new Error('Resume not found')
  const letter = await db.query.Letter.findFirst({ where: eq(Letter.id, letterId) })
  if (!letter) throw new Error('Letter not found')
  const c = resume.customization
  const design: LetterDesign = {
    ...letter.design,
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
    syncedFromResume: true,
  }
  await db.update(Letter).set({ design }).where(eq(Letter.id, letterId))
  return design
}
