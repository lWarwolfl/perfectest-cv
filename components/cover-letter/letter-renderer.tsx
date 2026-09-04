import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { LetterDesign } from '@/features/letter/types'
import type { Customization } from '@/features/resume/types'
import { Mail, Phone, MapPin, Globe, AtSign, Link as LinkIcon } from 'lucide-react'

const CONTACT_ICONS: Record<string, typeof Mail> = { displayEmail: Mail, email: Mail, phone: Phone, address: MapPin, website: Globe, linkedIn: AtSign, github: LinkIcon }

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
    case 'address':
      return ''
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

export function LetterRenderer({
  form,
  design,
  showPlaceholder = false,
}: {
  form: LetterContentPatch
  design: LetterDesign
  showPlaceholder?: boolean
}) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const basic = design?.colors?.basic
  const colors = basic?.selected === 'multi'
    ? { accent: basic.multi?.accentColor || '#044cb5', text: basic.multi?.textColor || '#000', bg: basic.multi?.backgroundColor || '#fff' }
    : { accent: basic?.single || '#044cb5', text: '#000', bg: '#fff' }
  const header = design.headerSettings
  const senderStyle = design.senderDisplay?.style || 'classicSender'
  const showBody = Boolean(form.body) || showPlaceholder

  const detailKeys = ['displayEmail', 'phone', 'address', 'website', 'linkedIn', 'github']
  const chips = detailKeys
    .map((key) => ({ key, text: detailText(key, form) }))
    .filter((c): c is { key: string; text: string } => Boolean(c.text))
  const arrangement = header?.detailsArrangement || 'wrap'
  const separator = header?.detailsSeparator || 'icon'
  const iconStyle = header?.iconStyle || 'neutral-gray'

  const detailsBlock = chips.length > 0 && (
    <div
      style={{
        display: arrangement === 'grid' ? 'grid' : 'flex',
        flexDirection: arrangement === 'column' ? 'column' : 'row',
        flexWrap: arrangement === 'wrap' ? 'wrap' : 'nowrap',
        gridTemplateColumns: arrangement === 'grid' ? 'repeat(2, minmax(0, 1fr))' : undefined,
        gap: '2px 12px',
        fontSize: '0.75rem',
        justifyContent: header?.alignText === 'center' && arrangement !== 'grid' ? 'center' : undefined,
      }}
    >
      {chips.map((chip, i) => {
        const IconCmp = CONTACT_ICONS[chip.key]
        const icon = separator === 'icon' && IconCmp && (
          <span style={{ display: 'inline-flex', marginRight: '4px', verticalAlign: 'middle', ...iconWrapCls(iconStyle, colors.accent, colors.text, true) }}>
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

  const nameAlign = header?.alignText === 'center' ? 'center' : 'left'
  const senderName = form.senderName || (showPlaceholder ? 'Your Name' : '')

  return (
    <div
      className="mx-auto w-full max-w-[794px]"
      style={{ fontFamily: design.fontFamily || 'Inter', fontSize: `${design.fontSizePt || 11}pt`, color: colors.text, backgroundColor: colors.bg, minHeight: '1123px' }}
    >
      <div style={{ padding: '24px', margin: `${design.verticalMarginMm}mm ${design.horizontalMarginMm}mm` }}>
        {senderStyle === 'modernHeader' ? (
          <div style={{ marginBottom: '24px', borderRadius: '12px', padding: '16px', backgroundColor: colors.accent, color: colors.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: header?.nameStyle === 'regular' ? 400 : 700, margin: 0 }}>{senderName}</h1>
                {form.senderJobTitle && <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0, fontStyle: header?.jobTitleStyle === 'italic' ? 'italic' : 'normal' }}>{form.senderJobTitle}</p>}
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.9 }}>
                <p>{form.dateMode === 'custom' ? (form.dateCustom || today) : today}</p>
              </div>
            </div>
            {detailsBlock && <div style={{ marginTop: '8px' }}>{detailsBlock}</div>}
          </div>
        ) : senderStyle === 'centered' ? (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: header?.nameStyle === 'regular' ? 400 : 700, color: colors.accent, margin: 0 }}>{senderName}</h1>
            {form.senderJobTitle && <p style={{ fontSize: '0.875rem', fontStyle: header?.jobTitleStyle === 'italic' ? 'italic' : 'normal' }}>{form.senderJobTitle}</p>}
            {detailsBlock}
          </div>
        ) : (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: nameAlign }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: header?.nameStyle === 'regular' ? 400 : 700, color: colors.accent, margin: 0, alignSelf: nameAlign === 'center' ? 'center' : 'flex-start' }}>{senderName}</h1>
            {form.senderJobTitle && (
              <p style={{ fontSize: '0.875rem', fontStyle: header?.jobTitleStyle === 'italic' ? 'italic' : 'normal', alignSelf: header?.jobTitlePosition === 'sameLine' ? undefined : nameAlign === 'center' ? 'center' : 'flex-start', margin: 0 }}>
                {form.senderJobTitle}
              </p>
            )}
            {detailsBlock}
            <p
              style={{
                fontSize: '0.875rem',
                alignSelf: design.letterDateDisplay?.position === 'right' ? 'flex-end' : design.letterDateDisplay?.position === 'center' ? 'center' : undefined,
              }}
            >
              {form.dateMode === 'custom' ? (form.dateCustom || today) : today}
            </p>
          </div>
        )}
        {form.recipientCompany || form.recipientName ? (
          <div style={{ marginBottom: '16px' }}>
            {form.recipientName && <p>{form.recipientName}</p>}
            {form.recipientPosition && <p>{form.recipientPosition}</p>}
            {form.recipientCompany && <p>{form.recipientCompany}</p>}
            {form.recipientAddress && <div dangerouslySetInnerHTML={{ __html: form.recipientAddress }} />}
          </div>
        ) : null}
        {form.subject && <p style={{ marginBottom: '16px', fontWeight: 500 }}>Re: {form.subject}</p>}
        {showBody && (
          <div style={{ lineHeight: design.lineHeightPct || 1.4 }} dangerouslySetInnerHTML={{ __html: form.body || '' }} />
        )}
        <div style={{ marginTop: '32px' }}>
          <p>Sincerely,</p>
          <p style={{ fontWeight: 600 }}>{form.signatureName || form.senderName || (showPlaceholder ? 'Your Name' : '')}</p>
        </div>
      </div>
    </div>
  )
}
