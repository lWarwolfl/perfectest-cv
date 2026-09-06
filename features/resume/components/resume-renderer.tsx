import type {
  Customization,
  DateObject,
  HeadingStyle,
  PersonalDetails,
  SectionDisplay,
  TEntry,
  TSection,
} from '@/features/resume/types'
import {
  SECTION_LABELS,
  DEFAULT_CUSTOMIZATION,
  EMPTY_PERSONAL_DETAILS,
} from '@/features/resume/defaults'
import { ExternalLink, Link as LinkIcon, Mail, Phone, Globe, AtSign, MapPin } from 'lucide-react'

export const PAGE_PX = {
  A4: { width: 794, height: 1123 },
  'US Letter': { width: 816, height: 1056 },
} as const

const CONTACT_ICONS: Record<string, typeof Mail> = {
  displayEmail: Mail,
  email: Mail,
  phone: Phone,
  address: MapPin,
  website: Globe,
  linkedIn: AtSign,
  github: LinkIcon,
}

const SIZE_PX = { xs: 40, s: 56, m: 72, l: 88, xl: 104 } as const

function iconWrapCls(
  style: Customization['header']['iconStyle'],
  accent: string,
  text: string,
  useAccent: boolean
) {
  const c = useAccent ? accent : text
  switch (style) {
    case 'filled-circle':
      return { background: c, color: '#ffffff', borderRadius: '9999px', padding: '3px' }
    case 'soft-badge':
      return {
        background: `color-mix(in srgb, ${c} 15%, transparent)`,
        color: c,
        borderRadius: '6px',
        padding: '3px',
      }
    case 'neutral-gray':
      return { color: '#9ca3af' }
    case 'primary-accent':
      return { color: c }
    default:
      return { color: useAccent ? accent : text }
  }
}

function dateStr(d: DateObject, dateDisplay: string) {
  if (!d) return ''
  if (d.hide) return ''
  if (d.onlyYear) return d.year || ''
  const y = d.year || ''
  if (d.ongoing)
    return `${d.month && d.month !== '0' ? `${monthStr(d.month, dateDisplay)} ` : ''}${y} ${d.customOngoingWord || 'present'}`.trim()
  if (dateDisplay === 'YYYY') return y
  const m = monthStr(d.month, dateDisplay)
  return `${m ? `${m} ` : ''}${y}`.trim()
}

function monthStr(month: string | undefined, dateDisplay: string) {
  if (!month || month === '0') return ''
  if (dateDisplay === 'MMM YYYY')
    return (
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
        Number(month) - 1
      ] || ''
    )
  return month
}

function formatDateRange(start: DateObject, end: DateObject, dateDisplay: string) {
  const s = dateStr(start, dateDisplay)
  const e = dateStr(end, dateDisplay)
  if (!s && !e) return ''
  return [s, e].filter(Boolean).join(' - ')
}

function colorStyle(customization: Customization) {
  const merged = {
    ...customization,
    colors: { ...DEFAULT_CUSTOMIZATION.colors, ...customization.colors },
  } as Customization
  const colors = merged.colors
  const basic = colors.basic
  const multi = colors.mode === 'advanced' ? colors.advanced.multi.light : basic.multi
  const accent =
    colors.mode === 'advanced'
      ? colors.advanced.single
      : basic.selected === 'multi'
        ? multi.accentColor
        : basic.single
  const text =
    colors.mode === 'advanced'
      ? multi.textColor
      : basic.selected === 'multi'
        ? multi.textColor
        : '#000000'
  const bg =
    colors.mode === 'advanced'
      ? multi.backgroundColor
      : basic.selected === 'multi'
        ? multi.backgroundColor
        : '#ffffff'
  return { accent, text, bg }
}

function dim(text: string) {
  return `color-mix(in srgb, ${text} 55%, transparent)`
}

function DisplayList({
  display,
  items,
  accent,
  text,
  lh,
}: {
  display: SectionDisplay
  items: { key: string; name: React.ReactNode; infoHtml?: string }[]
  accent: string
  text: string
  lh: number
}) {
  const rows = display.rows ?? { spacing: 'spacious' as const, bullets: false }
  const subinfo = display.subinfo ?? ('colon' as const)
  const cols = [1, 2, 3, 4].includes(Number(display.grid?.columns))
    ? Number(display.grid.columns)
    : 2
  const infoText = (it: { infoHtml?: string }) =>
    (it.infoHtml || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const sub = (info: string) => {
    if (!info) return null
    const label =
      subinfo === 'colon' ? `: ${info}` : subinfo === 'dash' ? ` - ${info}` : ` (${info})`
    return <span style={{ color: dim(text) }}>{label}</span>
  }
  const subText = (info: string) =>
    subinfo === 'colon' ? `: ${info}` : subinfo === 'dash' ? `- ${info}` : `(${info})`
  if (display.selected === 'compact') {
    const sep = display.text === 'pipe' ? ' | ' : display.text === 'comma' ? ', ' : ' • '
    return (
      <div style={{ lineHeight: lh }}>
        {items.map((it, i) => (
          <span key={it.key}>
            {i > 0 && sep}
            {it.name}
            {sub(infoText(it))}
          </span>
        ))}
      </div>
    )
  }
  if (display.selected === 'bubble') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', lineHeight: lh }}>
        {items.map((it) => (
          <span
            key={it.key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: `color-mix(in srgb, ${accent} 8%, transparent)`,
              border: `1px solid ${dim(accent)}`,
              borderRadius: '9999px',
              padding: '1px 8px',
              fontSize: '0.9em',
            }}
          >
            {it.name}
            {sub(infoText(it))}
          </span>
        ))}
      </div>
    )
  }
  if (display.selected === 'grid') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: `2px 12px`,
          lineHeight: lh,
        }}
      >
        {items.map((it) => {
          const info = infoText(it)
          return (
            <div key={it.key}>
              <div>{it.name}</div>
              {info && <div style={{ fontSize: '0.9em', color: dim(text) }}>{subText(info)}</div>}
            </div>
          )
        })}
      </div>
    )
  }
  const gap = rows.spacing === 'tight' ? '2px' : '6px'
  return (
    <div style={{ lineHeight: lh, display: 'flex', flexDirection: 'column', gap }}>
      {items.map((it) => (
        <div key={it.key}>
          {rows.bullets ? '• ' : ''}
          {it.name}
          {sub(infoText(it))}
        </div>
      ))}
    </div>
  )
}

function headingCss(
  style: HeadingStyle,
  accent: string,
  text: string,
  useAccent: boolean
): React.CSSProperties {
  const c = useAccent ? accent : text
  switch (style) {
    case 'box':
      return { backgroundColor: c, color: '#ffffff', padding: '2px 8px', width: 'fit-content' }
    case 'thickShortUnderline':
      return {
        color: c,
        borderBottom: `4px solid ${c}`,
        width: 'fit-content',
        paddingBottom: '1px',
      }
    case 'topBottomLine':
      return {
        color: c,
        borderTop: `2px solid ${c}`,
        borderBottom: `2px solid ${c}`,
        padding: '2px 0',
      }
    case 'thinLine':
      return {
        color: c,
        borderBottom: `1px solid ${c}`,
        paddingBottom: '2px',
        letterSpacing: '0.04em',
      }
    case 'dottedLine':
      return {
        color: c,
        borderBottom: `2px dotted ${c}`,
        paddingBottom: '2px',
        width: 'fit-content',
      }
    case 'underline':
      return { color: c, textDecoration: 'underline', textUnderlineOffset: '3px' }
    case 'zigZagLine':
      return {
        color: c,
        textDecoration: 'underline wavy',
        textDecorationColor: c,
        textUnderlineOffset: '4px',
        width: 'fit-content',
      }
    case 'plain':
      return { color: c }
    case 'simple':
      return { color: c, fontWeight: 700 }
    default:
      return { color: c, borderBottom: `1px solid ${c}`, paddingBottom: '2px' }
  }
}

function linked(
  label: string,
  link: string,
  customization: Customization,
  accent: string,
  textColor: string
) {
  if (!link) return label
  const links = customization.links
  const style: React.CSSProperties = {
    color: links.useAccent ? accent : textColor,
    textDecoration: links.underline ? 'underline' : 'none',
  }
  const showIcon = links.icon
  const IconCmp =
    links.iconType === 'link' ? LinkIcon : links.iconType === 'mail' ? Mail : ExternalLink
  return (
    <a href={link} target="_blank" rel="noreferrer" style={style}>
      {label}
      {showIcon && (
        <IconCmp
          style={{
            display: 'inline',
            width: '0.85em',
            height: '0.85em',
            verticalAlign: 'baseline',
            marginLeft: '2px',
          }}
        />
      )}
    </a>
  )
}

function hasHtml(s: string | undefined) {
  return Boolean(s && s.replace(/<[^>]*>/g, '').trim())
}

export function ResumeRenderer({
  personalDetails: rawPersonalDetails,
  sections,
  customization: rawCustomization,
  showPlaceholder = false,
}: {
  personalDetails: PersonalDetails
  sections: TSection[]
  customization: Customization
  showPlaceholder?: boolean
}) {
  const personalDetails = { ...EMPTY_PERSONAL_DETAILS, ...rawPersonalDetails }
  const customization = { ...DEFAULT_CUSTOMIZATION, ...rawCustomization } as Customization
  const colors = colorStyle(customization)
  const { header, layout, heading, spacing } = customization
  const fontFamily = customization.font.fontFamily || 'Inter'
  const fs = 1 + Number(spacing.fontSize) * 0.05
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const ordered = [...sections].sort((a, b) => a.order - b.order)
  const page = PAGE_PX[customization.regional?.pageFormat === 'US Letter' ? 'US Letter' : 'A4']
  const sectionHeadings = customization.sectionHeadings || {}

  const detailLinks: Record<string, string> = {
    displayEmail: personalDetails.displayEmail ? `mailto:${personalDetails.displayEmail}` : '',
    phone: personalDetails.phone ? `tel:${personalDetails.phone}` : '',
    website: personalDetails.websiteLink || personalDetails.website,
    linkedIn: personalDetails.social?.linkedIn?.link || '',
    github: personalDetails.social?.github?.link || '',
  }
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
          <div
            style={{
              ...headingCss(
                style,
                colors.accent,
                colors.text,
                customization.applyAccentColor.headings !== false
              ),
              marginBottom: `${Number(spacing.headingGap ?? 3) * 2}px`,
            }}
          >
            <span
              className={heading.capitalization === 'uppercase' ? 'uppercase' : 'capitalize'}
              style={{ fontWeight: 600, fontSize: '1.05em' }}
            >
              {label}
            </span>
          </div>
        )}
        {section.sectionType === 'profile' && (
          <div
            style={{ lineHeight: lh }}
            dangerouslySetInnerHTML={{
              __html:
                (
                  entries.find((e) => e.data.type === 'profile')?.data as
                    Extract<TEntry['data'], { type: 'profile' }> | undefined
                )?.text ||
                (showPlaceholder ? 'Write a short professional summary about yourself.' : ''),
            }}
          />
        )}
        {section.sectionType === 'work' &&
          entries.map((e) => {
            if (e.data.type !== 'work') return null
            const w = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>
                    {customization.workDisplay.jobTitleBeforeEmployer
                      ? w.jobTitle
                      : linked(
                          w.employer,
                          w.employerLink,
                          customization,
                          colors.accent,
                          colors.text
                        )}
                    {w.employer && w.jobTitle && (
                      <span style={{ color: dim(colors.text) }}>
                        {' - '}
                        {customization.workDisplay.jobTitleBeforeEmployer
                          ? linked(
                              w.employer,
                              w.employerLink,
                              customization,
                              colors.accent,
                              colors.text
                            )
                          : w.jobTitle}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85em',
                      color: customization.applyAccentColor.dates ? colors.accent : colors.text,
                    }}
                  >
                    {formatDateRange(w.startDate, w.endDate, customization.regional.dateDisplay)}
                  </span>
                </div>
                {w.location && (
                  <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{w.location}</div>
                )}
                {hasHtml(w.description) && (
                  <div
                    style={{ marginTop: '4px' }}
                    dangerouslySetInnerHTML={{ __html: w.description }}
                  />
                )}
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
                    {customization.educationDisplay.degreeBeforeSchool
                      ? ed.degree
                      : linked(ed.school, ed.schoolLink, customization, colors.accent, colors.text)}
                    {ed.school && ed.degree && (
                      <span style={{ color: dim(colors.text) }}>
                        {' - '}
                        {customization.educationDisplay.degreeBeforeSchool
                          ? linked(
                              ed.school,
                              ed.schoolLink,
                              customization,
                              colors.accent,
                              colors.text
                            )
                          : ed.degree}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: '0.85em',
                      color: customization.applyAccentColor.dates ? colors.accent : colors.text,
                    }}
                  >
                    {formatDateRange(ed.startDate, ed.endDate, customization.regional.dateDisplay)}
                  </span>
                </div>
                {ed.location && (
                  <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{ed.location}</div>
                )}
                {hasHtml(ed.description) && (
                  <div
                    style={{ marginTop: '4px' }}
                    dangerouslySetInnerHTML={{ __html: ed.description }}
                  />
                )}
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
                : [
                    {
                      key: e.id,
                      name: linked(e.data.skill, '', customization, colors.accent, colors.text),
                      infoHtml: e.data.infoHtml,
                    },
                  ]
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
                : [{ key: e.id, name: e.data.language, infoHtml: e.data.infoHtml }]
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
                : [
                    {
                      key: e.id,
                      name: linked(
                        e.data.interest,
                        e.data.interestLink,
                        customization,
                        colors.accent,
                        colors.text
                      ),
                      level: '',
                      infoHtml: e.data.infoHtml,
                    },
                  ]
            )}
          />
        )}
        {section.sectionType === 'project' &&
          entries.map((e) => {
            if (e.data.type !== 'project') return null
            const p = e.data
            return (
              <div key={e.id} style={{ marginBottom: '8px', lineHeight: lh }}>
                <span style={{ fontWeight: 500 }}>
                  {linked(
                    p.projectTitle,
                    p.projectTitleLink,
                    customization,
                    colors.accent,
                    colors.text
                  )}
                </span>
                {p.subTitle && (
                  <div style={{ fontSize: '0.85em', color: dim(colors.text) }}>{p.subTitle}</div>
                )}
                {hasHtml(p.description) && (
                  <div
                    style={{ marginTop: '2px' }}
                    dangerouslySetInnerHTML={{ __html: p.description }}
                  />
                )}
              </div>
            )
          })}
        {(section.sectionType === 'certificate' ||
          section.sectionType === 'award' ||
          section.sectionType === 'publication' ||
          section.sectionType === 'organisation' ||
          section.sectionType === 'course') &&
          entries.map((e) => {
            if (
              e.data.type === 'certificate' ||
              e.data.type === 'publication' ||
              e.data.type === 'organisation' ||
              e.data.type === 'course' ||
              e.data.type === 'award'
            ) {
              const c = e.data
              return (
                <div key={e.id} style={{ marginBottom: '6px', lineHeight: lh }}>
                  <span style={{ fontWeight: 500 }}>
                    {linked(c.title, c.link, customization, colors.accent, colors.text)}
                  </span>
                  {c.issuer && <span style={{ color: dim(colors.text) }}> - {c.issuer}</span>}
                  {c.date && (
                    <span
                      style={{
                        float: 'right',
                        fontSize: '0.85em',
                        color: customization.applyAccentColor.dates ? colors.accent : colors.text,
                      }}
                    >
                      {c.date}
                    </span>
                  )}
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
                {hasHtml(c.description) && (
                  <div
                    style={{ marginTop: '2px' }}
                    dangerouslySetInnerHTML={{ __html: c.description }}
                  />
                )}
              </div>
            )
          })}
      </div>
    )
  }

  const photoPosition = customization.photoPosition || {
    show: true,
    grayscale: false,
    position: 'right',
    size: 'm',
    shape: 'circle',
  }
  const sizeKey = (['xs', 's', 'm', 'l', 'xl'] as const).includes(photoPosition.size as never)
    ? photoPosition.size
    : 'm'
  const shapeRadius =
    photoPosition.shape === 'circle'
      ? '9999px'
      : photoPosition.shape === 'rounded-lg'
        ? '16px'
        : photoPosition.shape === 'rounded-md'
          ? '12px'
          : photoPosition.shape === 'rounded-sm'
            ? '8px'
            : '0'
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

  const centered = header.alignText === 'center' || photoPosition.position === 'top'
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
      <div style={{ flex: 1, textAlign: centered ? 'center' : 'left' }}>
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
        gridTemplateColumns:
          header.detailsArrangement === 'grid' ? 'repeat(2, minmax(0, 1fr))' : undefined,
        gap: '2px 12px',
        fontSize: '0.85em',
        justifyContent: centered && header.detailsArrangement !== 'grid' ? 'center' : undefined,
        textAlign: centered ? 'center' : undefined,
      }}
    >
      {detailChips.map((chip, i) => {
        const IconCmp = CONTACT_ICONS[chip.key]
        const icon = header.detailsSeparator === 'icon' && IconCmp && (
          <span
            style={{
              display: 'inline-flex',
              marginRight: '4px',
              verticalAlign: 'middle',
              ...iconWrapCls(
                header.iconStyle,
                colors.accent,
                colors.text,
                customization.applyAccentColor.icons
              ),
            }}
          >
            <IconCmp style={{ width: '0.9em', height: '0.9em' }} />
          </span>
        )
        const separator = header.detailsSeparator !== 'icon' && i > 0 && (
          <span style={{ marginRight: '0', color: dim(colors.text) }}>
            {header.detailsSeparator === 'bullet' ? ' • ' : ' | '}
          </span>
        )
        const link = detailLinks[chip.key] || ''
        const content = link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{ color: colors.text, textDecoration: 'none' }}
          >
            {chip.text}
          </a>
        ) : (
          <>{chip.text}</>
        )
        return (
          <span key={i}>
            {separator}
            {icon}
            {content}
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
      className="print-page mx-auto w-full bg-white"
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
            ? {
                display: 'grid',
                gridTemplateColumns: `${leftWidth}fr ${100 - leftWidth}fr`,
                gap: '24px',
              }
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
          <div style={{ minWidth: 0 }}>{twoColBodies[1].sections.map(renderSection)}</div>
        )}
      </div>
    </div>
  )
}
