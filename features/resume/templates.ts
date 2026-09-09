import type {
  Customization,
  DateObject,
  EntryData,
  PersonalDetails,
  SectionType,
} from '@/features/resume/types'
import { SECTION_LABELS, SECTION_ICONS, EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'
import type { LetterDesign } from '@/features/letter/types'
import { mergeCustomization } from '@/features/letter/types'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'

export interface TemplateSection {
  sectionType: SectionType
  displayName: string
  iconKey: string
  entries: EntryData[]
}

export interface TemplatePreset {
  id: string
  name: string
  description: string
  tags: string[]
  customization: Customization
  personalDetails: PersonalDetails
  sections: TemplateSection[]
}

// ---------- design helper ----------

type Deep = Record<string, unknown>

function mergeInto(base: Deep, patch: Deep): Deep {
  const out: Deep = { ...base }
  for (const k of Object.keys(patch)) {
    const v = patch[k]
    const b = base[k]
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' && !Array.isArray(b)
        ? mergeInto(b as Deep, v as Deep)
        : v
  }
  return out
}

function design(patch: Deep): Customization {
  return mergeInto(DEFAULT_CUSTOMIZATION as unknown as Deep, patch) as unknown as Customization
}

const colors = (single: string, accent = single, bg = '#ffffff', text = '#000000') => ({
  colors: {
    basic: {
      single,
      multi: { textColor: text, accentColor: accent, backgroundColor: bg },
    },
  },
})

const twoCol = () => ({
  layout: {
    selected: 'two' as const,
    detailsPosition: 'left' as const,
    two: { leftWidth: 50, rightWidth: 50, sectionDisplay: 'halfHalf', personalDetails: 'top' },
  },
  header: { position: 'left' as const, detailsArrangement: 'column' as const },
})

// ---------- shared placeholder content ----------

const D = (year: string, month: string, ongoing = false): DateObject => ({
  hide: false,
  year,
  month,
  ongoing,
  onlyYear: false,
  customOngoingWord: 'present',
})

const work = (
  jobTitle: string,
  employer: string,
  location: string,
  start: DateObject,
  end: DateObject,
  description: string
): EntryData => ({
  type: 'work',
  jobTitle,
  employer,
  employerLink: '',
  location,
  city: '',
  country: '',
  startDate: start,
  endDate: end,
  description,
})

// ---------- shared placeholder content ----------

export const TEMPLATE_PERSONAL_DETAILS: PersonalDetails = {
  ...EMPTY_PERSONAL_DETAILS,
  fullName: 'Alex Morgan',
  jobTitle: 'Senior Frontend Developer',
  displayEmail: 'alex.morgan@example.com',
  emailLink: 'mailto:alex.morgan@example.com',
  phone: '+31 20 555 0199',
  phoneLink: 'tel:+31205550199',
  address: 'Amsterdam, Netherlands',
  website: 'alexmorgan.dev',
  websiteLink: 'https://alexmorgan.dev',
  social: {
    github: { link: 'https://github.com/alexmorgan', display: 'github.com/alexmorgan' },
    linkedIn: { link: 'https://linkedin.com/in/alexmorgan', display: 'linkedin.com/in/alexmorgan' },
  },
  photo: { ...EMPTY_PERSONAL_DETAILS.photo, imageId: '' },
}

export const TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO: PersonalDetails = {
  ...TEMPLATE_PERSONAL_DETAILS,
  photo: { ...TEMPLATE_PERSONAL_DETAILS.photo, imageId: 'https://i.pravatar.cc/300?img=12' },
}

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    sectionType: 'profile',
    displayName: SECTION_LABELS.profile,
    iconKey: SECTION_ICONS.profile,
    entries: [
      {
        type: 'profile',
        text: 'Frontend developer with 7+ years of experience building accessible, high-performance web applications. Specialized in React, TypeScript and design systems, with a track record of leading migrations and mentoring engineers.',
      },
    ],
  },
  {
    sectionType: 'work',
    displayName: SECTION_LABELS.work,
    iconKey: SECTION_ICONS.work,
    entries: [
      work(
        'Senior Frontend Developer',
        'Nova Digital',
        'Amsterdam, NL',
        D('2021', '03'),
        D('', '', true),
        'Led the design-system rebuild used by 40+ engineers. Cut bundle size by 35% and improved Lighthouse performance from 62 to 96 across the flagship product.'
      ),
      work(
        'Frontend Developer',
        'BrightLabs',
        'Rotterdam, NL',
        D('2018', '06'),
        D('2021', '02'),
        'Shipped the customer portal from zero to 30k monthly users. Introduced TypeScript, automated testing and CI checks to the frontend team.'
      ),
    ],
  },
  {
    sectionType: 'education',
    displayName: SECTION_LABELS.education,
    iconKey: SECTION_ICONS.education,
    entries: [
      {
        type: 'education',
        degree: 'B.Sc. Computer Science',
        school: 'University of Amsterdam',
        schoolLink: '',
        location: 'Amsterdam, NL',
        startDate: D('2014', '09'),
        endDate: D('2018', '06'),
        description: 'Graduated cum laude. Thesis on rendering performance in single-page applications.',
      },
    ],
  },
  {
    sectionType: 'skill',
    displayName: SECTION_LABELS.skill,
    iconKey: SECTION_ICONS.skill,
    entries: [
      { type: 'skill', skill: 'TypeScript', level: 'Expert', infoHtml: '' },
      { type: 'skill', skill: 'React & Next.js', level: 'Expert', infoHtml: '' },
      { type: 'skill', skill: 'CSS & Tailwind', level: 'Advanced', infoHtml: '' },
      { type: 'skill', skill: 'Node.js', level: 'Advanced', infoHtml: '' },
      { type: 'skill', skill: 'Testing (Vitest, Playwright)', level: 'Advanced', infoHtml: '' },
      { type: 'skill', skill: 'Accessibility (WCAG)', level: 'Advanced', infoHtml: '' },
    ],
  },
  {
    sectionType: 'language',
    displayName: SECTION_LABELS.language,
    iconKey: SECTION_ICONS.language,
    entries: [
      { type: 'language', language: 'English', level: 'Fluent', infoHtml: '' },
      { type: 'language', language: 'Dutch', level: 'Intermediate', infoHtml: '' },
      { type: 'language', language: 'German', level: 'Basic', infoHtml: '' },
    ],
  },
  {
    sectionType: 'project',
    displayName: SECTION_LABELS.project,
    iconKey: SECTION_ICONS.project,
    entries: [
      {
        type: 'project',
        projectTitle: 'OpenUI Component Library',
        projectTitleLink: 'https://github.com/alexmorgan/openui',
        subTitle: 'Creator & Maintainer',
        startDate: D('2022', '01'),
        endDate: D('', '', true),
        description:
          'Open-source React component library with 4.2k GitHub stars. Focus on accessibility, tree-shaking and zero-runtime styling.',
      },
      {
        type: 'project',
        projectTitle: 'DevMetrics',
        projectTitleLink: '',
        subTitle: 'Side project',
        startDate: D('2023', '09'),
        endDate: D('2024', '02'),
        description:
          'Analytics dashboard for engineering teams. Next.js, Postgres and server-side aggregation; 1.5k monthly active users.',
      },
    ],
  },
  {
    sectionType: 'certificate',
    displayName: SECTION_LABELS.certificate,
    iconKey: SECTION_ICONS.certificate,
    entries: [
      {
        type: 'certificate',
        title: 'AWS Certified Developer – Associate',
        link: '',
        issuer: 'Amazon Web Services',
        location: '',
        date: '2023',
      },
      {
        type: 'certificate',
        title: 'Professional Scrum Master I',
        link: '',
        issuer: 'Scrum.org',
        location: '',
        date: '2021',
      },
    ],
  },
  {
    sectionType: 'award',
    displayName: SECTION_LABELS.award,
    iconKey: SECTION_ICONS.award,
    entries: [
      {
        type: 'award',
        title: 'Internal Innovation Award',
        link: '',
        issuer: 'Nova Digital',
        location: '',
        date: '2023',
        description: 'For the design-system rebuild that cut feature delivery time by a third.',
      },
    ],
  },
  {
    sectionType: 'interest',
    displayName: SECTION_LABELS.interest,
    iconKey: SECTION_ICONS.interest,
    entries: [
      { type: 'interest', interest: 'Photography', interestLink: '', infoHtml: '' },
      { type: 'interest', interest: 'Running', interestLink: '', infoHtml: '' },
      { type: 'interest', interest: 'Chess', interestLink: '', infoHtml: '' },
    ],
  },
]

// ---------- the 24 templates ----------

export const RESUME_TEMPLATES: TemplatePreset[] = [
  {
    id: 'classic-clear',
    name: 'Classic Clear',
    description: 'Clean, traditional layout with a blue accent and serif body font',
    tags: ['simple', 'classic', 'professional'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'Source Sans 3' },
      ...colors('#044cb5', '#002e71', '#f3f3f3'),
      heading: { style: 'line', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    description: 'Two-column layout with a dark left panel and light right panel',
    tags: ['modern', 'creative'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Inter' },
      ...colors('#1e293b', '#1e293b', '#1e293b', '#ffffff'),
      ...twoCol(),
      heading: { style: 'thinLine', icons: 'filled', capitalization: 'uppercase' },
      header: {
        detailsDisplayLeftRight: 'icon',
        iconFrame: 'circle',
        iconFrameStyle: 'filled',
      },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'mercury-flow',
    name: 'Mercury Flow',
    description: 'Clean single-column with a bold accent line at the top',
    tags: ['simple', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Nunito Sans' },
      ...colors('#0891b2', '#0891b2', '#f8fafc', '#0f172a'),
      border: { width: { line: 'l', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      heading: { style: 'underline', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'saffron-line',
    name: 'Saffron Line',
    description: 'Warm palette with an orange accent and subtle borders',
    tags: ['creative', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Work Sans' },
      ...colors('#ea580c', '#ea580c', '#fff7ed', '#1c1917'),
      heading: { style: 'thickShortUnderline', icons: 'outline', capitalization: 'capitalize' },
      border: { width: { line: 'm', image: 'm', filled: 'm' }, selectedStyle: 'line' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'cobalt-edge',
    name: 'Cobalt Edge',
    description: 'Dark navy accents with white body, single-column for impact',
    tags: ['modern', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Inter' },
      ...colors('#1e3a5f'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        iconFrame: 'rounded',
        iconFrameStyle: 'outline',
      },
      heading: { style: 'box', icons: 'filled', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    description: 'Calm green tones with a clean two-column layout',
    tags: ['modern', 'simple'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'Crimson Pro' },
      ...colors('#4a7c59', '#4a7c59', '#f0f7f0', '#1a2e1d'),
      ...twoCol(),
      heading: { style: 'thinLine', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'steel-grey',
    name: 'Steel Grey',
    description: 'Monochromatic palette with clean typography and subtle borders',
    tags: ['simple', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Lato' },
      ...colors('#475569', '#475569', '#f1f5f9', '#0f172a'),
      border: { width: { line: 's', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      heading: { style: 'plain', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'editorial-rule',
    name: 'Editorial Rule',
    description: 'Bold centered header with a double-line rule, serif body',
    tags: ['creative', 'classic'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'Lora' },
      ...colors('#b91c1c', '#b91c1c', '#fef2f2', '#1c1917'),
      heading: { style: 'topBottomLine', icons: 'outline', capitalization: 'uppercase' },
      header: {
        photo: { show: true, size: 'l', grayscale: false, shape: 'round' },
        photoPositionHeaderOnTop: 'center',
        alignText: 'center',
      },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'muse-two-tone',
    name: 'Muse Two-Tone',
    description: 'Two-column layout with violet accents and icon-marked sections',
    tags: ['modern', 'creative'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Poppins' },
      ...colors('#7c3aed', '#7c3aed', '#f5f3ff', '#1e1b4b'),
      ...twoCol(),
      heading: { style: 'thinLine', icons: 'outline', capitalization: 'uppercase' },
      header: { detailsDisplayLeftRight: 'icon', iconStyle: 'soft-badge' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'cubic-slate',
    name: 'Cubic Slate',
    description: 'Dark slate header band over a crisp single-column body',
    tags: ['modern', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Rubik' },
      ...colors('#0f172a', '#0f172a', '#e2e8f0', '#ffffff'),
      header: {
        photo: { show: true, size: 'm', grayscale: false, shape: 'squareRounded' },
        alignText: 'center',
        photoPositionHeaderOnTop: 'left',
      },
      heading: { style: 'simple', icons: 'filled', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'valera-ink',
    name: 'Valera Ink',
    description: 'Black-and-white layout with strong typography, zero ornament',
    tags: ['classic', 'professional'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'Playfair Display' },
      ...colors('#111111', '#111111', '#f5f5f5', '#111111'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        alignText: 'center',
        photoPositionHeaderOnTop: 'center',
        nameStyle: 'bold',
      },
      heading: { style: 'plain', icons: 'none', capitalization: 'uppercase' },
      applyAccentColor: { name: false, dates: false, icons: false, headings: false, jobTitle: false },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'influx-navy',
    name: 'Influx Navy',
    description: 'Deep navy header separation, built for corporate roles',
    tags: ['professional', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'DM Sans' },
      ...colors('#1d4ed8', '#1d4ed8', '#eff6ff', '#0f172a'),
      border: { width: { line: 'm', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      heading: { style: 'box', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'newcast-minimal',
    name: 'Newcast Minimal',
    description: 'Minimalist section icons with a subtle contemporary color',
    tags: ['simple', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Plus Jakarta Sans' },
      ...colors('#0d9488', '#0d9488', '#f0fdfa', '#134e4a'),
      header: { photo: { show: false, size: 'm', grayscale: false, shape: 'round' } },
      heading: { style: 'line', icons: 'outline', capitalization: 'capitalize' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'nanica-plain',
    name: 'Nanica Plain',
    description: 'Traditional black-and-white format, great readability in print',
    tags: ['simple', 'classic', 'ats'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'PT Serif' },
      ...colors('#000000', '#000000', '#f5f5f5', '#000000'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        detailsSeparator: 'bullet',
      },
      heading: { style: 'simple', icons: 'none', capitalization: 'uppercase' },
      applyAccentColor: { name: false, dates: false, icons: false, headings: false, jobTitle: false },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'crisp-paper',
    name: 'Crisp Paper',
    description: 'Print-first design with no graphics — looks perfect on paper',
    tags: ['simple', 'ats', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Lato' },
      ...colors('#334155', '#334155', '#f8fafc', '#0f172a'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        detailsSeparator: 'bar',
      },
      heading: { style: 'dottedLine', icons: 'none', capitalization: 'uppercase' },
      links: { underline: true, useAccent: false, icon: false, iconType: 'external' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'minimo-top',
    name: 'Minimo',
    description: 'Minimalist layout that keeps key sections on the top half',
    tags: ['simple', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Inter' },
      ...colors('#0ea5e9', '#0ea5e9', '#f0f9ff', '#0c4a6e'),
      header: {
        photo: { show: true, size: 's', grayscale: false, shape: 'circle' },
        alignText: 'center',
        photoPositionHeaderOnTop: 'center',
      },
      spacing: {
        fontSize: '2',
        lineHeight: '2',
        marginVertical: '2',
        headingGap: '2',
        nameFontSizePt: 24,
        jobTitleFontSizePt: 18,
        detailsFontSizePt: 12,
        detailsIconSizePt: 10,
      },
      heading: { style: 'plain', icons: 'none', capitalization: 'capitalize' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'diamond-rose',
    name: 'Diamond Rose',
    description: 'Rose accents with diamond-shape icon framing, designer-friendly',
    tags: ['creative', 'modern'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Montserrat' },
      ...colors('#e11d48', '#e11d48', '#fff1f2', '#4c0519'),
      ...twoCol(),
      header: {
        detailsDisplayLeftRight: 'icon',
        iconStyle: 'soft-badge',
        iconFrame: 'square',
        iconFrameStyle: 'filled',
      },
      heading: { style: 'thinLine', icons: 'outline', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'primo-timeline',
    name: 'Primo Timeline',
    description: 'Career-progress layout with date-first entry arrangement',
    tags: ['modern', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Open Sans' },
      ...colors('#ca8a04', '#a16207', '#fefce8', '#422006'),
      entryLayout: { displayMode: 'dateLocationLeft', dateLocationOrder: 'dateLocation' },
      heading: { style: 'underline', icons: 'filled', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'enfold-teal',
    name: 'Enfold Teal',
    description: 'Teal side column highlighted in soft grey, two-column',
    tags: ['modern', 'creative'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Nunito Sans' },
      ...colors('#0f766e', '#0f766e', '#f1f5f9', '#042f2e'),
      ...twoCol(),
      colors: {
        basic: {
          single: '#0f766e',
          multi: { textColor: '#ffffff', accentColor: '#0f766e', backgroundColor: '#0f766e' },
        },
      },
      header: { detailsDisplayLeftRight: 'icon', iconStyle: 'primary-accent' },
      heading: { style: 'simple', icons: 'outline', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'initials-bold',
    name: 'Initials Bold',
    description: 'Skills-forward layout with a big name header and bold accents',
    tags: ['modern', 'creative'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Montserrat' },
      ...colors('#dc2626', '#dc2626', '#fef2f2', '#450a0a'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        alignText: 'center',
        accentuateName: true,
        jobTitleStyle: 'italic',
      },
      heading: { style: 'thickShortUnderline', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'executive-gold',
    name: 'Executive Gold',
    description: 'Serif executive style with bronze-gold accents and centered header',
    tags: ['classic', 'professional'],
    customization: design({
      font: { selected: 'serif', fontFamily: 'EB Garamond' },
      ...colors('#92610a', '#b45309', '#fffbeb', '#451a03'),
      header: {
        alignText: 'center',
        photoPositionHeaderOnTop: 'center',
        photo: { show: true, size: 'm', grayscale: true, shape: 'circle' },
        nameStyle: 'bold',
      },
      heading: { style: 'topBottomLine', icons: 'none', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'ats-safe',
    name: 'ATS Safe',
    description: 'The plainest parser-proof layout: standard headings, no icons or photo',
    tags: ['ats', 'simple', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Roboto' },
      ...colors('#000000', '#000000', '#ffffff', '#000000'),
      header: {
        photo: { show: false, size: 'm', grayscale: false, shape: 'round' },
        detailsSeparator: 'bullet',
        detailsDisplayCenter: 'text',
        detailsDisplayLeftRight: 'text',
        alignText: 'start',
      },
      heading: { style: 'simple', icons: 'none', capitalization: 'uppercase' },
      skill: { selected: 'rows', text: 'bullet', rows: { spacing: 'spacious', bullets: true } },
      applyAccentColor: { name: false, dates: false, icons: false, headings: false, jobTitle: false },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'emerald-column',
    name: 'Emerald Column',
    description: 'Emerald left column with white content area, easy to scan',
    tags: ['modern', 'professional'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'Source Sans 3' },
      ...colors('#059669', '#059669', '#ecfdf5', '#022c22'),
      ...twoCol(),
      heading: { style: 'line', icons: 'filled', capitalization: 'uppercase' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS_WITH_PHOTO,
    sections: TEMPLATE_SECTIONS,
  },
  {
    id: 'aurora-violet',
    name: 'Aurora Violet',
    description: 'Violet modern single-column with soft section rules',
    tags: ['modern', 'simple'],
    customization: design({
      font: { selected: 'sans', fontFamily: 'DM Sans' },
      ...colors('#8b5cf6', '#8b5cf6', '#f5f3ff', '#2e1065'),
      border: { width: { line: 's', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      heading: { style: 'zigZagLine', icons: 'none', capitalization: 'capitalize' },
    }),
    personalDetails: TEMPLATE_PERSONAL_DETAILS,
    sections: TEMPLATE_SECTIONS,
  },
]

export const LETTER_TEMPLATES: {
  id: string
  name: string
  description: string
  tags: string[]
  design: LetterDesign
}[] = [
  {
    id: 'classic-left',
    name: 'Classic Left',
    description: 'Traditional left-aligned sender block with modern accents',
    tags: ['simple', 'classic'],
    design: {
      customization: mergeCustomization({
        font: { selected: 'custom', fontFamily: 'Source Sans 3' },
        colors: {
          ...DEFAULT_CUSTOMIZATION.colors,
          mode: 'basic',
          basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#044cb5' },
        },
      }),
      letterDateDisplay: { position: 'left' },
    },
  },
  {
    id: 'modern-header',
    name: 'Modern Header',
    description: 'Full-width header with photo and modern accent bar',
    tags: ['modern', 'creative'],
    design: {
      customization: mergeCustomization({
        colors: {
          ...DEFAULT_CUSTOMIZATION.colors,
          mode: 'basic',
          basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#0891b2' },
        },
        spacing: {
          fontSize: '1',
          lineHeight: '3',
          spacingFactor: '3',
          entryGap: '4',
          marginVertical: '3',
          marginHorizontal: '3',
          headingGap: '3',
          nameFontSizePt: 25,
          jobTitleFontSizePt: 19,
          detailsFontSizePt: 12,
          detailsIconSizePt: 10,
        },
      }),
      letterDateDisplay: { position: 'right' },
    },
  },
  {
    id: 'minimal-centered',
    name: 'Minimal Centered',
    description: 'Clean, centered layout with minimal ornamentation',
    tags: ['simple', 'modern'],
    design: {
      customization: mergeCustomization({
        font: { selected: 'custom', fontFamily: 'Nunito Sans' },
        colors: {
          ...DEFAULT_CUSTOMIZATION.colors,
          mode: 'basic',
          basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#475569' },
        },
        spacing: {
          fontSize: '1',
          lineHeight: '2',
          spacingFactor: '3',
          entryGap: '4',
          marginVertical: '5',
          marginHorizontal: '4',
          headingGap: '3',
          nameFontSizePt: 24,
          jobTitleFontSizePt: 18,
          detailsFontSizePt: 12,
          detailsIconSizePt: 10,
        },
      }),
      letterDateDisplay: { position: 'center' },
    },
  },
]
