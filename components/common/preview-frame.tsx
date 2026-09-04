'use client'

import { useEffect, useRef, useState } from 'react'

const PAGE_MM = {
  A4: { w: 210, h: 297 },
  'US Letter': { w: 215.9, h: 279.4 },
} as const

// MM_TO_PX converts a real mm page size into the px width the renderer is
// authored at (resume/letter renderers use 794px ≈ A4 at 96dpi), so content
// designed for a full A4 page maps 1:1 onto other paper sizes.
const A4_WIDTH_PX = 794
const MM_TO_PX = A4_WIDTH_PX / 210

export function pageDims(pageFormat: 'A4' | 'US Letter' | undefined) {
  const p = PAGE_MM[pageFormat === 'US Letter' ? 'US Letter' : 'A4']
  return { widthMm: p.w, heightMm: p.h }
}

export function PreviewFrame({
  pageFormat,
  children,
}: {
  pageFormat?: 'A4' | 'US Letter'
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / (pageDims(pageFormat).widthMm * MM_TO_PX))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageFormat])

  const { widthMm, heightMm } = pageDims(pageFormat)
  const innerWidth = widthMm * MM_TO_PX

  return (
    <div
      ref={ref}
      className="preview-light relative w-full overflow-hidden rounded-lg border border-border bg-white"
      style={{ aspectRatio: `${widthMm} / ${heightMm}` }}
    >
      {scale > 0 && (
        <div
          style={{
            width: innerWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
          className="absolute left-0 top-0"
        >
          {children}
        </div>
      )}
    </div>
  )
}
