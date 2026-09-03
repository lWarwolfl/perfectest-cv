import type {
  AnyEntry,
  CertificateEntry,
  Content,
  CustomEntry,
  Customization,
  DateObject,
  EducationEntry,
  InterestEntry,
  LanguageEntry,
  PersonalDetails,
  ProfileEntry,
  ProjectEntry,
  Section,
  SkillEntry,
  WorkEntry,
} from '@/features/resume/types'
import { SECTION_LABELS } from '@/features/resume/defaults'

function dateStr(d: DateObject) {
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

function sectionEntries(content: Content, sectionOrder: string[]) {
  const ids = sectionOrder.length ? sectionOrder : Object.keys(content)
  return ids
    .map((id) => content[id])
    .filter((s): s is Section => !!s && !s.sectionType.startsWith('header'))
}

function isWorkEntry(e: AnyEntry): e is WorkEntry {
  return 'jobTitle' in e
}

function isEducationEntry(e: AnyEntry): e is EducationEntry {
  return 'degree' in e
}

function isSkillEntry(e: AnyEntry): e is SkillEntry {
  return 'skill' in e
}

function isLanguageEntry(e: AnyEntry): e is LanguageEntry {
  return 'language' in e
}

function isInterestEntry(e: AnyEntry): e is InterestEntry {
  return 'interest' in e
}

function isProjectEntry(e: AnyEntry): e is ProjectEntry {
  return 'projectTitle' in e
}

function isCertificateEntry(e: AnyEntry): e is CertificateEntry {
  return 'issuer' in e && 'title' in e
}

function isProfileEntry(e: AnyEntry): e is ProfileEntry {
  return 'text' in e
}

function isCustomEntry(e: AnyEntry): e is CustomEntry {
  return 'subTitle' in e
}

function skillText(section: Section, customization: Customization, delimiter: string) {
  return section.entries
    .filter(isSkillEntry)
    .map((e) => e.skill)
    .filter(Boolean)
    .join(delimiter)
}

function languageText(section: Section, delimiter: string) {
  return section.entries
    .filter(isLanguageEntry)
    .map((e) => `${e.language}${e.level ? ` (${e.level})` : ''}`)
    .filter(Boolean)
    .join(delimiter)
}

export function ResumeRenderer({
  personalDetails,
  content,
  customization,
  showPlaceholder = false,
}: {
  personalDetails: PersonalDetails
  content: Content
  customization: Customization
  showPlaceholder?: boolean
}) {
  const colors = colorStyle(customization)
  const { header, layout, heading, spacing } = customization
  const fontFamily = customization.font.fontFamily || 'Inter'
  const fs = 1 + Number(spacing.fontSize) * 0.05
  const lh = 1.2 + Number(spacing.lineHeight) * 0.1
  const sections = sectionEntries(content, layout.sectionOrder.mix)

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

  function renderSection(section: Section) {
    const label = section.displayName || SECTION_LABELS[section.sectionType] || 'Section'
    const entries = section.entries.filter((e) => !('isHidden' in e && e.isHidden))
    if (!entries.length && !showPlaceholder) return null

    return (
      <div key={section.id} className="mb-4" style={{ marginBottom: `${Number(spacing.spacingFactor) * 2}px` }}>
        <div className={`mb-1.5 font-semibold ${headingClass}`} style={{ color: heading.style === 'box' ? '#fff' : colors.accent }}>
          <span className={heading.capitalization === 'uppercase' ? 'uppercase' : 'capitalize'}>{label}</span>
        </div>
        {section.sectionType === 'profile' && (
          <div className="text-sm" style={{ lineHeight: lh }} dangerouslySetInnerHTML={{ __html: entries.find(isProfileEntry)?.text || '' }} />
        )}
        {section.sectionType === 'work' &&
          entries.filter(isWorkEntry).map((e) => (
            <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
              <div className="flex justify-between gap-2">
                <span className="font-medium">
                  {customization.workDisplay.jobTitleBeforeEmployer ? e.jobTitle : e.employer}
                  {e.employer && e.jobTitle && <span className="text-muted-foreground"> - {customization.workDisplay.jobTitleBeforeEmployer ? e.employer : e.jobTitle}</span>}
                </span>
                <span className="text-xs" style={{ color: colors.accent }}>
                  {formatDateRange(e.startDate, e.endDate)}
                </span>
              </div>
              {e.location && <div className="text-xs text-muted-foreground">{e.location}</div>}
              {e.description && <div className="mt-1" dangerouslySetInnerHTML={{ __html: e.description }} />}
            </div>
          ))}
        {section.sectionType === 'education' &&
          entries.filter(isEducationEntry).map((e) => (
            <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
              <div className="flex justify-between gap-2">
                <span className="font-medium">
                  {customization.educationDisplay.degreeBeforeSchool ? e.degree : e.school}
                  {e.school && e.degree && <span className="text-muted-foreground"> - {customization.educationDisplay.degreeBeforeSchool ? e.school : e.degree}</span>}
                </span>
                <span className="text-xs" style={{ color: colors.accent }}>
                  {formatDateRange(e.startDate, e.endDate)}
                </span>
              </div>
              {e.location && <div className="text-xs text-muted-foreground">{e.location}</div>}
            </div>
          ))}
        {section.sectionType === 'skill' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {skillText(section, customization, customization.skill.text === 'comma' ? ', ' : customization.skill.text === 'pipe' ? ' | ' : ' • ')}
          </div>
        )}
        {section.sectionType === 'language' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {languageText(section, ', ')}
          </div>
        )}
        {section.sectionType === 'interest' && (
          <div className="text-sm" style={{ lineHeight: lh }}>
            {entries.filter(isInterestEntry).map((e) => e.interest).filter(Boolean).join(customization.interest.text === 'pipe' ? ' | ' : ', ')}
          </div>
        )}
        {section.sectionType === 'project' &&
          entries.filter(isProjectEntry).map((e) => (
            <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
              <span className="font-medium">
                {e.projectTitle}
                {e.projectTitleLink && <span className="text-xs" style={{ color: colors.accent }}> ({e.projectTitleLink})</span>}
              </span>
              {e.subTitle && <div className="text-xs text-muted-foreground">{e.subTitle}</div>}
              {e.description && <div className="mt-0.5" dangerouslySetInnerHTML={{ __html: e.description }} />}
            </div>
          ))}
        {(section.sectionType === 'certificate' || section.sectionType === 'award' || section.sectionType === 'publication' || section.sectionType === 'organisation' || section.sectionType === 'course') &&
          entries.filter(isCertificateEntry).map((e) => (
            <div key={e.id} className="mb-1.5 text-sm" style={{ lineHeight: lh }}>
              <span className="font-medium">{e.title}</span>
              {e.issuer && <span className="text-muted-foreground"> - {e.issuer}</span>}
              {e.date && <span className="float-right text-xs" style={{ color: colors.accent }}>{e.date}</span>}
            </div>
          ))}
        {section.sectionType === 'custom' &&
          entries.filter(isCustomEntry).map((e) => (
            <div key={e.id} className="mb-2 text-sm" style={{ lineHeight: lh }}>
              <span className="font-medium">{e.title}</span>
              {e.subTitle && <span className="text-muted-foreground"> - {e.subTitle}</span>}
              {e.description && <div className="mt-0.5" dangerouslySetInnerHTML={{ __html: e.description }} />}
            </div>
          ))}
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

  const leftSections = isTwoCol ? sections.filter((s) => layout.sectionOrder.two.leftSectionsSorted.includes(s.id)) : []
  const rightSections = isTwoCol ? sections.filter((s) => layout.sectionOrder.two.rightSectionsSorted.includes(s.id)) : []
  const singleSections = isTwoCol ? [] : sections
  const showLeft = isTwoCol ? layout.sectionOrder.two.leftSectionsSorted.length > 0 : true
  const showRight = isTwoCol ? layout.sectionOrder.two.rightSectionsSorted.length > 0 : false

  const splitLeft = isTwoCol && showLeft && !showRight ? sections.slice(0, Math.ceil(sections.length / 2)) : leftSections
  const splitRight = isTwoCol && showLeft && !showRight ? sections.slice(Math.ceil(sections.length / 2)) : rightSections

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
