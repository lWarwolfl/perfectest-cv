// Shared Google-font catalog: drives the editor picker (CSS vars from next/font),
// the live preview (fontCss) and the server-side PDF generator (pdfFont).

export const FONTS = [
  { group: 'Sans-Serif', value: 'Inter' },
  { group: 'Sans-Serif', value: 'Roboto' },
  { group: 'Sans-Serif', value: 'Open Sans' },
  { group: 'Sans-Serif', value: 'Lato' },
  { group: 'Sans-Serif', value: 'Montserrat' },
  { group: 'Sans-Serif', value: 'Poppins' },
  { group: 'Sans-Serif', value: 'Nunito Sans' },
  { group: 'Sans-Serif', value: 'Source Sans 3' },
  { group: 'Sans-Serif', value: 'Plus Jakarta Sans' },
  { group: 'Sans-Serif', value: 'Rubik' },
  { group: 'Sans-Serif', value: 'Work Sans' },
  { group: 'Sans-Serif', value: 'DM Sans' },
  { group: 'Serif', value: 'Lora' },
  { group: 'Serif', value: 'Merriweather' },
  { group: 'Serif', value: 'Playfair Display' },
  { group: 'Serif', value: 'EB Garamond' },
  { group: 'Serif', value: 'Source Serif 4' },
  { group: 'Serif', value: 'PT Serif' },
  { group: 'Serif', value: 'Libre Baskerville' },
  { group: 'Serif', value: 'Crimson Pro' },
  { group: 'Monospace', value: 'JetBrains Mono' },
  { group: 'Monospace', value: 'IBM Plex Mono' },
  { group: 'Monospace', value: 'Roboto Mono' },
  { group: 'Monospace', value: 'Geist Mono' },
] as const

export const FONT_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts'

export const PDF_FONT_FALLBACK = 'Helvetica'

export function fontSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

/** CSS font-family for a customization.font.fontFamily value.
 *  Vars are defined in app/layout.tsx via next/font/google (works on any host). */
export function fontCss(name?: string | null) {
  const family = name || 'Inter'
  return `var(--font-${fontSlug(family)}), ${family}, sans-serif`
}
