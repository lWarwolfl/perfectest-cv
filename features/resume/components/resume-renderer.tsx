import type {
  Customization,
  DateObject,
  HeadingStyle,
  PersonalDetails,
  SectionDisplay,
  TEntry,
  TSection,
} from '@/features/resume/types'
import { SECTION_LABELS } from '@/features/resume/defaults'
import { ExternalLink, Link as LinkIcon, Mail, Phone, Globe, AtSign } from 'lucide-react'

export const PAGE_PX = {
  A4: { width: 794, height: 1123 },
  'US Letter': { width: 816, height: 1056 },
} as const

const CONTACT_ICONS: Record<string, typeof Mail> = { email: Mail, phone: Phone, website: Globe, linkedIn: AtSign, github: LinkIcon }

const SIZE_PX = { xs: 40, s: 56, m: 72, l: 88, xl: 104 } as const

function iconWrapCls(style: Customization['header']['iconStyle'], accent: string, text: string) {
  switch (style) {
    case 'filled-circle':
      return { background: accent, color: '#ffffff', borderRadius: '9999px', padding: '3px' }
    case 'soft-badge':
      return { background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent, borderRadius: '6px', padding: '3px' }
    case 'neutral-gray':
      return { color: '#9ca3af' }
    case 'primary-accent':
      return { color: accent }
    default:
      return { color: text }
  }
}

function dateStr(d: DateObject) {
  if (!d) return ''
  if (d.hide) return ''
  if (d.onlyYear) return d.year || ''
  if (d.ongoing) return `${d.month && d.month !== '0' ? `${d.month}/` : ''}${d.year || ''} ${d.customOngoingWord || 'present'}`.trim()
  const month = d.month && d.month !== '0' ? `${d.month}/` : ''
  const year = d.year || ''
  return `${month}${year}`.trim()
}

function formatDateRange(start: DateObject, end: DateObject) {
  const s = dateStr(start)
  const e = dateStr(end)
  if (!s && !e) return ''
  return [s, e].filter(Boolean).join(' - ')
}

function colorStyle(customization: Customization) {
  const colors = customization.colors
  const basic = colors.basic
  const multi = colors.mode === 'advanced' ? colors.advanced.multi.light : basic.multi
  const accent = colors.mode === 'advanced' ? colors.advanced.single : basic.selected === 'multi' ? multi.accentColor : basic.single
  const text = colors.mode === 'advanced' ? multi.textColor : basic.selected === 'multi' ? multi.textColor : '#000000'
  const bg = colors.mode === 'advanced' ? multi.backgroundColor : basic.selected === 'multi' ? multi.backgroundColor : '#ffffff'
  return { accent, text, bg }
}

function dim(text: string) {
  return `color-mix(in srgb, ${text} 55%, transparent)`
}

function DisplayList({ display, items, accent, text, lh }: {
  display: SectionDisplay
  items: { key: string; name: React.ReactNode; level: string; infoHtml?: string }[]
  accent: string
  text: string
  lh: number
}) {
  const rows = display.rows ?? { spacing: 'spacious' as const, bullets: false }
  const subinfo = display.subinfo ?? 'colon' as const
  const cols = [1, 2, 3, 4].includes(Number(display.grid?.columns)) ? Number(display.grid.columns) : 2
  const sub = (level: string) => {
    if (!level) return null
    const label = subinfo === 'colon' ? `: ${level}` : subinfo === 'dash' ? ` - ${level}` : ` (${level})`
    return <span style={{ color: dim(text) }}>{label}</span>
  }
  const levelDots = (level: string) => {
    const n = Number(level)
    if (!Number.isInteger(n) || n < 1 || n > 5) return null
    return (
      <span style={{ color: accent, letterSpacing: '1px', marginLeft: '6px' }}>
        {'●'.repeat(n)}
        <span style={{ color: dim(text) }}>{'●'.repeat(5 - n)}</span>
      </span>
    )
  }
  if (display.selected === 'compact') {
    const sep = display.text === 'pipe' ? ' | ' : display.text === 'comma' ? ', ' : ' • '
    return (
      <div style={{ lineHeight: lh }}>
        {items.map((it, i) => (
          <span key={it.key}>
            {i > 0 && sep}
            {it.name}
            {sub(it.level)}
          </span>
        ))}
      </div>
    )
  }
  if (display.selected === 'bubble') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', lineHeight: lh }}>
        {items.map((it) => (
          <span key={it.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `color-mix(in srgb, ${accent} 8%, transparent)`, border: `1px solid ${dim(accent)}`, borderRadius: '9999px', padding: '1px 8px', fontSize: '0.9em' }}>
            {it.name}
            {it.level && <span style={{ color: dim(text) }}>{it.level}</span>}
          </span>
        ))}
      </div>
    )
  }
  if (display.selected === 'grid') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: `2px 12px`, lineHeight: lh }}>
        {items.map((it) => (
          <div key={it.key}>
            {it.name}
            {sub(it.level)}
            {levelDots(it.level)}
            {hasHtml(it.infoHtml) && <div style={{ fontSize: '0.9em', color: dim(text) }} dangerouslySetInnerHTML={{ __html: it.infoHtml! }} />}
          </div>
        ))}
      </div>
    )
  }
  if (display.selected === 'level') {
    return (
      <div style={{ lineHeight: lh }}>
        {items.map((it) => (
          <div key={it.key} style={{ marginBottom: '2px' }}>
            {it.name}
            {sub(it.level)}
            {levelDots(it.level)}
            {hasHtml(it.infoHtml) && <div style={{ fontSize: '0.9em', color: dim(text) }} dangerouslySetInnerHTML={{ __html: it.infoHtml! }} />}
          </div>
        ))}
      </div>
    )
  }
  const gap = rows.spacing === 'tight' ? '2px' : '6px'
  return (
    <div style={{ lineHeight: lh }}>
      {items.map((it) => (
        <div key={it.key} style={{ marginBottom: hasHtml(it.infoHtml) ? gap : '2px' }}>
          <div>
            {rows.bullets ? '• ' : ''}
            {it.name}
            {sub(it.level)}
          </div>
          {hasHtml(it.infoHtml) && <div style={{ fontSize: '0.9em', color: dim(text) }} dangerouslySetInnerHTML={{ __html: it.infoHtml! }} />}
        </div>
      ))}
    </div>
  )
}

function headingCss(style: HeadingStyle, accent: string): React.CSSProperties {
  switch (style) {
    case 'box':
      return { backgroundColor: accent, color: '#ffffff', padding: '2px 8px', width: 'fit-content' }
    case 'thickShortUnderline':
      return { color: accent, borderBottom: `4px solid ${accent}`, width: 'fit-content', paddingBottom: '1px' }
    case 'topBottomLine':
      return { color: accent, borderTop: `2px solid ${accent}`, borderBottom: `2px solid ${accent}`, padding: '2px 0' }
    case 'thinLine':
      return { color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: '2px', letterSpacing: '0.04em' }
    case 'underline':
      return { color: accent, textDecoration: 'underline', textUnderlineOffset: '3px' }
    case 'zigZagLine':
      return {
        color: accent,
        textDecoration: 'underline wavy',
        textDecorationColor: accent,
        textUnderlineOffset: '4px',
        width: 'fit-content',
      }
    case 'simple':
      return { color: accent, fontWeight: 700 }
    default:
      return { color: accent, borderBottom: `1px solid ${accent}`, paddingBottom: '2px' }
  }
}

function linked(text: string, link: string, customization: Customization, accent: string, isHeaderDetail?: boolean) {
  if (!link) return text
  const links = customization.links
  const style: React.CSSProperties = {
    color: links.blueColor && !isHeaderDetail ? '#2563eb' : accent,
    textDecoration: links.underline && !isHeaderDetail ? 'underline' : 'none',
  }
  const showIcon = links.icon && !isHeaderDetail
  const IconCmp = links.iconType === 'link' ? LinkIcon : ExternalLink
  return (
    <a href={link} target="_blank" rel="noreferrer" style={style}>
      {text}
      {showIcon && <IconCmp style={{ display: 'inline', width: '0.85em', height: '0.85em', verticalAlign: 'baseline', marginLeft: '2px' }} />}
    </a>
  )
}

function hasHtml(s: string | undefined) {
  return Boolean(s && s.replace(/<[^>]*>/g, '').trim())
}

export function ResumeRenderer({
  personalDetails,
  sections,
  customization,
  showPlaceholder = false,
}: {
  personalDetails: PersonalDetails
  sections: TSection[]
  customization: Customization
  showPlaceholder?: boolean
}) {
  const colors = colorStyle(customization)
  const { header, layout, heading, spacing } = customization
  const fontFamily = customization.font.fontFamily || 'Inter'
  const fs = 1 + Number(spacing.fontSize) * 0.05
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const ordered = [...sections].sort((a, b) => a.order - b.order)
  const page = PAGE_PX[customization.regional?.pageFormat === 'US Letter' ? 'US Letter' : 'A4']
  const sectionHeadings = customization.sectionHeadings || {}

  const detailChips = personalDetails.detailsOrder
    .map((key) => {
      if (key === 'linkedIn') return { key, text: personalDetails.social?.linkedIn?.display }
      if (key === 'github') return { key, text: personalDetails.social?.github?.display }
      const v = personalDetails[key as keyof PersonalDetails]
      return typeof v === 'string' && key !== 'photo' ? { key, text: v } : undefined
    })
    .filter((v): v is { key: string; text: string } => Boolean(v?.text))

  const isTwoCol = layout.selected === 'two'
  function renderSection(section: TSection) {
    const label = section.displayName || SECTION_LABELS[section.sectionType] || 'Section'
    if (section.hidden) return null
    const entries = section.entries.filter((e) => !e.hidden && e.data !== null)
    if (!entries.length && !showPlaceholder) return null

    const cfg = sectionHeadings[section.id] || {}
    const style = cfg.style || heading.style
    const showTitle = cfg.showTitle !== false

    return (
      <div key={section.id} style={{ marginBottom: `${Number(spacing.spacingFactor) * 2}px` }}>
        {showTitle && (
          <div style={{ ...headingCss(style, colors.accent), marginBottom: '6px' }}>
            <span className={heading.capitalization === 'uppercase' ? 'uppercase' : 'capitalize'} style={{ fontWeight: 600, fontSize: '1.05em' }}>
              {label}
            </span>
          </div>
        )}
        {section.sectionType === 'profile' && (
          <div style={{ lineHeight: lh }} dangerouslySetInnerHTML={{ __html: (entries.find((e) => e.data.type === 'profile')?.data as Extract<TEntry['data'], { type: 'profile' }> | undefined)?.text || (showPlaceholder ? 'Write a short professional summary about yourself.' : '') }} />
        )}
        {section.sectionType === 'work' &&
          entries.map((e) => {
            if (e.data.type !== 'work') return null
            const w = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>
                    {customization.workDisplay.jobTitleBeforeEmployer ? w.jobTitle : linked(w.employer, w.employerLink, customization, colors.accent)}
                    {w.employer && w.jobTitle && (
                      <span style={{ color: dim(colors.text) }}>
                        {' - '}
                        {customization.workDisplay.jobTitleBeforeEmployer ? linked(w.employer, w.employerLink, customization, colors.accent) : w.jobTitle}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.85em', color: colors.accent }}>
                    {formatDateRange(w.startDate, w.endDate)}
                  </span>
                </div>
                {w.location && <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{w.location}</div>}
                {hasHtml(w.description) && <div style={{ marginTop: '4px' }} dangerouslySetInnerHTML={{ __html: w.description }} />}
              </div>
            )
          })}
        {section.sectionType === 'education' &&
          entries.map((e) => {
            if (e.data.type !== 'education') return null
            const ed = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>
                    {customization.educationDisplay.degreeBeforeSchool ? ed.degree : linked(ed.school, ed.schoolLink, customization, colors.accent)}
                    {ed.school && ed.degree && (
                      <span style={{ color: dim(colors.text) }}>
                        {' - '}
                        {customization.educationDisplay.degreeBeforeSchool ? linked(ed.school, ed.schoolLink, customization, colors.accent) : ed.degree}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.85em', color: colors.accent }}>
                    {formatDateRange(ed.startDate, ed.endDate)}
                  </span>
                </div>
                {ed.location && <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{ed.location}</div>}
                {hasHtml(ed.description) && <div style={{ marginTop: '4px' }} dangerouslySetInnerHTML={{ __html: ed.description }} />}
              </div>
            )
          })}
        {section.sectionType === 'skill' && (
          <DisplayList
            display={customization.skill}
            accent={colors.accent}
            text={colors.text}
            lh={lh}
            items={entries.flatMap((e) =>
              e.data.type !== 'skill'
                ? []
                : [{ key: e.id, name: linked(e.data.skill, '', customization, colors.accent), level: e.data.level, infoHtml: e.data.infoHtml }]
            )}
          />
        )}
        {section.sectionType === 'language' && (
          <DisplayList
            display={customization.language}
            accent={colors.accent}
            text={colors.text}
            lh={lh}
            items={entries.flatMap((e) =>
              e.data.type !== 'language'
                ? []
                : [{ key: e.id, name: e.data.language, level: e.data.level, infoHtml: e.data.infoHtml }]
            )}
          />
        )}
        {section.sectionType === 'interest' && (
          <DisplayList
            display={customization.interest}
            accent={colors.accent}
            text={colors.text}
            lh={lh}
            items={entries.flatMap((e) =>
              e.data.type !== 'interest'
                ? []
                : [{ key: e.id, name: linked(e.data.interest, e.data.interestLink, customization, colors.accent), level: '', infoHtml: e.data.infoHtml }]
            )}
          />
        )}
        {section.sectionType === 'project' &&
          entries.map((e) => {
            if (e.data.type !== 'project') return null
            const p = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <span style={{ fontWeight: 500 }}>{linked(p.projectTitle, p.projectTitleLink, customization, colors.accent)}</span>
                {p.subTitle && <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{p.subTitle}</div>}
                {hasHtml(p.description) && <div style={{ marginTop: '2px' }} dangerouslySetInnerHTML={{ __html: p.description }} />}
              </div>
            )
          })}
        {(section.sectionType === 'certificate' || section.sectionType === 'award' || section.sectionType === 'publication' || section.sectionType === 'organisation' || section.sectionType === 'course') &&
          entries.map((e) => {
            if (e.data.type === 'certificate' || e.data.type === 'publication' || e.data.type === 'organisation' || e.data.type === 'course' || e.data.type === 'award') {
              const c = e.data
              return (
                <div key={e.id} style={{ marginBottom: '6px', lineHeight: lh }}>
                  <span style={{ fontWeight: 500 }}>{linked(c.title, c.link, customization, colors.accent)}</span>
                  {c.issuer && <span style={{ color: dim(colors.text) }}> - {c.issuer}</span>}
                  {c.date && <span style={{ float: 'right', fontSize: '0.85em', color: colors.accent }}>{c.date}</span>}
                </div>
              )
            }
            return null
          })}
        {section.sectionType === 'custom' &&
          entries.map((e) => {
            if (e.data.type !== 'custom') return null
            const c = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <span style={{ fontWeight: 500 }}>{c.title}</span>
                {c.subTitle && <span style={{ color: dim(colors.text) }}> - {c.subTitle}</span>}
                {hasHtml(c.description) && <div style={{ marginTop: '2px' }} dangerouslySetInnerHTML={{ __html: c.description }} />}
              </div>
            )
          })}
      </div>
    )
  }

  const photoPosition = customization.photoPosition || { show: true, grayscale: false, position: 'right', size: 'm', shape: 'circle' }
  const sizeKey = (['xs', 's', 'm', 'l', 'xl'] as const).includes(photoPosition.size as never) ? photoPosition.size : 'm'
  const shapeRadius =
    photoPosition.shape === 'circle' ? '9999px' : photoPosition.shape === 'rounded-lg' ? '16px' : photoPosition.shape === 'rounded-md' ? '12px' : photoPosition.shape === 'rounded-sm' ? '8px' : '0'
  const photoEl = (header.photo.show || photoPosition.show) && personalDetails.photo.imageId && (
    <img
      src={personalDetails.photo.imageId}
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

  const headerContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: photoPosition.position === 'top' ? 'column' : 'row',
        alignItems: photoPosition.position === 'top' ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: header.position === 'top' ? '16px' : '0',
      }}
    >
      {photoPosition.position === 'left' && photoEl}
      <div style={{ flex: 1, textAlign: header.alignText === 'center' ? 'center' : 'left' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: header.jobTitlePosition === 'sameLine' ? 'row' : 'column',
            alignItems: 'baseline',
            columnGap: '12px',
          }}
        >
          <h1
            style={{
              fontWeight: header.nameStyle === 'regular' ? 400 : 700,
              fontSize: `${customization.spacing.nameFontSizePt || 24}px`,
              lineHeight: 1.2,
              color: customization.applyAccentColor.name ? colors.accent : colors.text,
              margin: 0,
            }}
          >
            {personalDetails.fullName || (showPlaceholder ? 'Your Name' : '')}
          </h1>
          {personalDetails.jobTitle && (
            <p
              style={{
                fontStyle: header.jobTitleStyle === 'italic' ? 'italic' : 'normal',
                fontSize: `${customization.spacing.jobTitleFontSizePt || 18}px`,
                color: customization.applyAccentColor.jobTitle ? colors.accent : colors.text,
                margin: 0,
              }}
            >
              {personalDetails.jobTitle}
            </p>
          )}
        </div>
      </div>
      {photoPosition.position === 'right' && photoEl}
    </div>
  )

  const detailsBlock = detailChips.length > 0 && (
    <div
      style={{
        display: header.detailsArrangement === 'grid' ? 'grid' : 'flex',
        flexDirection: header.detailsArrangement === 'column' ? 'column' : 'row',
        flexWrap: header.detailsArrangement === 'wrap' ? 'wrap' : 'nowrap',
        gridTemplateColumns: header.detailsArrangement === 'grid' ? 'repeat(2, minmax(0, 1fr))' : undefined,
        gap: '2px 12px',
        fontSize: '0.85em',
        justifyContent: header.alignText === 'center' && header.detailsArrangement !== 'grid' ? 'center' : undefined,
      }}
    >
      {detailChips.map((chip, i) => {
        const IconCmp = CONTACT_ICONS[chip.key as keyof typeof CONTACT_ICONS]
        const icon = header.detailsSeparator === 'icon' && IconCmp && (
          <span style={{ display: 'inline-flex', marginRight: '4px', verticalAlign: 'middle', ...iconWrapCls(header.iconStyle, colors.accent, colors.text) }}>
            <IconCmp style={{ width: '0.9em', height: '0.9em' }} />
          </span>
        )
        const separator = header.detailsSeparator !== 'icon' && i > 0 && (
          <span style={{ marginRight: '0', color: dim(colors.text) }}>{header.detailsSeparator === 'bullet' ? ' • ' : ' | '}</span>
        )
        return (
          <span key={i}>
            {separator}
            {icon}
            {chip.text}
          </span>
        )
      })}
    </div>
  )

  const splitLeft = isTwoCol ? ordered.slice(0, Math.ceil(ordered.length / 2)) : []
  const splitRight = isTwoCol ? ordered.slice(Math.ceil(ordered.length / 2)) : []

  const twoColBodies = [
    { id: 'col-left', sections: splitLeft },
    { id: 'col-right', sections: splitRight },
  ]
  const leftWidth = Math.min(Math.max(layout.two.leftWidth || 50, 10), 90)

  return (
    <div
      className="mx-auto w-full bg-white"
      style={{
        fontFamily,
        fontSize: `${10 + fs}px`,
        lineHeight: lh,
        color: colors.text,
        padding: `${14 + Number(spacing.marginVertical) * 3}px ${16 + Number(spacing.marginHorizontal) * 3}px`,
        minHeight: `${page.height}px`,
        width: `${page.width}px`,
      }}
    >
      <div
        style={
          isTwoCol
            ? { display: 'grid', gridTemplateColumns: `${leftWidth}fr ${100 - leftWidth}fr`, gap: '24px' }
            : undefined
        }
      >
        <div style={isTwoCol ? { minWidth: 0 } : undefined}>
          {headerContent}
          {detailsBlock}
          <div style={{ marginTop: '12px' }}>
            {(isTwoCol ? twoColBodies[0].sections : ordered).map(renderSection)}
          </div>
        </div>
        {isTwoCol && (
          <div style={{ minWidth: 0 }}>
            {twoColBodies[1].sections.map(renderSection)}
          </div>
        )}
      </div>
    </div>
  )
}
