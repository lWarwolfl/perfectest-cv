import { getCurrentUser } from '@/lib/auth/server'
import { db } from '@/drizzle'
import { Letter } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { normalizeLetterDesign } from '@/features/letter/types'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization } from '@/features/resume/types'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement as h } from 'react'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const { id } = await params

  const letter = await db.query.Letter.findFirst({
    where: (t, { and }) => and(eq(t.id, id), eq(t.userId, user.id)),
  })
  if (!letter) return new Response('Letter not found', { status: 404 })

  const c = normalizeLetterDesign(letter.design).customization
  const fileName = (
    (c.fileName || letter.title || 'cover-letter').replace(/\.pdf$/i, '').trim() || 'cover-letter'
  ).replace(/[^\w\-. ]+/g, '_')

  const buffer = await renderToBuffer(buildDoc(letter as LetterContentPatch, c))

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
    },
  })
}

function getColors(c: Customization) {
  const basic = c.colors.basic
  const multi = c.colors.mode === 'advanced' ? c.colors.advanced.multi.light : basic.multi
  return {
    accent:
      c.colors.mode === 'advanced'
        ? c.colors.advanced.single
        : basic.selected === 'multi'
          ? multi.accentColor
          : basic.single,
    text: '#000000',
    bg: '#ffffff',
  }
}

function buildDoc(form: LetterContentPatch, c: Customization) {
  const col = getColors(c)
  const spacing = c.spacing
  const base = 10 * (1 + Number(spacing.fontSize) * 0.05)
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const mv = 14 + Number(spacing.marginVertical) * 3
  const mh = 16 + Number(spacing.marginHorizontal) * 3
  const pageFormat = c.regional?.pageFormat === 'US Letter' ? 'LETTER' : 'A4'
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const dateStr = form.dateMode === 'custom' ? form.dateCustom : today

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
    block: { marginBottom: 12 },
    subject: { fontWeight: 'bold' },
  })

  const senderLines = [
    form.senderEmail,
    form.senderPhone,
    form.senderAddress,
    form.senderWebsite,
    form.senderLinkedIn,
    form.senderGitHub,
  ].filter(Boolean)

  return h(
    Document,
    {},
    h(
      Page,
      { size: pageFormat, style: styles.page },
      form.senderName
        ? h(
            View,
            { style: styles.block },
            h(Text, { style: styles.name }, form.senderName),
            form.senderJobTitle ? h(Text, { style: styles.jobTitle }, form.senderJobTitle) : null,
            senderLines.length
              ? h(
                  Text,
                  { style: { fontSize: base * 0.85, marginTop: 2 } },
                  senderLines.join('  |  ')
                )
              : null
          )
        : null,
      h(View, { style: styles.block }, h(Text, {}, dateStr)),
      form.recipientName || form.recipientCompany
        ? h(
            View,
            { style: styles.block },
            form.recipientName ? h(Text, {}, form.recipientName) : null,
            form.recipientPosition ? h(Text, {}, form.recipientPosition) : null,
            form.recipientCompany ? h(Text, {}, form.recipientCompany) : null,
            form.recipientAddress ? h(Text, {}, form.recipientAddress) : null
          )
        : null,
      form.subject
        ? h(
            View,
            { style: styles.block },
            h(Text, { style: styles.subject }, `Subject: ${form.subject}`)
          )
        : null,
      form.body
        ? h(View, { style: styles.block }, h(Text, {}, form.body.replace(/<[^>]*>/g, ' ')))
        : null,
      h(
        View,
        { style: { marginTop: 24 } },
        h(Text, {}, form.signatureName || form.senderName || ''),
        form.signaturePlace ? h(Text, {}, form.signaturePlace) : null,
        form.signatureDate ? h(Text, {}, form.signatureDate) : null
      )
    )
  )
}
