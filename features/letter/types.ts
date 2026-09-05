import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization } from '@/features/resume/types'

export interface LetterDesign {
  customization: Customization
  letterDateDisplay?: { position: 'left' | 'right' | 'center' }
  syncedFromResume?: boolean
}

export const EMPTY_LETTER_DESIGN: LetterDesign = {
  customization: DEFAULT_CUSTOMIZATION,
  letterDateDisplay: { position: 'left' },
}

type LegacyDesign = Partial<LetterDesign> & {
  senderDisplay?: { style?: string }
  fontFamily?: string
  fontSizePt?: number
  lineHeightPct?: number
  nameFontSizePt?: number
  jobTitleFontSizePt?: number
  verticalMarginMm?: number
  horizontalMarginMm?: number
  headerSettings?: Customization['header']
  colors?: { basic?: { single?: string } }
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export function mergeCustomization(saved?: Partial<Customization> | null): Customization {
  const out = { ...DEFAULT_CUSTOMIZATION } as unknown as Record<string, unknown>
  if (!saved) return out as unknown as Customization
  for (const key of Object.keys(DEFAULT_CUSTOMIZATION) as (keyof Customization)[]) {
    const value = saved[key] as unknown
    const base = DEFAULT_CUSTOMIZATION[key] as unknown
    if (base && typeof base === 'object' && !Array.isArray(base) && value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = { ...(base as Record<string, unknown>), ...(value as Record<string, unknown>) }
    } else if (value !== undefined && value !== null) {
      out[key] = value
    }
  }
  return out as unknown as Customization
}

export function normalizeLetterDesign(saved?: LetterDesign | LegacyDesign | null): LetterDesign {
  const base: LetterDesign = {
    ...EMPTY_LETTER_DESIGN,
    letterDateDisplay: { ...(EMPTY_LETTER_DESIGN.letterDateDisplay || { position: 'left' }) },
  }
  if (!saved) return base
  const s = saved as Partial<LetterDesign> & LegacyDesign
  const out: LetterDesign = {
    ...base,
    ...(s.letterDateDisplay?.position ? { letterDateDisplay: { position: s.letterDateDisplay.position } } : {}),
    ...(s.syncedFromResume ? { syncedFromResume: true } : {}),
  }
  if (s.customization) {
    out.customization = mergeCustomization(s.customization)
    return out
  }
  const c = mergeCustomization(null)
  if (s.fontFamily) c.font = { ...c.font, fontFamily: s.fontFamily, selected: 'custom' }
  if (s.fontSizePt !== undefined) c.spacing = { ...c.spacing, fontSize: String(clamp(s.fontSizePt - 10, 0, 8)) }
  if (s.lineHeightPct !== undefined) c.spacing = { ...c.spacing, lineHeight: String(clamp(Math.round((s.lineHeightPct - 1.2) * 10), 1, 5)) }
  if (s.nameFontSizePt !== undefined) c.spacing = { ...c.spacing, nameFontSizePt: s.nameFontSizePt }
  if (s.jobTitleFontSizePt !== undefined) c.spacing = { ...c.spacing, jobTitleFontSizePt: s.jobTitleFontSizePt }
  if (s.verticalMarginMm !== undefined) c.spacing = { ...c.spacing, marginVertical: String(clamp(Math.round((s.verticalMarginMm - 10) / 3), 0, 6)) }
  if (s.horizontalMarginMm !== undefined) c.spacing = { ...c.spacing, marginHorizontal: String(clamp(Math.round((s.horizontalMarginMm - 10) / 3), 0, 6)) }
  if (s.headerSettings) c.header = { ...c.header, ...s.headerSettings }
  if (s.colors?.basic?.single) c.colors = { ...c.colors, basic: { ...c.colors.basic, single: s.colors.basic.single } }
  out.customization = c
  return out
}
