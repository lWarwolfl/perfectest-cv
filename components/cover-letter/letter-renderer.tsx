import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { LetterDesign } from '@/features/letter/types'
import { normalizeLetterDesign } from '@/features/letter/types'
import type { Customization } from '@/features/resume/types'
import { PAGE_PX } from '@/features/resume/components/resume-renderer'
import { Mail, Phone, MapPin, Globe, AtSign, Link as LinkIcon } from 'lucide-react'

const CONTACT_ICONS: Record<string, typeof Mail> = { displayEmail: Mail, email: Mail, phone: Phone, address: MapPin, website: Globe, linkedIn: AtSign, github: LinkIcon }

const SIZE_PX = { xs: 40, s: 56, m: 72, l: 88, xl: 104 } as const

function iconWrapCls(style: Customization['header']['iconStyle'], accent: string, text: string, useAccent: boolean) {
  const c = useAccent ? accent : text
  switch (style) {
    case 'filled-circle':
      return { background: c, color: '#ffffff', borderRadius: '9999px', padding: '3px' }
    case 'soft-badge':
      return { background: `color-mix(in srgb, ${c} 15%, transparent)`, color: c, borderRadius: '6px', padding: '3px' }
    case 'neutral-gray':
      return { color: '#9ca3af' }
    case 'primary-accent':
      return { color: c }
    default:
      return { color: useAccent ? accent : text }
  }
}

function detailHref(key: string, form: LetterContentPatch) {
  switch (key) {
    case 'displayEmail':
    case 'email':
      return form.senderEmail ? `mailto:${form.senderEmail}` : ''
    case 'phone':
      return form.senderPhone ? `tel:${form.senderPhone}` : ''
    case 'website':
      return form.senderWebsite || ''
    case 'linkedIn':
      return form.senderLinkedIn || ''
    case 'github':
      return form.senderGitHub || ''
    default:
      return ''
  }
}

function detailText(key: string, form: LetterContentPatch) {
  switch (key) {
    case 'displayEmail':
    case 'email':
      return form.senderEmail
    case 'phone':
      return form.senderPhone
    case 'address':
      return form.senderAddress
    case 'website':
      return form.senderWebsite
    case 'linkedIn':
      return form.senderLinkedIn
    case 'github':
      return form.senderGitHub
    default:
      return ''
  }
}

function letterColorStyle(c: Customization) {
  const basic = c.colors.basic
  if (basic.selected === 'multi') {
    return {
      accent: basic.multi?.accentColor || '#044cb5',
      text: basic.multi?.textColor || '#000000',
      bg: basic.multi?.backgroundColor || '#ffffff',
    }
  }
  return { accent: basic.single || '#044cb5', text: '#000000', bg: '#ffffff' }
}

export function LetterRenderer({ form, design: rawDesign, showPlaceholder = false }: {
  form: LetterContentPatch
  design: LetterDesign | null | undefined
  showPlaceholder?: boolean
}) {
  const design = normalizeLetterDesign(rawDesign)
  const c = design.customization
  const colors = letterColorStyle(c)
  const header = c.header
  const spacing = c.spacing
  const fontFamily = c.font.fontFamily || 'Inter'
  const fs = 1 + Number(spacing.fontSize) * 0.05
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const page = PAGE_PX[c.regional?.pageFormat === 'US Letter' ? 'US Letter' : 'A4']
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const showBody = Boolean(form.body) || showPlaceholder

  const photoPosition = c.photoPosition || { show: true, grayscale: false, position: 'right', size: 'm', shape: 'circle' }
  const sizeKey = (['xs', 's', 'm', 'l', 'xl'] as const).includes(photoPosition.size as never) ? photoPosition.size : 'm'
  const shapeRadius =
    photoPosition.shape === 'circle' ? '9999px' : photoPosition.shape === 'rounded-lg' ? '16px' : photoPosition.shape === 'rounded-md' ? '12px' : photoPosition.shape === 'rounded-sm' ? '8px' : '0'
  const photoEl = (header.photo.show || photoPosition.show) && form.senderPhotoImageId && (
    <img
      src={form.senderPhotoImageId}
      alt="profile"
      style={{
        filter: photoPosition.grayscale || header.photo.grayscale ? 'grayscale(1)' : undefined,
        width: SIZE_PX[sizeKey],
        height: SIZE_PX[sizeKey],
        borderRadius: shapeRadius,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  )
  const centered = header.alignText === 'center' || photoPosition.position === 'top'

  const detailKeys = ['displayEmail', 'phone', 'address', 'website', 'linkedIn', 'github']
  const chips = detailKeys
    .map((key) => ({ key, text: detailText(key, form) }))
    .filter((v): v is { key: string; text: string } => Boolean(v?.text))
  const arrangement = header.detailsArrangement || 'wrap'
  const separator = header.detailsSeparator || 'icon'

  const detailsBlock = chips.length > 0 && (
    <div
      style={{
        display: arrangement === 'grid' ? 'grid' : 'flex',
        flexDirection: arrangement === 'column' ? 'column' : 'row',
        flexWrap: arrangement === 'wrap' ? 'wrap' : 'nowrap',
        gridTemplateColumns: arrangement === 'grid' ? 'repeat(2, minmax(0, 1fr))' : undefined,
        gap: '2px 12px',
        fontSize: '0.85em',
        justifyContent: centered && arrangement !== 'grid' ? 'center' : undefined,
        textAlign: centered ? 'center' : undefined,
      }}
    >
      {chips.map((chip, i) => {
        const IconCmp = CONTACT_ICONS[chip.key]
        const icon = separator === 'icon' && IconCmp && (
          <span style={{ display: 'inline-flex', marginRight: '4px', verticalAlign: 'middle', ...iconWrapCls(header.iconStyle, colors.accent, colors.text, c.applyAccentColor.icons) }}>
            <IconCmp style={{ width: '0.9em', height: '0.9em' }} />
          </span>
        )
        const sep = separator !== 'icon' && i > 0 && (
          <span style={{ color: 'color-mix(in srgb, currentColor 55%, transparent)' }}>{separator === 'bullet' ? ' • ' : ' | '}</span>
        )
        const link = detailHref(chip.key, form)
        return (
          <span key={chip.key}>
            {sep}
            {icon}
            {link
              ? <a href={link} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{chip.text}</a>
              : chip.text}
          </span>
        )
      })}
    </div>
  )

  const nameAlign = centered ? 'center' : 'left'
  const senderName = form.senderName || (showPlaceholder ? 'Your Name' : '')
  const dateEl = (
    <p style={{ fontSize: '0.875rem', margin: 0 }}>
      {form.dateMode === 'custom' ? (form.dateCustom || today) : today}
    </p>
  )
  const dateAlignSelf = design.letterDateDisplay?.position === 'right' ? 'flex-end' : design.letterDateDisplay?.position === 'center' ? 'center' : 'flex-start'

  const headerContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: photoPosition.position === 'top' ? 'column' : 'row',
        alignItems: photoPosition.position === 'top' ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      {photoPosition.position === 'left' && photoEl}
      <div style={{ flex: 1, textAlign: nameAlign }}>
        <div
          style={{
            display: 'flex',
            flexDirection: header.jobTitlePosition === 'sameLine' ? 'row' : 'column',
            alignItems: centered ? 'center' : 'baseline',
            columnGap: '12px',
          }}
        >
          <h1
            style={{
              fontWeight: header.nameStyle === 'regular' ? 400 : 700,
              fontSize: `${spacing.nameFontSizePt || 24}px`,
              lineHeight: 1.2,
              color: c.applyAccentColor.name ? colors.accent : colors.text,
              margin: 0,
            }}
          >
            {senderName}
          </h1>
          {form.senderJobTitle && (
            <p
              style={{
                fontStyle: header.jobTitleStyle === 'italic' ? 'italic' : 'normal',
                fontSize: `${spacing.jobTitleFontSizePt || 18}px`,
                color: c.applyAccentColor.jobTitle ? colors.accent : colors.text,
                margin: 0,
              }}
            >
              {form.senderJobTitle}
            </p>
          )}
        </div>
      </div>
      {photoPosition.position === 'right' && photoEl}
    </div>
  )

  const senderBlocks = (
    <div style={{ marginBottom: '24px' }}>
      {headerContent}
      <div style={{ marginTop: '4px' }}>{detailsBlock}</div>
      <div style={{ marginTop: '20px', alignSelf: dateAlignSelf, width: nameAlign === 'center' ? '100%' : undefined, textAlign: nameAlign }}>{dateEl}</div>
    </div>
  )

  const bodyBlocks = (
    <>
      {form.recipientCompany || form.recipientName ? (
        <div style={{ marginBottom: '16px' }}>
          {form.recipientName && <p style={{ margin: 0 }}>{form.recipientName}</p>}
          {form.recipientPosition && <p style={{ margin: 0 }}>{form.recipientPosition}</p>}
          {form.recipientCompany && <p style={{ margin: 0 }}>{form.recipientCompany}</p>}
        </div>
      ) : null}
      {form.subject && <p style={{ marginBottom: '16px', fontWeight: 500 }}>Re: {form.subject}</p>}
      {showBody && (
        <div style={{ lineHeight: lh }} dangerouslySetInnerHTML={{ __html: form.body || '' }} />
      )}
      <div style={{ marginTop: '32px' }}>
        {form.signaturePlace && <p style={{ margin: 0 }}>{form.signaturePlace}</p>}
        <p style={{ fontWeight: 600, margin: 0 }}>{form.signatureName || form.senderName || (showPlaceholder ? 'Your Name' : '')}</p>
      </div>
    </>
  )

  return (
    <div
      className="print-page mx-auto w-full"
      style={{
        fontFamily,
        fontSize: `${10 + fs}px`,
        lineHeight: lh,
        color: colors.text,
        backgroundColor: colors.bg,
        padding: `${14 + Number(spacing.marginVertical) * 3}px ${16 + Number(spacing.marginHorizontal) * 3}px`,
        minHeight: `${page.height}px`,
        width: `${page.width}px`,
      }}
    >
      {senderBlocks}
      {bodyBlocks}
    </div>
  )
}
