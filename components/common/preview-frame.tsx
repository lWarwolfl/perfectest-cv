'use client'

import { useEffect, useRef, useState } from 'react'
import { pageDims } from '@/lib/page'

const A4_WIDTH_PX = 794
const MM_TO_PX = A4_WIDTH_PX / 210

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
      className="preview-light border-border relative w-full overflow-hidden rounded-lg border bg-white"
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
          className="absolute top-0 left-0"
        >
          {children}
        </div>
      )}
    </div>
  )
}
