'use server'

import { db } from '@/drizzle'
import { Resume, ResumeSection, ResumeEntry } from '@/drizzle/schema'
import { getCurrentUser } from '@/lib/auth/server'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { SECTION_LABELS, SECTION_ICONS, defaultEntryData } from '@/features/resume/defaults'
import type { TSection, TEntry, Customization, PersonalDetails, EntryData, SectionType } from '@/features/resume/types'

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  return user
}

export async function getResumeDocumentAction(resumeId: string) {
  const user = await requireUser()
  const [resume] = await db.select().from(Resume).where(eq(Resume.id, resumeId))
  if (!resume || resume.userId !== user.id) return null
  const sections = await db.query.ResumeSection.findMany({
    where: eq(ResumeSection.resumeId, resumeId),
    orderBy: [asc(ResumeSection.order), asc(ResumeSection.createdAt)],
  })
  const sectionIds = sections.map((s) => s.id)
  const entries = sectionIds.length
    ? await db.query.ResumeEntry.findMany({
        where: inArray(ResumeEntry.sectionId, sectionIds),
        orderBy: [asc(ResumeEntry.order), asc(ResumeEntry.createdAt)],
      })
    : []
  const entriesBySection = new Map<string, TEntry[]>()
  for (const e of entries) {
    const list = entriesBySection.get(e.sectionId) || []
    list.push(e as TEntry)
    entriesBySection.set(e.sectionId, list)
  }
  const doc: TSection[] = sections.map((s) => ({ ...s, entries: entriesBySection.get(s.id) || [] }))
  return { resume, sections: doc }
}
export type TResumeDocument = NonNullable<Awaited<ReturnType<typeof getResumeDocumentAction>>>

async function seedDefaultSections(resumeId: string) {
  const seedTypes: SectionType[] = ['profile', 'work', 'education', 'skill']
  await db.insert(ResumeSection).values(
    seedTypes.map((t, i) => ({
      resumeId,
      order: i,
      sectionType: t,
      displayName: SECTION_LABELS[t],
      iconKey: SECTION_ICONS[t],
    }))
  )
}

export async function createResumeAction() {
  const user = await requireUser()
  const [resume] = await db.insert(Resume).values({ userId: user.id }).returning()
  await seedDefaultSections(resume.id)
  return resume
}

export async function duplicateResumeAction(resumeId: string) {
  const user = await requireUser()
  const { resume, sections } = (await getResumeDocumentAction(resumeId))!
  const [copy] = await db
    .insert(Resume)
    .values({
      userId: user.id,
      title: `${resume.title} (copy)`,
      personalDetails: resume.personalDetails,
      customization: resume.customization,
      lng: resume.lng,
      tags: resume.tags,
    })
    .returning()
  for (const s of sections) {
    const [newSection] = await db
      .insert(ResumeSection)
      .values({
        resumeId: copy.id,
        order: s.order,
        sectionType: s.sectionType,
        displayName: s.displayName,
        iconKey: s.iconKey,
        hidden: s.hidden,
      })
      .returning()
    if (s.entries.length) {
      await db.insert(ResumeEntry).values(
        s.entries.map((e, i) => ({
          sectionId: newSection.id,
          order: i,
          hidden: e.hidden,
          data: e.data,
        }))
      )
    }
  }
  return copy
}

export async function deleteResumeAction(resumeId: string) {
  await requireUser()
  await db.delete(Resume).where(eq(Resume.id, resumeId))
}

export async function renameResumeAction(resumeId: string, title: string) {
  await requireUser()
  await db.update(Resume).set({ title }).where(eq(Resume.id, resumeId))
}

export async function saveResumePersonalDetailsAction(
  resumeId: string,
  personalDetails: PersonalDetails
) {
  await requireUser()
  await db.update(Resume).set({ personalDetails }).where(eq(Resume.id, resumeId))
}

export async function saveResumeCustomizationAction(
  resumeId: string,
  customization: Customization
) {
  await requireUser()
  await db.update(Resume).set({ customization }).where(eq(Resume.id, resumeId))
}

export async function saveSectionMetaAction(
  sectionId: string,
  patch: Partial<Pick<TSection, 'displayName' | 'iconKey' | 'hidden' | 'order'>>
) {
  await requireUser()
  await db.update(ResumeSection).set(patch).where(eq(ResumeSection.id, sectionId))
}

export async function reorderSectionsAction(resumeId: string, sectionIds: string[]) {
  await requireUser()
  await Promise.all(
    sectionIds.map((id, i) =>
      db.update(ResumeSection).set({ order: i }).where(eq(ResumeSection.id, id))
    )
  )
}

export async function addSectionAction(resumeId: string, sectionType: SectionType) {
  await requireUser()
  const existing = await db.query.ResumeSection.findMany({ where: eq(ResumeSection.resumeId, resumeId) })
  const [section] = await db
    .insert(ResumeSection)
    .values({
      resumeId,
      order: existing.length,
      sectionType,
      displayName: SECTION_LABELS[sectionType],
      iconKey: SECTION_ICONS[sectionType],
    })
    .returning()
  const [entry] = await db
    .insert(ResumeEntry)
    .values({ sectionId: section.id, order: 0, data: defaultEntryData(sectionType) })
    .returning()
  return { section, entry }
}

export async function deleteSectionAction(sectionId: string) {
  await requireUser()
  await db.delete(ResumeSection).where(eq(ResumeSection.id, sectionId))
}

export async function addEntryAction(sectionId: string) {
  await requireUser()
  const section = await db.query.ResumeSection.findFirst({ where: eq(ResumeSection.id, sectionId) })
  if (!section) throw new Error('Section not found')
  const existing = await db.query.ResumeEntry.findMany({ where: eq(ResumeEntry.sectionId, sectionId) })
  const [entry] = await db
    .insert(ResumeEntry)
    .values({ sectionId, order: existing.length, data: defaultEntryData(section.sectionType) })
    .returning()
  return entry as TEntry
}

export async function updateEntryDataAction(entryId: string, data: EntryData) {
  await requireUser()
  await db.update(ResumeEntry).set({ data }).where(eq(ResumeEntry.id, entryId))
}

export async function updateEntryMetaAction(
  entryId: string,
  patch: Partial<Pick<TEntry, 'hidden' | 'order'>>
) {
  await requireUser()
  await db.update(ResumeEntry).set(patch).where(eq(ResumeEntry.id, entryId))
}

export async function reorderEntriesAction(sectionId: string, entryIds: string[]) {
  await requireUser()
  await Promise.all(
    entryIds.map((id, i) =>
      db.update(ResumeEntry).set({ order: i }).where(eq(ResumeEntry.id, id))
    )
  )
}

export async function deleteEntryAction(entryId: string) {
  await requireUser()
  await db.delete(ResumeEntry).where(eq(ResumeEntry.id, entryId))
}

export async function applyResumeTemplateAction(resumeId: string, templateId: string) {
  await requireUser()
  const { RESUME_TEMPLATES } = await import('@/features/resume/templates')
  const template = RESUME_TEMPLATES.find((t) => t.id === templateId)
  if (!template) throw new Error('Template not found')
  await db.delete(ResumeSection).where(eq(ResumeSection.resumeId, resumeId))
  await seedDefaultSections(resumeId)
  await db.update(Resume).set({ customization: template.customization }).where(eq(Resume.id, resumeId))
  return template
}

export async function getPublicResumeAction(shareCode: string) {
  const resume = await db.query.Resume.findFirst({
    where: (t, { eq, and }) => and(eq(t.webToken, shareCode), eq(t.webResumeLive, true)),
  })
  return resume
}

export async function listResumesAction() {
  const user = await requireUser()
  return db.query.Resume.findMany({
    where: eq(Resume.userId, user.id),
    orderBy: [desc(Resume.updatedAt)],
    columns: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      lng: true,
      tags: true,
      order: true,
      webResumeLive: true,
      feedbackEnabled: true,
    },
  })
}
export type TListResumesAction = Awaited<ReturnType<typeof listResumesAction>>

export async function listResumePreviewsAction() {
  const user = await requireUser()
  const resumes = await db.query.Resume.findMany({
    where: eq(Resume.userId, user.id),
    orderBy: [desc(Resume.updatedAt)],
    columns: { id: true, title: true, updatedAt: true },
  })
  return Promise.all(
    resumes.map(async (r) => {
      const doc = await getResumeDocumentAction(r.id)
      return {
        id: r.id,
        title: r.title,
        updatedAt: r.updatedAt,
        doc: { sections: doc?.sections ?? [], personalDetails: doc?.resume.personalDetails ?? null, customization: doc?.resume.customization ?? null },
      }
    })
  )
}
export type TListResumePreviewsAction = Awaited<ReturnType<typeof listResumePreviewsAction>>

export async function getResumeAction(id: string) {
  const user = await requireUser()
  const resume = await db.query.Resume.findFirst({
    where: (t, { eq, and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!resume) redirect('/app/dashboard')
  return resume
}
