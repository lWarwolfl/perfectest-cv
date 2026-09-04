import type {
  Customization,
  EntryData,
  PersonalDetails,
  SectionType,
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
    fileId: '',
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
  dateOfBirth: '',
  passportId: '',
  availability: '',
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

export const SECTION_ICONS: Record<SectionType, string> = {
  profile: 'user',
  work: 'briefcase',
  education: 'graduation',
  skill: 'code',
  language: 'globe',
  interest: 'heart',
  project: 'folder',
  certificate: 'award',
  publication: 'book',
  organisation: 'users',
  course: 'academic',
  award: 'trophy',
  reference: 'quote',
  declaration: 'pen',
  custom: 'star',
}

function emptyDate() {
  return { hide: false, year: '', month: '', ongoing: false, onlyYear: false, customOngoingWord: 'present' }
}

export function defaultEntryData(sectionType: SectionType): EntryData {
  switch (sectionType) {
    case 'work':
      return { type: 'work', jobTitle: '', employer: '', employerLink: '', location: '', city: '', country: '', startDate: emptyDate(), endDate: emptyDate(), description: '' }
    case 'education':
      return { type: 'education', degree: '', school: '', schoolLink: '', location: '', startDate: emptyDate(), endDate: emptyDate(), description: '' }
    case 'skill':
      return { type: 'skill', skill: '', level: '', infoHtml: '' }
    case 'language':
      return { type: 'language', language: '', level: '', infoHtml: '' }
    case 'interest':
      return { type: 'interest', interest: '', interestLink: '', infoHtml: '' }
    case 'profile':
      return { type: 'profile', text: '' }
    case 'project':
      return { type: 'project', projectTitle: '', projectTitleLink: '', subTitle: '', startDate: emptyDate(), endDate: emptyDate(), description: '' }
    case 'certificate':
      return { type: 'certificate', title: '', link: '', issuer: '', location: '', date: '' }
    case 'publication':
    case 'organisation':
    case 'course':
    case 'award':
      return { type: sectionType, title: '', link: '', issuer: '', location: '', date: '', description: '' }
    case 'reference':
      return { type: 'reference', name: '', contact: '' }
    case 'declaration':
      return { type: 'declaration', text: '' }
    default:
      return { type: 'custom', title: '', subTitle: '', description: '' }
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
    nameStyle: 'bold',
    jobTitlePosition: 'below',
    jobTitleStyle: 'normal',
    detailsSeparator: 'icon',
    iconStyle: 'outline',
  },
  links: {
    underline: true,
    blueColor: false,
    icon: false,
    iconType: 'external',
    headerOverrides: { email: false, phone: false, website: false, linkedIn: false, github: false },
  },
  photoPosition: { show: true, grayscale: false, position: 'right', size: 'm', shape: 'circle' },
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
  spacing: { fontSize: '3', lineHeight: '3', spacingFactor: '3', marginVertical: '3', marginHorizontal: '3', headingGap: '3', nameFontSizePt: 24, jobTitleFontSizePt: 18 },
  skill: {
    selected: 'rows',
    grid: { columns: 2, splitCommasIntoBullets: false },
    text: 'bullet',
    rows: { spacing: 'spacious', bullets: false },
    subinfo: 'colon',
    level: { selected: 'dots' },
  },
  language: {
    selected: 'compact',
    grid: { columns: 2, splitCommasIntoBullets: false },
    text: 'bullet',
    rows: { spacing: 'spacious', bullets: false },
    subinfo: 'colon',
    level: { selected: 'dots' },
  },
  interest: {
    selected: 'compact',
    grid: { columns: 2, splitCommasIntoBullets: false },
    text: 'comma',
    rows: { spacing: 'spacious', bullets: false },
    subinfo: 'colon',
    level: { selected: 'dots' },
  },
  certificate: {
    selected: 'rows',
    grid: { columns: 2, splitCommasIntoBullets: false },
    text: 'bullet',
    rows: { spacing: 'spacious', bullets: false },
    subinfo: 'colon',
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
  sectionHeadings: {},
  workDisplay: { jobTitleBeforeEmployer: true, groupPromotions: false },
  fileName: '',
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
