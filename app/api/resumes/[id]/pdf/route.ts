import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/drizzle'
import { Resume } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getResumeDocumentAction } from '@/server/resume/resume.actions'
import {
  DEFAULT_CUSTOMIZATION,
  EMPTY_PERSONAL_DETAILS,
  SECTION_LABELS,
} from '@/features/resume/defaults'
import type { Customization, PersonalDetails, TEntry, TSection } from '@/features/resume/types'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement as h } from 'react'

export const dynamic = 'force-dynamic'

function getColors(c: Customization) {
  const colors = { ...DEFAULT_CUSTOMIZATION.colors, ...c.colors }
  const basic = colors.basic
  const multi = colors.mode === 'advanced' ? colors.advanced.multi.light : basic.multi
  return {
    accent:
      colors.mode === 'advanced'
        ? colors.advanced.single
        : basic.selected === 'multi'
          ? multi.accentColor
          : basic.single,
    text:
      colors.mode === 'advanced'
        ? multi.textColor
        : basic.selected === 'multi'
          ? multi.textColor
          : '#000000',
    bg:
      colors.mode === 'advanced'
        ? multi.backgroundColor
        : basic.selected === 'multi'
          ? multi.backgroundColor
          : '#ffffff',
  }
}

function dateStr(
  d:
    | {
        hide?: boolean
        onlyYear?: boolean
        ongoing?: boolean
        year?: string
        month?: string
        customOngoingWord?: string
      }
    | undefined
    | null,
  dateDisplay: string
) {
  if (!d || d.hide) return ''
  if (d.onlyYear) return d.year || ''
  const m =
    d.month && d.month !== '0'
      ? (dateDisplay === 'MMM YYYY'
          ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
              Number(d.month) - 1
            ] || d.month
          : d.month) + ' '
      : ''
  if (d.ongoing) return `${m}${d.year || ''} ${d.customOngoingWord || 'present'}`.trim()
  return `${m}${d.year || ''}`.trim()
}

function dateRange(
  s: Parameters<typeof dateStr>[0],
  e: Parameters<typeof dateStr>[0],
  dateDisplay: string
) {
  const [a, b] = [dateStr(s, dateDisplay), dateStr(e, dateDisplay)]
  return a || b ? [a, b].filter(Boolean).join(' - ') : ''
}

function weight(v: number | string | undefined) {
  return Number(v) >= 600 || v === 'bold' ? 'bold' : 'normal'
}

function entryEl(e: TEntry, c: Customization, col: { accent: string; text: string }, base: number) {
  const d = e.data
  if (!d) return null
  const dim = { color: '#777777', fontSize: base * 0.85 }
  const head = (main: string, sub: string) =>
    h(
      View,
      { style: { flexDirection: 'row', justifyContent: 'space-between' } },
      h(
        Text,
        { style: { fontWeight: 'bold' as const } },
        main,
        sub
          ? h(Text, { style: { fontWeight: 'normal' as const, color: '#777777' } }, ' - ' + sub)
          : null
      ),
      h(
        Text,
        {
          style: { fontSize: base * 0.85, color: c.applyAccentColor.dates ? col.accent : col.text },
        },
        ''
      )
    )
  switch (d.type) {
    case 'work':
      return h(
        View,
        { key: e.id, style: { marginBottom: 6 } },
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between' } },
          h(
            Text,
            { style: { fontWeight: 'bold' as const } },
            c.workDisplay.jobTitleBeforeEmployer ? d.jobTitle : d.employer,
            d.jobTitle && d.employer
              ? ` - ${c.workDisplay.jobTitleBeforeEmployer ? d.employer : d.jobTitle}`
              : ''
          ),
          h(
            Text,
            {
              style: {
                fontSize: base * 0.85,
                color: c.applyAccentColor.dates ? col.accent : col.text,
              },
            },
            dateRange(d.startDate, d.endDate, c.regional?.dateDisplay || 'MM/YYYY')
          )
        ),
        d.location ? h(Text, { style: dim }, d.location) : null,
        d.description ? h(Text, {}, d.description.replace(/<[^>]*>/g, ' ')) : null
      )
    case 'education':
      return h(
        View,
        { key: e.id, style: { marginBottom: 6 } },
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between' } },
          h(
            Text,
            { style: { fontWeight: 'bold' as const } },
            c.educationDisplay.degreeBeforeSchool ? d.degree : d.school,
            d.degree && d.school
              ? ` - ${c.educationDisplay.degreeBeforeSchool ? d.school : d.degree}`
              : ''
          ),
          h(
            Text,
            {
              style: {
                fontSize: base * 0.85,
                color: c.applyAccentColor.dates ? col.accent : col.text,
              },
            },
            dateRange(d.startDate, d.endDate, c.regional?.dateDisplay || 'MM/YYYY')
          )
        ),
        d.location ? h(Text, { style: dim }, d.location) : null,
        d.description ? h(Text, {}, d.description.replace(/<[^>]*>/g, ' ')) : null
      )
    case 'profile':
      return h(Text, { key: e.id }, d.text?.replace(/<[^>]*>/g, ' '))
    case 'skill':
      return h(
        Text,
        { key: e.id },
        d.skill,
        d.infoHtml
          ? h(Text, { style: dim }, `: ${d.infoHtml.replace(/<[^>]*>/g, ' ').trim()}`)
          : null
      )
    case 'language':
      return h(Text, { key: e.id }, d.language, d.level ? ` (${d.level})` : '')
    case 'interest':
      return h(Text, { key: e.id }, d.interest)
    case 'project':
      return h(
        View,
        { key: e.id, style: { marginBottom: 6 } },
        h(Text, { style: { fontWeight: 'bold' as const } }, d.projectTitle),
        d.subTitle ? h(Text, { style: dim }, d.subTitle) : null,
        d.description ? h(Text, {}, d.description.replace(/<[^>]*>/g, ' ')) : null
      )
    case 'certificate':
    case 'award':
    case 'publication':
    case 'organisation':
    case 'course': {
      const desc = 'description' in d ? d.description : ''
      return h(
        View,
        { key: e.id, style: { marginBottom: 4 } },
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between' } },
          h(
            Text,
            { style: { fontWeight: 'bold' as const } },
            d.title,
            d.issuer ? ` - ${d.issuer}` : ''
          ),
          d.date ? h(Text, { style: { fontSize: base * 0.85 } }, d.date) : null
        ),
        desc ? h(Text, {}, desc.replace(/<[^>]*>/g, ' ')) : null
      )
    }
    case 'custom':
      return h(
        View,
        { key: e.id, style: { marginBottom: 6 } },
        h(
          Text,
          { style: { fontWeight: 'bold' as const } },
          d.title,
          d.subTitle ? ` - ${d.subTitle}` : ''
        ),
        d.description ? h(Text, {}, d.description.replace(/<[^>]*>/g, ' ')) : null
      )
    case 'reference':
      return h(Text, { key: e.id }, d.name, d.contact ? ` - ${d.contact}` : '')
    case 'declaration':
      return h(Text, { key: e.id }, d.text?.replace(/<[^>]*>/g, ' '))
    default:
      return null
  }
}

function buildDoc(personal: PersonalDetails, sections: TSection[], c: Customization) {
  const col = getColors(c)
  const spacing = c.spacing
  const base = 10 * (1 + Number(spacing.fontSize) * 0.05)
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const mv = 14 + Number(spacing.marginVertical) * 3
  const mh = 16 + Number(spacing.marginHorizontal) * 3
  const pageFormat = c.regional?.pageFormat === 'US Letter' ? 'LETTER' : 'A4'
  const ordered = [...sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => !s.hidden && s.entries.some((e) => !e.hidden && e.data))

  const chips = personal.detailsOrder
    .map((k) => {
      if (k === 'linkedIn') return personal.social?.linkedIn?.display
      if (k === 'github') return personal.social?.github?.display
      const v = personal[k as keyof PersonalDetails]
      return typeof v === 'string' && k !== 'photo' ? v : undefined
    })
    .filter(Boolean) as string[]

  const styles = StyleSheet.create({
    page: {
      paddingTop: mv,
      paddingBottom: mv,
      paddingHorizontal: mh,
      fontFamily: 'Helvetica',
      fontSize: base,
      lineHeight: lh,
      color: col.text,
    },
    name: {
      fontSize: spacing.nameFontSizePt || 24,
      fontWeight: 'bold',
      color: c.applyAccentColor.name ? col.accent : col.text,
    },
    jobTitle: {
      fontSize: spacing.jobTitleFontSizePt || 18,
      color: c.applyAccentColor.jobTitle ? col.accent : col.text,
    },
    section: { marginBottom: Number(spacing.spacingFactor) * 2 + 4 },
    heading: {
      fontSize: base * 1.05,
      fontWeight: 'bold',
      color: c.applyAccentColor.headings !== false ? col.accent : col.text,
      textTransform: 'uppercase',
      borderBottom: `1 solid ${col.accent}`,
      paddingBottom: 2,
      marginBottom: Number(spacing.headingGap ?? 3) * 2,
    },
  })

  return h(
    Document,
    {},
    h(
      Page,
      { size: pageFormat, style: styles.page },
      h(
        View,
        { style: { marginBottom: 12 } },
        h(Text, { style: styles.name }, personal.fullName || 'Your Name'),
        personal.jobTitle ? h(Text, { style: styles.jobTitle }, personal.jobTitle) : null,
        chips.length
          ? h(Text, { style: { fontSize: base * 0.85, marginTop: 4 } }, chips.join('  |  '))
          : null
      ),
      ...ordered.map((s) =>
        h(
          View,
          { key: s.id, style: styles.section },
          h(
            Text,
            { style: styles.heading },
            s.displayName || SECTION_LABELS[s.sectionType] || 'Section'
          ),
          ...s.entries.filter((e) => !e.hidden && e.data).map((e) => entryEl(e, c, col, base))
        )
      )
    )
  )
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const { id } = await params

  const [resume] = await db.select().from(Resume).where(eq(Resume.id, id))
  if (!resume || resume.userId !== user.id) {
    return new Response('Resume not found', { status: 404 })
  }

  const doc = await getResumeDocumentAction(id)
  if (!doc) return new Response('Resume not found', { status: 404 })

  const personalDetails: PersonalDetails = {
    ...EMPTY_PERSONAL_DETAILS,
    ...doc.resume.personalDetails,
  }
  const c = { ...DEFAULT_CUSTOMIZATION, ...(doc.resume.customization ?? {}) } as Customization
  const fileName = (
    (c.fileName || doc.resume.title || 'resume').replace(/\.pdf$/i, '').trim() || 'resume'
  ).replace(/[^\w\-. ]+/g, '_')

  const buffer = await renderToBuffer(buildDoc(personalDetails, doc.sections, c))

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
    },
  })
}
