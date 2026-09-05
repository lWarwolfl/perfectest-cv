import type { Customization, PersonalDetails } from '@/features/resume/types'
import type { LetterDesign } from '@/features/letter/types'
import { mergeCustomization } from '@/features/letter/types'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'

export interface TemplatePreset {
  id: string
  name: string
  description: string
  tags: string[]
  customization: Customization
  personalDetails?: PersonalDetails
}

function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x))
}

export const RESUME_TEMPLATES: TemplatePreset[] = [
  {
    id: 'classic-clear',
    name: 'Classic Clear',
    description: 'Clean, traditional layout with a blue accent and serif body font',
    tags: ['simple', 'classic', 'professional'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'serif', fontFamily: 'Source Sans Pro' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#044cb5', multi: { textColor: '#000', accentColor: '#002e71', backgroundColor: '#f3f3f3' }, selected: 'single' } },
      heading: { style: 'line', icons: 'none', capitalization: 'uppercase' },
    },
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    description: 'Two-column layout with a dark left panel and light right panel',
    tags: ['modern', 'creative'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'sans', fontFamily: 'Inter' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#1e293b', multi: { textColor: '#ffffff', accentColor: '#1e293b', backgroundColor: '#1e293b' }, selected: 'multi' } },
      layout: { ...deepClone(DEFAULT_CUSTOMIZATION.layout), selected: 'two', detailsPosition: 'left', two: { leftWidth: 33, rightWidth: 67, sectionDisplay: 'halfHalf', personalDetails: 'top' } },
      header: { ...deepClone(DEFAULT_CUSTOMIZATION.header), position: 'left', detailsArrangement: 'column', detailsDisplayLeftRight: 'icon', iconFrame: 'circle', iconFrameStyle: 'filled' },
      heading: { style: 'thinLine', icons: 'filled', capitalization: 'uppercase' },
    },
  },
  {
    id: 'mercury-flow',
    name: 'Mercury Flow',
    description: 'Clean single-column with a bold accent line at the top',
    tags: ['simple', 'modern'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'sans', fontFamily: 'Nunito' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#0891b2', multi: { textColor: '#0f172a', accentColor: '#0891b2', backgroundColor: '#f8fafc' }, selected: 'single' } },
      border: { width: { line: 'l', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      heading: { style: 'underline', icons: 'none', capitalization: 'uppercase' },
      header: { ...deepClone(DEFAULT_CUSTOMIZATION.header), position: 'top', photoPositionHeaderOnTop: 'right', accentuateName: true },
    },
  },
  {
    id: 'saffron-line',
    name: 'Saffron Line',
    description: 'Warm color palette with orange accent and subtle borders',
    tags: ['creative', 'modern'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'sans', fontFamily: 'Mulish' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#ea580c', multi: { textColor: '#1c1917', accentColor: '#ea580c', backgroundColor: '#fff7ed' }, selected: 'single' } },
      heading: { style: 'thickShortUnderline', icons: 'outline', capitalization: 'capitalize' },
      border: { width: { line: 'm', image: 'm', filled: 'm' }, selectedStyle: 'line' },
    },
  },
  {
    id: 'cobalt-edge',
    name: 'Cobalt Edge',
    description: 'Dark navy header with white text, single-column for impact',
    tags: ['modern', 'professional'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'sans', fontFamily: 'Inter' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#1e3a5f', multi: { textColor: '#1e3a5f', accentColor: '#1e3a5f', backgroundColor: '#ffffff' }, selected: 'single' } },
      header: { ...deepClone(DEFAULT_CUSTOMIZATION.header), position: 'top', photo: { show: false, size: 'm', grayscale: false, shape: 'round' }, detailsArrangement: 'wrap', iconFrame: 'rounded', iconFrameStyle: 'outline' },
      heading: { style: 'box', icons: 'filled', capitalization: 'uppercase' },
    },
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    description: 'Calm green tones with a clean, modern two-column layout',
    tags: ['modern', 'simple'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'serif', fontFamily: 'Crimson Pro' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#4a7c59', multi: { textColor: '#1a2e1d', accentColor: '#4a7c59', backgroundColor: '#f0f7f0' }, selected: 'multi' } },
      layout: { ...deepClone(DEFAULT_CUSTOMIZATION.layout), selected: 'two', detailsPosition: 'left', two: { leftWidth: 35, rightWidth: 65, sectionDisplay: 'halfHalf', personalDetails: 'top' } },
      header: { ...deepClone(DEFAULT_CUSTOMIZATION.header), position: 'left', detailsArrangement: 'column', photo: { show: true, size: 'm', grayscale: false, shape: 'round' }, iconFrame: 'rounded', iconFrameStyle: 'filled' },
      heading: { style: 'thinLine', icons: 'none', capitalization: 'uppercase' },
    },
  },
  {
    id: 'steel-grey',
    name: 'Steel Grey',
    description: 'Monochromatic palette with clean typography and subtle borders',
    tags: ['simple', 'professional'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'sans', fontFamily: 'Jost' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#475569', multi: { textColor: '#0f172a', accentColor: '#475569', backgroundColor: '#f1f5f9' }, selected: 'single' } },
      border: { width: { line: 's', image: 'm', filled: 'm' }, selectedStyle: 'line' },
      spacing: { fontSize: '4', lineHeight: '4', spacingFactor: '3', marginVertical: '4', marginHorizontal: '3', headingGap: '3', nameFontSizePt: 24, jobTitleFontSizePt: 18 },
    },
  },
  {
    id: 'editorial-rule',
    name: 'Editorial Rule',
    description: 'Bold header with double-line rule, serif body, clean one-column',
    tags: ['creative', 'classic'],
    customization: {
      ...deepClone(DEFAULT_CUSTOMIZATION),
      font: { selected: 'serif', fontFamily: 'Zilla Slab' },
      colors: { ...deepClone(DEFAULT_CUSTOMIZATION.colors), basic: { ...deepClone(DEFAULT_CUSTOMIZATION.colors.basic), single: '#b91c1c', multi: { textColor: '#1c1917', accentColor: '#b91c1c', backgroundColor: '#fef2f2' }, selected: 'single' } },
      heading: { style: 'topBottomLine', icons: 'outline', capitalization: 'uppercase' },
      header: { ...deepClone(DEFAULT_CUSTOMIZATION.header), position: 'top', photo: { show: true, size: 'l', grayscale: false, shape: 'round' }, photoPositionHeaderOnTop: 'center', alignText: 'center', accentuateName: true },
      border: { width: { line: 'm', image: 'm', filled: 'm' }, selectedStyle: 'none' },
    },
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
        font: { selected: 'custom', fontFamily: 'Source Sans Pro' },
        colors: { ...DEFAULT_CUSTOMIZATION.colors, mode: 'basic', basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#044cb5' } },
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
        colors: { ...DEFAULT_CUSTOMIZATION.colors, mode: 'basic', basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#0891b2' } },
        spacing: { fontSize: '1', lineHeight: '3', spacingFactor: '3', marginVertical: '3', marginHorizontal: '3', headingGap: '3', nameFontSizePt: 25, jobTitleFontSizePt: 19 },
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
        font: { selected: 'custom', fontFamily: 'Nunito' },
        colors: { ...DEFAULT_CUSTOMIZATION.colors, mode: 'basic', basic: { ...DEFAULT_CUSTOMIZATION.colors.basic, single: '#475569' } },
        spacing: { fontSize: '1', lineHeight: '2', spacingFactor: '3', marginVertical: '5', marginHorizontal: '4', headingGap: '3', nameFontSizePt: 24, jobTitleFontSizePt: 18 },
      }),
      letterDateDisplay: { position: 'center' },
    },
  },
]