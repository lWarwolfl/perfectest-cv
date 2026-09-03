import { uid } from '@/lib/utils'
import type {
  AnyEntry,
  CertificateEntry,
  Content,
  CustomEntry,
  Customization,
  EducationEntry,
  GenericEntry,
  InterestEntry,
  LanguageEntry,
  PersonalDetails,
  ProfileEntry,
  ProjectEntry,
  SectionType,
  SkillEntry,
  WorkEntry,
} from '@/features/resume/types'

export const EMPTY_PERSONAL_DETAILS: PersonalDetails = {
  fullName: '',
  jobTitle: '',
  displayEmail: '',
  phone: '',
  address: '',
  website: '',
  websiteLink: '',
  social: { github: { link: '', display: '' }, linkedIn: { link: '', display: '' } },
  detailsOrder: ['displayEmail', 'phone', 'address', 'website', 'linkedIn', 'github'],
  photo: {
    xPct: 0,
    yPct: 0,
    shape: 'round',
    imageId: '',
    widthPct: 100,
    heightPct: 100,
    originalWidth: 0,
    originalHeight: 0,
  },
  birthday: { day: '', year: '', month: '' },
  age: '',
  gender: '',
  nationality: '',
  visa: '',
  military: '',
  passport: '',
  maritalStatus: '',
  drivingLicense: '',
}

export const SECTION_LABELS: Record<SectionType, string> = {
  profile: 'Profile',
  work: 'Work Experience',
  education: 'Education',
  skill: 'Skills',
  language: 'Languages',
  interest: 'Interests',
  project: 'Projects',
  certificate: 'Certificates',
  publication: 'Publications',
  organisation: 'Organizations',
  course: 'Courses',
  award: 'Awards',
  reference: 'References',
  declaration: 'Declaration',
  custom: 'Custom Section',
}

export function defaultSection(sectionType: SectionType, id = uid()): { id: string; sectionType: SectionType } {
  return { id, sectionType }
}

export function defaultEntry(sectionType: SectionType): AnyEntry {
  const base = { id: uid(), isNewEntry: true }
  const date = { hide: false, year: '', month: '', ongoing: false, onlyYear: false, customOngoingWord: 'present' }
  switch (sectionType) {
    case 'work':
      return { ...base, jobTitle: '', employer: '', employerLink: '', location: '', city: '', country: '', startDate: { ...date }, endDate: { ...date }, description: '' } as WorkEntry
    case 'education':
      return { ...base, degree: '', school: '', schoolLink: '', location: '', startDate: { ...date }, endDate: { ...date } } as EducationEntry
    case 'skill':
      return { ...base, skill: '', level: '', infoHtml: '' } as SkillEntry
    case 'language':
      return { ...base, language: '', level: '', infoHtml: '' } as LanguageEntry
    case 'interest':
      return { ...base, interest: '', interestLink: '', infoHtml: '' } as InterestEntry
    case 'profile':
      return { ...base, text: '' } as ProfileEntry
    case 'project':
      return { ...base, projectTitle: '', projectTitleLink: '', subTitle: '', description: '' } as ProjectEntry
    case 'certificate':
      return { ...base, title: '', link: '', issuer: '', location: '', date: '' } as CertificateEntry
    case 'publication':
    case 'organisation':
    case 'course':
    case 'award':
      return { ...base, title: '', link: '', issuer: '', location: '', date: '', description: '' } as GenericEntry
    case 'reference':
      return { ...base, name: '', contact: '' } as unknown as GenericEntry
    case 'declaration':
      return { ...base, text: '' } as unknown as GenericEntry
    default:
      return { ...base, title: '', subTitle: '', description: '' } as CustomEntry
  }
}

export const DEFAULT_CUSTOMIZATION: Customization = {
  font: { selected: 'sans', fontFamily: 'Inter' },
  colors: {
    mode: 'basic',
    basic: {
      single: '#044cb5',
      multi: { textColor: '#000000', accentColor: '#002e71', backgroundColor: '#f3f3f3' },
      selected: 'single',
      singleCustom: '#044cb5',
      multiCustom: { textColor: '#000000', accentColor: '#002e71', backgroundColor: '#f3f3f3' },
    },
    advanced: {
      selected: 'single',
      single: '#044cb5',
      multi: {
        light: { textColor: '#000000', accentColor: '#002e71', backgroundColor: '#f3f3f3' },
        strong: { textColor: '#ffffff', accentColor: '#002e71', backgroundColor: '#0f172a' },
      },
      singleCustom: '#d32f2f',
      multiCustom: {
        light: { textColor: '#000000', accentColor: '#002e71', backgroundColor: '#f3f3f3' },
        strong: { textColor: '#ffffff', accentColor: '#002e71', backgroundColor: '#0f172a' },
      },
    },
  },
  border: { width: { line: 'm', image: 'm', filled: 'm' }, selectedStyle: 'none' },
  header: {
    position: 'top',
    alignText: 'start',
    photo: { show: true, size: 'm', grayscale: false, shape: 'round' },
    photoPositionHeaderOnTop: 'right',
    photoPositionHeaderInColumn: 'below',
    detailsArrangement: 'wrap',
    detailsDisplayCenter: 'text',
    detailsDisplayLeftRight: 'text',
    iconFrame: 'none',
    iconFrameStyle: 'filled',
    accentuateName: true,
    jobTitlePosition: 'below',
    jobTitleStyle: 'normal',
  },
  layout: {
    selected: 'one',
    detailsPosition: 'top',
    two: { leftWidth: 50, rightWidth: 50, sectionDisplay: 'halfHalf', personalDetails: 'top' },
    sectionOrder: {
      mix: ['profile', 'skill', 'work', 'education', 'language', 'interest', 'project'],
      one: { sectionsSorted: [] },
      two: { leftSectionsSorted: [], rightSectionsSorted: [] },
    },
  },
  heading: { style: 'line', icons: 'none', capitalization: 'uppercase' },
  spacing: { fontSize: '3', lineHeight: '3', spacingFactor: '3', marginVertical: '3', marginHorizontal: '3', nameFontSizePt: 24, jobTitleFontSizePt: 18 },
  skill: {
    selected: 'text',
    grid: { columns: 'two', splitCommasIntoBullets: false },
    text: 'bullet',
    level: { selected: 'dots' },
  },
  language: {
    selected: 'text',
    grid: { columns: 'two', splitCommasIntoBullets: false },
    text: 'bullet',
    level: { selected: 'dots' },
  },
  interest: {
    selected: 'text',
    grid: { columns: 'two', splitCommasIntoBullets: false },
    text: 'comma',
    level: { selected: 'dots' },
  },
  certificate: {
    selected: 'text',
    grid: { columns: 'two', splitCommasIntoBullets: false },
    text: 'bullet',
    level: { selected: 'dots' },
  },
  entryLayout: {
    displayMode: 'dateLocationRight',
    dateStyle: 'normal',
    locationStyle: 'normal',
    subtitleStyle: 'normal',
    bodyIndentation: '0',
    dateLocationOrder: 'dateLocation',
  },
  regional: { pageFormat: 'A4', dateDisplay: 'MM/YYYY', monthFormat: 'MM', dateDelimiter: '/' },
  workDisplay: { jobTitleBeforeEmployer: true },
  educationDisplay: { degreeBeforeSchool: true },
  applyAccentColor: {
    name: true,
    dates: true,
    icons: false,
    headings: false,
    jobTitle: true,
  },
  expert: { footer: { name: false, email: false, pages: false } },
  advanced: { linkIcon: 'boxArrow' },
}

export function defaultContent(): Content {
  const profile = { id: uid(), sectionType: 'profile' as SectionType }
  const work = { id: uid(), sectionType: 'work' as SectionType }
  const education = { id: uid(), sectionType: 'education' as SectionType }
  const skill = { id: uid(), sectionType: 'skill' as SectionType }
  return {
    [profile.id]: { ...profile, displayName: 'Profile', iconKey: 'user', entries: [defaultEntry('profile') as unknown as AnyEntry] },
    [work.id]: { ...work, displayName: 'Work Experience', iconKey: 'briefcase', entries: [] },
    [education.id]: { ...education, displayName: 'Education', iconKey: 'graduation', entries: [] },
    [skill.id]: { ...skill, displayName: 'Skills', iconKey: 'code', entries: [] },
  }
}
