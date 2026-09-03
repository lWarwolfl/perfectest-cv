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

export interface DateObject {
  hide: boolean
  year: string
  month: string
  ongoing: boolean
  onlyYear: boolean
  customOngoingWord: string
}

export interface BaseEntry {
  id: string
  isNewEntry?: boolean
  isHidden?: boolean
}

export interface WorkEntry extends BaseEntry {
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

export interface EducationEntry extends BaseEntry {
  degree: string
  school: string
  schoolLink: string
  location: string
  startDate: DateObject
  endDate: DateObject
}

export interface SkillEntry extends BaseEntry {
  skill: string
  level: string
  infoHtml: string
}

export interface LanguageEntry extends BaseEntry {
  language: string
  level: string
  infoHtml: string
}

export interface InterestEntry extends BaseEntry {
  interest: string
  interestLink: string
  infoHtml: string
}

export interface ProfileEntry extends BaseEntry {
  text: string
}

export interface ProjectEntry extends BaseEntry {
  projectTitle: string
  projectTitleLink: string
  subTitle: string
  description: string
}

export interface CertificateEntry extends BaseEntry {
  title: string
  link: string
  issuer: string
  location: string
  date: string
}

export interface CustomEntry extends BaseEntry {
  title: string
  subTitle: string
  description: string
}

export interface GenericEntry extends BaseEntry {
  title: string
  link: string
  issuer: string
  location: string
  date: string
  description: string
}

export type AnyEntry =
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

export interface Section {
  id: string
  entries: AnyEntry[]
  iconKey: string
  displayName: string
  sectionType: SectionType
}

export type Content = Record<string, Section>

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
  iconFrame: 'none' | 'circle' | 'square' | 'rounded'
  iconFrameStyle: 'filled' | 'outline'
  accentuateName: boolean
  jobTitlePosition: 'sameLine' | 'below'
  jobTitleStyle: 'normal' | 'italic'
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
  icons: 'none' | 'filled' | 'outline'
  capitalization: 'uppercase' | 'capitalize'
}

export interface SpacingCustomization {
  fontSize: string
  lineHeight: string
  spacingFactor: string
  marginVertical: string
  marginHorizontal: string
  nameFontSizePt: number
  jobTitleFontSizePt: number
}

export interface SectionDisplay {
  selected: 'grid' | 'text' | 'level' | 'bubble'
  grid: { columns: 'one' | 'two' | 'three' | 'four'; splitCommasIntoBullets: boolean }
  text: 'bullet' | 'pipe' | 'wrap' | 'comma'
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

export interface Customization {
  font: FontCustomization
  colors: ColorCustomization
  border: BorderCustomization
  header: HeaderCustomization
  layout: LayoutCustomization
  heading: HeadingCustomization
  spacing: SpacingCustomization
  skill: SectionDisplay
  language: SectionDisplay
  interest: SectionDisplay
  certificate: SectionDisplay
  entryLayout: EntryLayoutCustomization
  regional: RegionalCustomization
  workDisplay: { jobTitleBeforeEmployer: boolean }
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
