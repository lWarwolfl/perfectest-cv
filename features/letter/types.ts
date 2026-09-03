export interface LetterDesign {
  fontFamily: string
  fontSizePt: number
  lineHeightPct: number
  nameFontSizePt?: number
  jobTitleFontSizePt?: number
  colors: {
    mode: 'basic' | 'advanced' | 'border'
    basic: {
      single: string
      multi: { textColor: string; accentColor: string; backgroundColor: string }
      selected: 'single' | 'multi'
    }
  }
  senderDisplay: {
    style: 'classicSender' | 'modernHeader' | 'centered'
    classic?: { blockOrder: string[]; senderAlignment: string; recipientAlignment?: string; showDivider?: boolean; dateAlignment?: string; fullNameBold?: boolean }
    header?: Record<string, unknown>
  }
  letterDateDisplay?: { position: 'left' | 'right' | 'center' }
  declarationDisplay?: { line: string; position: string; showHeading: boolean }
  verticalMarginMm: number
  horizontalMarginMm: number
  syncedFromResume?: boolean
}

export const EMPTY_LETTER_DESIGN: LetterDesign = {
  fontFamily: 'Inter',
  fontSizePt: 11,
  lineHeightPct: 1.4,
  nameFontSizePt: 24,
  jobTitleFontSizePt: 18,
  colors: {
    mode: 'basic',
    basic: {
      single: '#044cb5',
      multi: { textColor: '#000', accentColor: '#002e71', backgroundColor: '#f3f3f3' },
      selected: 'single',
    },
  },
  senderDisplay: { style: 'classicSender', classic: { blockOrder: ['sender', 'date', 'recipient'], senderAlignment: 'left' } },
  letterDateDisplay: { position: 'left' },
  declarationDisplay: { line: 'none', position: 'left', showHeading: true },
  verticalMarginMm: 12,
  horizontalMarginMm: 10,
}
