import type { TResumeEntry, TResumeSection } from '@/drizzle/schema'

export type EntryData =
  | WorkEntry
  | EducationEntry
  | SkillEntry
  | LanguageEntry
  | InterestEntry
  | ProfileEntry
  | ProjectEntry
  | CertificateEntry
  | CustomEntry
  | GenericEntry
  | ReferenceEntry
  | DeclarationEntry

export interface DateObject {
  hide: boolean
  year: string
  month: string
  ongoing: boolean
  onlyYear: boolean
  customOngoingWord: string
}

export interface WorkEntry {
  type: 'work'
  jobTitle: string
  employer: string
  employerLink: string
  location: string
  city: string
  country: string
  startDate: DateObject
  endDate: DateObject
  description: string
}

export interface EducationEntry {
  type: 'education'
  degree: string
  school: string
  schoolLink: string
  location: string
  startDate: DateObject
  endDate: DateObject
  description: string
}

export interface SkillEntry {
  type: 'skill'
  skill: string
  level: string
  infoHtml: string
}

export interface LanguageEntry {
  type: 'language'
  language: string
  level: string
  infoHtml: string
}

export interface InterestEntry {
  type: 'interest'
  interest: string
  interestLink: string
  infoHtml: string
}

export interface ProfileEntry {
  type: 'profile'
  text: string
}

export interface ProjectEntry {
  type: 'project'
  projectTitle: string
  projectTitleLink: string
  subTitle: string
  startDate: DateObject
  endDate: DateObject
  description: string
}

export interface CertificateEntry {
  type: 'certificate'
  title: string
  link: string
  issuer: string
  location: string
  date: string
}

export interface CustomEntry {
  type: 'custom'
  title: string
  subTitle: string
  description: string
}

export interface GenericEntry {
  type: 'publication' | 'organisation' | 'course' | 'award'
  title: string
  link: string
  issuer: string
  location: string
  date: string
  description: string
}

export interface ReferenceEntry {
  type: 'reference'
  name: string
  contact: string
}

export interface DeclarationEntry {
  type: 'declaration'
  text: string
}

export type SectionType =
  | 'profile'
  | 'work'
  | 'education'
  | 'skill'
  | 'language'
  | 'interest'
  | 'project'
  | 'certificate'
  | 'publication'
  | 'organisation'
  | 'course'
  | 'award'
  | 'reference'
  | 'declaration'
  | 'custom'

export type TEntry = Omit<TResumeEntry, 'data'> & {
  data: EntryData
  _dirty?: boolean
}

export type TSection = Omit<TResumeSection, 'entries'> & { entries: TEntry[] }

export type LetterDateMode = 'current' | 'custom'

export interface LetterSender {
  name: string
  jobTitle: string
  email: string
  phone: string
  address: string
  website: string
  linkedIn: string
  gitHub: string
}

export interface LetterRecipient {
  name: string
  position: string
  company: string
  address: string
}

export interface LetterSignature {
  name: string
  place: string
  date: string
  imageId: string
}

export interface FontCustomization {
  selected: string
  fontFamily: string
}

export interface ColorCustomization {
  mode: 'basic' | 'advanced' | 'border'
  basic: {
    single: string
    multi: { textColor: string; accentColor: string; backgroundColor: string }
    selected: 'single' | 'multi' | 'image'
    singleCustom: string
    multiCustom: { textColor: string; accentColor: string; backgroundColor: string }
  }
  advanced: {
    selected: 'single' | 'multi'
    single: string
    multi: {
      light: { textColor: string; accentColor: string; backgroundColor: string }
      strong: { textColor: string; accentColor: string; backgroundColor: string }
    }
    singleCustom: string
    multiCustom: {
      light: { textColor: string; accentColor: string; backgroundColor: string }
      strong: { textColor: string; accentColor: string; backgroundColor: string }
    }
  }
}

export interface BorderCustomization {
  width: { line: string; image: string; filled: string }
  selectedStyle: 'none' | 'line' | 'filled' | 'image'
}

export interface HeaderCustomization {
  position: 'top' | 'left' | 'right' | 'center'
  alignText: 'start' | 'center'
  photo: { show: boolean; size: string; grayscale: boolean; shape: 'round' | 'square' | 'squareRounded' | 'portrait' }
  photoPositionHeaderOnTop: 'right' | 'center' | 'left'
  photoPositionHeaderInColumn: 'below' | 'top'
  detailsArrangement: 'wrap' | 'grid' | 'column'
  detailsDisplayCenter: 'icon' | 'text' | 'none'
  detailsDisplayLeftRight: 'icon' | 'text' | 'none'
  detailsSeparator: 'icon' | 'bullet' | 'bar'
  iconStyle: 'outline' | 'filled-circle' | 'soft-badge' | 'neutral-gray' | 'primary-accent'
  iconFrame: 'none' | 'circle' | 'square' | 'rounded'
  iconFrameStyle: 'filled' | 'outline'
  accentuateName: boolean
  nameStyle: 'regular' | 'bold'
  jobTitlePosition: 'sameLine' | 'below'
  jobTitleStyle: 'normal' | 'italic'
}

export interface LinkCustomization {
  underline: boolean
  blueColor: boolean
  icon: boolean
  iconType: 'link' | 'external'
  headerOverrides: { email: boolean; phone: boolean; website: boolean; linkedIn: boolean; github: boolean }
}

export interface LayoutCustomization {
  selected: 'one' | 'two' | 'mix'
  detailsPosition: 'top' | 'left' | 'right'
  two: { leftWidth: number; rightWidth: number; sectionDisplay: string; personalDetails: string }
  sectionOrder: {
    mix: string[]
    one: { sectionsSorted: string[] }
    two: { leftSectionsSorted: string[]; rightSectionsSorted: string[] }
  }
}

export interface HeadingCustomization {
  style:
    | 'line'
    | 'box'
    | 'thickShortUnderline'
    | 'simple'
    | 'topBottomLine'
    | 'thinLine'
    | 'underline'
    | 'zigZagLine'
    | 'dottedLine'
    | 'plain'
  icons: 'none' | 'filled' | 'outline'
  capitalization: 'uppercase' | 'capitalize'
}

export type HeadingStyle = HeadingCustomization['style']

export interface SectionHeadings {
  [sectionId: string]: { style?: HeadingStyle; showTitle?: boolean }
}

export interface SpacingCustomization {
  fontSize: string
  lineHeight: string
  spacingFactor: string
  marginVertical: string
  marginHorizontal: string
  headingGap: string
  nameFontSizePt: number
  jobTitleFontSizePt: number
}

export interface SectionDisplay {
  selected: 'grid' | 'rows' | 'compact' | 'bubble' | 'level'
  grid: { columns: 1 | 2 | 3 | 4; splitCommasIntoBullets: boolean }
  text: 'bullet' | 'pipe' | 'wrap' | 'comma'
  rows: { spacing: 'tight' | 'spacious'; bullets: boolean }
  subinfo: 'colon' | 'dash' | 'bracket'
  level: { selected: 'dots' | 'bar' }
}

export interface EntryLayoutCustomization {
  displayMode: 'dateLocationRight' | 'dateLocationLeft' | 'fullWidth' | 'dateContentLocation'
  dateStyle: string
  locationStyle: string
  subtitleStyle: string
  bodyIndentation: string
  dateLocationOrder: 'dateLocation' | 'locationDate'
}

export interface RegionalCustomization {
  pageFormat: 'A4' | 'US Letter'
  dateDisplay: string
  monthFormat: 'MM' | 'MMM' | 'MMMM'
  dateDelimiter: '/' | '-'
}

export interface PhotoPositionCustomization {
  show: boolean
  grayscale: boolean
  position: 'left' | 'top' | 'right'
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
  shape: 'circle' | 'square' | 'rounded-sm' | 'rounded-md' | 'rounded-lg'
}

export interface Customization {
  font: FontCustomization
  colors: ColorCustomization
  border: BorderCustomization
  header: HeaderCustomization
  links: LinkCustomization
  photoPosition: PhotoPositionCustomization
  layout: LayoutCustomization
  heading: HeadingCustomization
  spacing: SpacingCustomization
  skill: SectionDisplay
  language: SectionDisplay
  interest: SectionDisplay
  certificate: SectionDisplay
  entryLayout: EntryLayoutCustomization
  regional: RegionalCustomization
  sectionHeadings: SectionHeadings
  workDisplay: { jobTitleBeforeEmployer: boolean; groupPromotions: boolean }
  fileName: string
  educationDisplay: { degreeBeforeSchool: boolean }
  applyAccentColor: {
    name: boolean
    dates: boolean
    icons: boolean
    headings: boolean
    jobTitle: boolean
  }
  expert: { footer: { name: boolean; email: boolean; pages: boolean } }
  advanced: { linkIcon: 'boxArrow' | 'diagonalChain' | 'none' }
}

export interface PersonalDetails {
  fullName: string
  jobTitle: string
  displayEmail: string
  phone: string
  address: string
  website: string
  websiteLink: string
  social: {
    github: { link: string; display: string }
    linkedIn: { link: string; display: string }
  }
  detailsOrder: string[]
  photo: {
    xPct: number
    yPct: number
    shape: 'round' | 'square' | 'squareRounded' | 'portrait'
    imageId: string
    fileId?: string
    widthPct: number
    heightPct: number
    originalWidth: number
    originalHeight: number
  }
  birthday: { day: string; year: string; month: string }
  age: string
  gender: string
  nationality: string
  visa: string
  military: string
  passport: string
  maritalStatus: string
  drivingLicense: string
  dateOfBirth: string
  passportId: string
  availability: string
}
