export const PAGE_DIMS_MM = {
  A4: { w: 210, h: 297 },
  'US Letter': { w: 215.9, h: 279.4 },
} as const

export function pageDims(pageFormat: 'A4' | 'US Letter' | undefined) {
  const p = PAGE_DIMS_MM[pageFormat === 'US Letter' ? 'US Letter' : 'A4']
  return { widthMm: p.w, heightMm: p.h }
}
