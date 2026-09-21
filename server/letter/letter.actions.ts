'use server'

import { db } from '@/drizzle'
import { Letter } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
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
  senderEmailLink: string
  senderPhone: string
  senderPhoneLink: string
  senderAddress: string
  senderWebsite: string
  senderWebsiteLink: string
  senderLinkedIn: string
  senderLinkedInLink: string
  senderGitHub: string
  senderGitHubLink: string
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

export async function listLetterPreviewsAction({ page = 1, limit = 6, query = '' } = {}) {
  const user = await requireUser()
  const q = query.trim().replace(/[\\%_]/g, (m) => `\\${m}`)
  const filter = q
    ? and(eq(Letter.userId, user.id), ilike(Letter.title, `%${q}%`))
    : eq(Letter.userId, user.id)
  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(Letter)
    .where(filter)
  const pagination = {
    page,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    limit,
  }
  const letters = await db.query.Letter.findMany({
    where: filter,
    orderBy: [desc(Letter.updatedAt)],
    limit,
    offset: (page - 1) * limit,
    columns: {
      id: true,
      title: true,
      updatedAt: true,
      design: true,
      webResumeLive: true,
      body: true,
      subject: true,
      dateMode: true,
      dateCustom: true,
      senderName: true,
      senderJobTitle: true,
      senderEmail: true,
      senderEmailLink: true,
      senderPhone: true,
      senderPhoneLink: true,
      senderAddress: true,
      senderWebsite: true,
      senderWebsiteLink: true,
      senderLinkedIn: true,
      senderLinkedInLink: true,
      senderGitHub: true,
      senderGitHubLink: true,
      recipientName: true,
      recipientPosition: true,
      recipientCompany: true,
      recipientAddress: true,
      signatureName: true,
      signaturePlace: true,
      signatureDate: true,
      signatureImageId: true,
    },
  })
  return { letters, pagination }
}
export type TListLetterPreviewsAction = Awaited<ReturnType<typeof listLetterPreviewsAction>>

export async function getLetterAction(id: string) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!letter) redirect('/dashboard')
  return letter
}

export async function createLetterAction(title?: string) {
  const user = await requireUser()
  const [letter] = await db
    .insert(Letter)
    .values({ userId: user.id, ...(title ? { title } : {}) })
    .returning()
  return letter
}

const SAMPLE_LETTER_BODY =
  '<p>Dear Hiring Manager,</p><p>I am excited to apply for the Senior Frontend Developer role at Nova Digital. With 7+ years of experience building accessible, high-performance web applications in React and TypeScript, I would love to bring my skills in design systems and performance optimization to your team.</p><p>In my current role, I led a design-system rebuild used by 40+ engineers, cutting bundle size by 35% and lifting Lighthouse performance from 62 to 96. I care deeply about craft, collaboration, and mentoring — and I would welcome the chance to discuss how I can contribute to your goals.</p><p>Thank you for your time and consideration.</p>'

export async function createLetterFromTemplateAction(templateId: string) {
  const user = await requireUser()
  const { LETTER_TEMPLATES } = await import('@/features/resume/templates')
  const template = LETTER_TEMPLATES.find((t) => t.id === templateId)
  if (!template) throw new Error('Template not found')
  const [letter] = await db
    .insert(Letter)
    .values({
      userId: user.id,
      title: `${template.name} Cover Letter`,
      design: template.design,
      senderName: 'Alex Morgan',
      senderJobTitle: 'Senior Frontend Developer',
      senderEmail: 'alex.morgan@example.com',
      senderEmailLink: 'mailto:alex.morgan@example.com',
      senderPhone: '+31 20 555 0199',
      senderPhoneLink: 'tel:+31205550199',
      senderAddress: 'Amsterdam, Netherlands',
      senderWebsite: 'alexmorgan.dev',
      senderWebsiteLink: 'https://alexmorgan.dev',
      senderLinkedIn: 'linkedin.com/in/alexmorgan',
      senderLinkedInLink: 'https://linkedin.com/in/alexmorgan',
      senderGitHub: 'github.com/alexmorgan',
      senderGitHubLink: 'https://github.com/alexmorgan',
      recipientName: 'Hiring Manager',
      recipientPosition: 'Engineering Lead',
      recipientCompany: 'Nova Digital',
      recipientAddress: 'Amsterdam, Netherlands',
      subject: 'Application for Senior Frontend Developer',
      body: SAMPLE_LETTER_BODY,
      signatureName: 'Alex Morgan',
      signaturePlace: 'Amsterdam',
    })
    .returning()
  return letter
}

export async function duplicateLetterAction(letterId: string) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, letterId), eq(t.userId, user.id)),
  })
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
  const user = await requireUser()
  await db
    .update(Letter)
    .set({ title })
    .where(and(eq(Letter.id, letterId), eq(Letter.userId, user.id)))
}

export async function deleteLetterAction(id: string) {
  const user = await requireUser()
  await db.delete(Letter).where(and(eq(Letter.id, id), eq(Letter.userId, user.id)))
}

export async function saveLetterContentAction(id: string, patch: LetterContentPatch) {
  const user = await requireUser()
  await db
    .update(Letter)
    .set(patch)
    .where(and(eq(Letter.id, id), eq(Letter.userId, user.id)))
}

export async function saveLetterDesignAction(id: string, design: LetterDesign) {
  const user = await requireUser()
  await db
    .update(Letter)
    .set({ design })
    .where(and(eq(Letter.id, id), eq(Letter.userId, user.id)))
}

export async function setLetterShareAction(letterId: string, live: boolean) {
  const user = await requireUser()
  const letter = await db.query.Letter.findFirst({
    where: (t, { and }) => and(eq(t.id, letterId), eq(t.userId, user.id)),
  })
  if (!letter) throw new Error('Letter not found')
  const token = live ? crypto.randomUUID() : null
  await db
    .update(Letter)
    .set({ webResumeLive: live, webToken: token })
    .where(eq(Letter.id, letterId))
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
  const user = await requireUser()
  const [resume, letter] = await Promise.all([
    db.query.Resume.findFirst({
      where: (t, { eq, and }) => and(eq(t.id, resumeId), eq(t.userId, user.id)),
    }),
    db.query.Letter.findFirst({
      where: (t, { eq, and }) => and(eq(t.id, letterId), eq(t.userId, user.id)),
    }),
  ])
  if (!resume) throw new Error('Resume not found')
  if (!letter) throw new Error('Letter not found')
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
  await db
    .update(Letter)
    .set(patch)
    .where(and(eq(Letter.id, letterId), eq(Letter.userId, user.id)))
  return patch
}

export async function copyResumeDesignAction(letterId: string, resumeId: string) {
  const user = await requireUser()
  const [resume, letter] = await Promise.all([
    db.query.Resume.findFirst({
      where: (t, { eq, and }) => and(eq(t.id, resumeId), eq(t.userId, user.id)),
    }),
    db.query.Letter.findFirst({
      where: (t, { eq, and }) => and(eq(t.id, letterId), eq(t.userId, user.id)),
    }),
  ])
  if (!resume) throw new Error('Resume not found')
  if (!letter) throw new Error('Letter not found')
  const prev = normalizeLetterDesign(letter.design)
  const c = mergeCustomization(resume.customization)
  const design: LetterDesign = {
    ...prev,
    customization: c,
    syncedFromResume: true,
  }
  await db
    .update(Letter)
    .set({ design })
    .where(and(eq(Letter.id, letterId), eq(Letter.userId, user.id)))
  return design
}
