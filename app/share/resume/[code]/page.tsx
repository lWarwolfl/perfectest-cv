import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/drizzle'
import { ResumeSection, ResumeEntry } from '@/drizzle/schema'
import { getPublicResumeAction } from '@/server/resume/resume.actions'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { DEFAULT_CUSTOMIZATION, EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'
import { pageDims } from '@/components/common/preview-frame'
import type { TEntry, TSection } from '@/features/resume/types'

interface SharePageProps {
  params: Promise<{ code: string }>
}

export const revalidate = 300

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { code } = await params
  const resume = await getPublicResumeAction(code)
  const name = resume?.personalDetails?.fullName || resume?.title || 'Resume'
  return { title: `${name} - Perfectest CV` }
}

export default async function SharedResumePage({ params }: SharePageProps) {
  const { code } = await params
  const resume = await getPublicResumeAction(code)
  if (!resume) notFound()

  const sections = await db.query.ResumeSection.findMany({
    where: eq(ResumeSection.resumeId, resume.id),
    orderBy: [asc(ResumeSection.order), asc(ResumeSection.createdAt)],
  })
  const entries = sections.length
    ? await db.query.ResumeEntry.findMany({
        where: inArray(ResumeEntry.sectionId, sections.map((s) => s.id)),
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

  const c = { ...DEFAULT_CUSTOMIZATION, ...(resume.customization || {}) }
  const { widthMm, heightMm } = pageDims(c.regional?.pageFormat)

  return (
    <div className="preview-light min-h-screen bg-background py-6 flex justify-center px-4">
      <div
        className="w-full bg-white"
        style={{ maxWidth: widthMm * 3.78, aspectRatio: `${widthMm} / ${heightMm}` }}
      >
        <ResumeRenderer
          personalDetails={{ ...EMPTY_PERSONAL_DETAILS, ...(resume.personalDetails || {}) }}
          sections={doc}
          customization={c}
        />
      </div>
    </div>
  )
}
