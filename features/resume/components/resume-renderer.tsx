import type {
  Customization,
  DateObject,
  PersonalDetails,
  TEntry,
  TSection,
} from '@/features/resume/types'
import { SECTION_LABELS } from '@/features/resume/defaults'

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

function skillText(section: TSection, delimiter: string) {
  return section.entries
    .filter((e) => e.data.type === 'skill')
    .map((e) => (e.data as Extract<TEntry['data'], { type: 'skill' }>).skill)
    .filter(Boolean)
    .join(delimiter)
}

function languageText(section: TSection, delimiter: string) {
  return section.entries
    .filter((e) => e.data.type === 'language')
    .map((e) => {
      const d = e.data as Extract<TEntry['data'], { type: 'language' }>
      return `${d.language}${d.level ? ` (${d.level})` : ''}`
    })
    .filter(Boolean)
    .join(delimiter)
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

  const headingClass =
    heading.style === 'box'
      ? `inline-block px-2 py-0.5 bg-[${colors.accent}] text-white`
      : heading.style === 'thickShortUnderline'
        ? `border-b-4 border-[${colors.accent}]`
        : heading.style === 'topBottomLine'
          ? `border-y-2 border-[${colors.accent}] py-0.5`
          : `border-b border-[${colors.accent}] pb-0.5`

  const detailChips = personalDetails.detailsOrder
    .filter((k) => {
      const v = personalDetails[k as keyof PersonalDetails]
      return typeof v === 'string' && v
    })
    .map((k) => ({ key: k, value: personalDetails[k as keyof PersonalDetails] as string }))

  const isTwoCol = layout.selected === 'two'

  function renderSection(section: TSection) {
    const label = section.displayName || SECTION_LABELS[section.sectionType] || 'Section'
    if (section.hidden) return null
    const entries = section.entries.filter((e) => !e.hidden && e.data !== null)
    if (!entries.length && !showPlaceholder) return null

    return (
      <div key={section.id} className="mb-4" style={{ marginBottom: `${Number(spacing.spacingFactor) * 2}px` }}>
        <div className={`mb-1.5 font-semibold ${headingClass}`} style={{ color: heading.style === 'box' ? '#fff' : colors.accent }}>
          <span className={heading.capitalization === 'uppercase' ? 'uppercase' : 'capitalize'}>{label}</span>
        </div>
        {section.sectionType === 'profile' && (
          <div className="text-sm" style={{ lineHeight: lh }} dangerouslySetInnerHTML={{ __html: (entries.find((e) => e.data.type === 'profile')?.data as Extract<TEntry['data'], { type: 'profile' }> | undefined)?.text || '' }} />
        )}
        {section.sectionType === 'work' &&
          entries.map((e) => {
            if (e.data.type !== 'work') return null
            const w = e.data
            return (
              <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
                <div className="flex justify-between gap-2">
                  <span className="font-medium">
                    {customization.workDisplay.jobTitleBeforeEmployer ? w.jobTitle : w.employer}
                    {w.employer && w.jobTitle && <span className="text-muted-foreground"> - {customization.workDisplay.jobTitleBeforeEmployer ? w.employer : w.jobTitle}</span>}
                  </span>
                  <span className="text-xs" style={{ color: colors.accent }}>
                    {formatDateRange(w.startDate, w.endDate)}
                  </span>
                </div>
                {w.location && <div className="text-xs text-muted-foreground">{w.location}</div>}
                {w.description && <div className="mt-1" dangerouslySetInnerHTML={{ __html: w.description }} />}
              </div>
            )
          })}
        {section.sectionType === 'education' &&
          entries.map((e) => {
            if (e.data.type !== 'education') return null
            const ed = e.data
            return (
              <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
                <div className="flex justify-between gap-2">
                  <span className="font-medium">
                    {customization.educationDisplay.degreeBeforeSchool ? ed.degree : ed.school}
                    {ed.school && ed.degree && <span className="text-muted-foreground"> - {customization.educationDisplay.degreeBeforeSchool ? ed.school : ed.degree}</span>}
                  </span>
                  <span className="text-xs" style={{ color: colors.accent }}>
                    {formatDateRange(ed.startDate, ed.endDate)}
                  </span>
                </div>
                {ed.location && <div className="text-xs text-muted-foreground">{ed.location}</div>}
              </div>
            )
          })}
        {section.sectionType === 'skill' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {skillText(section, customization.skill.text === 'comma' ? ', ' : customization.skill.text === 'pipe' ? ' | ' : ' • ')}
          </div>
        )}
        {section.sectionType === 'language' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {languageText(section, ', ')}
          </div>
        )}
        {section.sectionType === 'interest' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {entries.map((e) => e.data.type === 'interest' ? e.data.interest : '').filter(Boolean).join(customization.interest.text === 'pipe' ? ' | ' : ', ')}
          </div>
        )}
        {section.sectionType === 'project' &&
          entries.map((e) => {
            if (e.data.type !== 'project') return null
            const p = e.data
            return (
              <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
                <span className="font-medium">
                  {p.projectTitle}
                  {p.projectTitleLink && <span className="text-xs" style={{ color: colors.accent }}> ({p.projectTitleLink})</span>}
                </span>
                {p.subTitle && <div className="text-xs text-muted-foreground">{p.subTitle}</div>}
                {p.description && <div className="mt-0.5" dangerouslySetInnerHTML={{ __html: p.description }} />}
              </div>
            )
          })}
        {(section.sectionType === 'certificate' || section.sectionType === 'award' || section.sectionType === 'publication' || section.sectionType === 'organisation' || section.sectionType === 'course') &&
          entries.map((e) => {
            if (e.data.type === 'certificate' || e.data.type === 'publication' || e.data.type === 'organisation' || e.data.type === 'course' || e.data.type === 'award') {
              const c = e.data
              return (
                <div key={e.id} className="mb-1.5 text-sm" style={{ lineHeight: lh }}>
                  <span className="font-medium">{c.title}</span>
                  {c.issuer && <span className="text-muted-foreground"> - {c.issuer}</span>}
                  {c.date && <span className="float-right text-xs" style={{ color: colors.accent }}>{c.date}</span>}
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
              <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
                <span className="font-medium">{c.title}</span>
                {c.subTitle && <span className="text-muted-foreground"> - {c.subTitle}</span>}
                {c.description && <div className="mt-0.5" dangerouslySetInnerHTML={{ __html: c.description }} />}
              </div>
            )
          })}
      </div>
    )
  }

  const headerContent = (
    <div
      className={header.position === 'top' ? 'flex items-start justify-between gap-4' : 'flex flex-col gap-2'}
      style={{ marginBottom: header.position === 'top' ? '16px' : '0' }}
    >
      <div className={header.alignText === 'center' ? 'text-center flex-1' : 'flex-1'}>
        <h1
          className="font-bold"
          style={{
            fontSize: `${customization.spacing.nameFontSizePt || 24}px`,
            color: customization.applyAccentColor.name ? colors.accent : colors.text,
          }}
        >
          {personalDetails.fullName || (showPlaceholder ? 'Your Name' : '')}
        </h1>
        {personalDetails.jobTitle && (
          <p
            className={header.jobTitleStyle === 'italic' ? 'italic' : ''}
            style={{ fontSize: `${customization.spacing.jobTitleFontSizePt || 18}px`, color: customization.applyAccentColor.jobTitle ? colors.accent : colors.text }}
          >
            {personalDetails.jobTitle}
          </p>
        )}
      </div>
      {header.photo.show && personalDetails.photo.imageId && (
        <img
          src={personalDetails.photo.imageId}
          alt="profile"
          className={header.photo.grayscale ? 'grayscale' : ''}
          style={{
            width: `${40 + Number(header.photo.size) * 10}px`,
            height: `${40 + Number(header.photo.size) * 10}px`,
            borderRadius: header.photo.shape === 'round' ? '9999px' : header.photo.shape === 'squareRounded' ? '12px' : '0',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}
    </div>
  )

  const detailsBlock = detailChips.length > 0 && (
    <div className={header.detailsArrangement === 'column' ? 'flex flex-col gap-0.5 text-xs' : 'flex flex-wrap gap-x-3 gap-y-0.5 text-xs'}>
      {detailChips.map((chip) => (
        <span key={chip.key} className="text-xs" style={{ color: colors.text }}>
          {chip.value}
        </span>
      ))}
    </div>
  )

  const leftSections = isTwoCol ? ordered.filter((s) => layout.sectionOrder.two.leftSectionsSorted.includes(s.id)) : []
  const rightSections = isTwoCol ? ordered.filter((s) => layout.sectionOrder.two.rightSectionsSorted.includes(s.id)) : []
  const singleSections = isTwoCol ? [] : ordered
  const showLeft = isTwoCol ? layout.sectionOrder.two.leftSectionsSorted.length > 0 : true
  const showRight = isTwoCol ? layout.sectionOrder.two.rightSectionsSorted.length > 0 : false

  const splitLeft = isTwoCol && showLeft && !showRight ? ordered.slice(0, Math.ceil(ordered.length / 2)) : leftSections
  const splitRight = isTwoCol && showLeft && !showRight ? ordered.slice(Math.ceil(ordered.length / 2)) : rightSections

  const twoColBodies = [
    { id: 'col-left', sections: splitLeft },
    { id: 'col-right', sections: splitRight },
  ]

  return (
    <div
      className="mx-auto w-full max-w-[794px] bg-white text-foreground"
      style={{
        fontFamily,
        fontSize: `${10 + fs}px`,
        lineHeight: lh,
        color: colors.text,
        padding: `${14 + Number(spacing.marginVertical) * 3}px ${16 + Number(spacing.marginHorizontal) * 3}px`,
        minHeight: '1123px',
      }}
    >
      <div className={isTwoCol ? 'grid grid-cols-[1fr_1.2fr] gap-6' : ''}>
        {isTwoCol && (
          <div>
            {headerContent}
            {detailsBlock}
            <div className="mt-3">{twoColBodies[0].sections.map(renderSection)}</div>
          </div>
        )}
        {!isTwoCol && (
          <div>
            {headerContent}
            {detailsBlock}
            <div className="mt-3">{singleSections.map(renderSection)}</div>
          </div>
        )}
        {isTwoCol && (
          <div>
            {twoColBodies[1].sections.map(renderSection)}
          </div>
        )}
      </div>
    </div>
  )
}