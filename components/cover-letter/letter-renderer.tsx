import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { LetterDesign } from '@/features/letter/types'

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
  const colors = design?.colors?.basic?.selected === 'multi'
    ? { accent: design.colors.basic.multi?.accentColor || '#044cb5', text: design.colors.basic.multi?.textColor || '#000', bg: design.colors.basic.multi?.backgroundColor || '#fff' }
    : { accent: design?.colors?.basic?.single || '#044cb5', text: '#000', bg: '#fff' }
  const showBody = Boolean(form.body) || showPlaceholder

  return (
    <div
      className="mx-auto w-full max-w-[794px]"
      style={{ fontFamily: design.fontFamily || 'Inter', fontSize: `${design.fontSizePt || 11}pt`, color: colors.text, backgroundColor: colors.bg, minHeight: '1123px' }}
    >
      <div style={{ padding: '24px', margin: `${design.verticalMarginMm}mm ${design.horizontalMarginMm}mm` }}>
        {design.senderDisplay?.style === 'modernHeader' ? (
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px', padding: '16px', backgroundColor: colors.accent, color: colors.bg }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{form.senderName || (showPlaceholder ? 'Your Name' : '')}</h1>
              {form.senderJobTitle && <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>{form.senderJobTitle}</p>}
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.9 }}>
              {form.senderEmail && <p>{form.senderEmail}</p>}
              {form.senderPhone && <p>{form.senderPhone}</p>}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              <p>{form.dateMode === 'custom' ? (form.dateCustom || today) : today}</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: design.senderDisplay?.style === 'centered' ? 'center' : 'flex-start',
              textAlign: design.senderDisplay?.style === 'centered' ? 'center' : 'left',
            }}
          >
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.accent }}>{form.senderName || (showPlaceholder ? 'Your Name' : '')}</h1>
            {form.senderJobTitle && <p style={{ fontSize: '0.875rem' }}>{form.senderJobTitle}</p>}
            <p style={{ fontSize: '0.75rem', opacity: 0.65 }}>{[form.senderEmail, form.senderPhone].filter(Boolean).join(' • ')}</p>
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
