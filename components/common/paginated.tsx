'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Item-aware pagination: slices a fixed page-size document into N stacked page
 * boxes. The indivisible unit is the marked item ([data-pb-item] — a whole
 * entry/row) or, unmarked, an element with no block-level descendant (a
 * paragraph). Unit spans are margin-aware (margin-top/bottom included), so a
 * cut never leaves content flush with the page edges. [data-pb-head] elements
 * (section titles) are glued to the following unit — a heading never sits
 * alone at a page bottom. An item that doesn't fit the remaining page moves
 * whole to the next page; only an item taller than a full page gets sliced.
 * Every page re-renders the full body shifted to its cut offset, so margins
 * and column layout repeat on every page; multi-column bodies mark each
 * column [data-pb-col] so columns paginate independently at a shared page
 * count. The same boxes print as-is (@page is sized to the box, inline).
 */

const BLOCK = new Set([
  'DIV', 'P', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'SECTION', 'ARTICLE',
  'HEADER', 'FOOTER', 'BLOCKQUOTE', 'FIGURE', 'PRE', 'HR', 'FORM', 'DETAILS',
])

export interface Atom {
  // margin box, relative to the measured root's content start
  pre: number // top edge incl. margin-top
  post: number // bottom edge incl. margin-bottom
}

/** Elements with no block-level descendant are unbreakable runs. */
function makeAtomicChecker() {
  const cache = new Map<Element, boolean>()
  const check = (el: Element): boolean => {
    let r = true
    for (const c of el.children) {
      if (BLOCK.has(c.tagName)) {
        r = false
        break
      }
      let v = cache.get(c)
      if (v === undefined) {
        v = check(c)
        cache.set(c, v)
      }
      if (!v) {
        r = false
        break
      }
    }
    return r
  }
  return check
}

function topWithin(el: HTMLElement, root: Element): number {
  // rect math, not offsetTop walking: the root may not be in the offsetParent
  // chain (unpositioned ancestor), which silently corrupts every coordinate
  return Math.round(el.getBoundingClientRect().top - root.getBoundingClientRect().top)
}

/** cumulative scale from transforms between el's ancestors and the viewport */
function pageScale(el: Element): number {
  let k = 1
  for (let a: HTMLElement | null = el as HTMLElement; a; a = a.parentElement) {
    const t = getComputedStyle(a).transform
    if (t && t !== 'none') k *= new DOMMatrixReadOnly(t).a
  }
  return k
}

interface Raw {
  el: HTMLElement
  top: number
  h: number
  mT: number
  mB: number
  head: boolean
}

const postOf = (r: Raw) => r.top + r.h + r.mB

function margins(el: HTMLElement) {
  const cs = getComputedStyle(el)
  return {
    mT: parseFloat(cs.marginTop) || 0,
    mB: parseFloat(cs.marginBottom) || 0,
  }
}

/** Collect unbreakable units inside `root`; margin boxes relative to `origin`. */
function measureUnits(
  root: HTMLElement,
  wrap: HTMLElement,
  origin: number,
  cap: number,
  k: number
): Atom[] {
  const atomic = makeAtomicChecker()
  const raw: Raw[] = []
  // marked items are the indivisible units — outermost marking wins.
  // rect reads are viewport px; k compensates any ancestor transform (fit
  // mode) so all spans end up in unscaled layout px. margins()/padding are
  // computed style = layout px already — do NOT scale them.
  root.querySelectorAll<HTMLElement>('[data-pb-item]').forEach((el) => {
    if (el.closest('[data-pb-item]') !== el) return
    // getBoundingClientRect, not offsetHeight — offsetHeight is undefined on SVG
    const hb = el.getBoundingClientRect().height * k
    if (!(hb > 0)) return
    const m = margins(el)
    raw.push({ el, top: (topWithin(el, wrap) - origin) * k, h: hb, mT: m.mT, mB: m.mB, head: false })
  })
  // atomic leaves outside any marked item (paragraphs, rows, section titles)
  root.querySelectorAll('*').forEach((n) => {
    if (!(n instanceof HTMLElement) && !(n instanceof SVGElement)) return
    const el = n as HTMLElement
    if (el.closest('[data-pb-item]')) return
    const hb = el.getBoundingClientRect().height * k
    if (!(hb > 0) || !atomic(el)) return
    const m = margins(el)
    raw.push({
      el,
      top: (topWithin(el, wrap) - origin) * k,
      h: hb,
      mT: m.mT,
      mB: m.mB,
      head: el.hasAttribute('data-pb-head'),
    })
  })
  raw.sort((a, b) => a.top - b.top)
  // glue each section title to the unit that follows it (when both fit a page)
  const glued: Raw[] = []
  for (let i = 0; i < raw.length; i++) {
    const u = raw[i]
    const next = raw[i + 1]
    if (u.head && next && postOf(next) - u.top <= cap) {
      u.h = next.top + next.h - u.top + next.mB
      u.mB = next.mB
      raw.splice(i + 1, 1)
    }
    glued.push(u)
  }
  return glued.map((u) => ({ pre: u.top - u.mT, post: postOf(u) }))
}

/**
 * Greedy page cuts at unit boundaries. A unit straddling the page limit moves
 * whole to the next page (cut at its top) — unless it alone exceeds a full
 * page, then the cut is forced through it.
 */
export function computeCuts(units: Atom[], cap: number, total: number): number[] {
  cap = Math.max(50, cap)
  const fits = (u: Atom) => u.post - u.pre <= cap
  const blocked = (c: number) =>
    units.some((u) => fits(u) && u.pre < c - 1 && u.post > c + 1)
  const cuts = [0]
  let start = 0
  while (start + cap < total && cuts.length < 100) {
    const maxCut = start + cap
    let best = 0
    const consider = (c: number) => {
      c = Math.round(c)
      if (c <= start + 1 || c > maxCut || c <= best || blocked(c)) return
      best = c
    }
    consider(maxCut)
    for (const u of units) {
      consider(u.pre)
      consider(u.post)
    }
    cuts.push(best > start ? best : maxCut)
    start = cuts[cuts.length - 1]
  }
  return cuts
}

export function Paginated({
  width,
  height,
  fit = false,
  children,
}: {
  width: number
  height: number
  fit?: boolean
  children: React.ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const [cuts, setCuts] = useState<number[][]>([[0]])
  const [scale, setScale] = useState(fit ? 0 : 1)

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    const body = wrap?.firstElementChild as HTMLElement | null
    if (!wrap || !body) return
    // geometry must be read in unscaled px — compensate any ancestor transform
    // (fit mode scales the whole document); k = 1 when no transform is applied
    const k = 1 / (pageScale(wrap) || 1)
    const cs = getComputedStyle(body)
    const pT = parseFloat(cs.paddingTop) || 0
    const pB = parseFloat(cs.paddingBottom) || 0
    const capN = height - pT - pB
    const cols = Array.from(body.querySelectorAll<HTMLElement>('[data-pb-col]'))
    const run = (root: HTMLElement, origin: number) => {
      const units = measureUnits(root, wrap, origin, capN, k)
      const total = units.reduce((m, u) => Math.max(m, u.post), 0)
      return computeCuts(units, capN, total)
    }
    const next = cols.length
      // origin is a screen-px offset (subtracted from rects before the k
      // multiply); body content starts at its scaled padding pT*k
      ? cols.map((col) => run(col, topWithin(col, wrap)))
      : [run(body, pT * k)]
    setCuts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }, [height])

  useEffect(() => {
    measure()
    const wrap = wrapRef.current
    if (!wrap) return
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [measure, children])

  // fit mode: measure() ran at scale 0/1 before the scale settled — re-measure
  // once the scale is live (ResizeObserver on the untransformed wrapper sees
  // nothing change, so this needs its own trigger)
  useEffect(() => {
    if (!fit) return
    measure()
  }, [fit, measure, scale])

  useEffect(() => {
    if (!fit) return
    const el = outerRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fit, width])

  // shift each page copy so its window starts exactly at its cut offset,
  // and clip it there — layout effect so no unshifted frame ever paints
  useLayoutEffect(() => {
    const container = wrapRef.current?.closest('.print-pages')
    if (!container) return
    const pages = Math.max(...cuts.map((c) => c.length))
    const boxes = container.querySelectorAll<HTMLElement>(':scope > .print-page')
    // body padding repeats on every page copy (it is the paper margin); cuts
    // are content-relative, so a copy's window in its local px is
    // [c + pT, next + pT] — anything outside paints the neighbouring page's
    // lines (the overlap/duplication artifact) and must be clipped.
    const first = boxes[0]?.firstElementChild?.firstElementChild as HTMLElement | null
    const cs = first ? getComputedStyle(first) : null
    const kS = first ? pageScale(first) || 1 : 1
    // computed padding & offsetHeight are layout px (transform-independent);
    // only getBoundingClientRect deltas (topWithin) need /kS
    const pT = parseFloat(cs?.paddingTop || '0') || 0
    const pB = parseFloat(cs?.paddingBottom || '0') || 0
    boxes.forEach((box, i) => {
      if (i >= pages) return
      const bodyEl = box.firstElementChild?.firstElementChild as HTMLElement | null
      if (!bodyEl) return
      const cols = Array.from(bodyEl.querySelectorAll<HTMLElement>('[data-pb-col]'))
      const shift = (seq: number[]) => (seq[i] ?? (seq[seq.length - 1] ?? 0) + height)
      // offsetHeight & computed padding are layout px (transforms don't apply);
      // only getBoundingClientRect values (topWithin) need the /kS correction
      const clip = (el: HTMLElement, topLocal: number, bottomLocal: number) => {
        const H = el.offsetHeight
        el.style.clipPath = `inset(${Math.max(0, topLocal)}px 0 ${Math.max(0, H - bottomLocal)}px 0)`
      }
      if (cols.length) {
        cols.forEach((col, j) => {
          const seq = cuts[j] || [0]
          const c = shift(seq)
          // topWithin is a getBoundingClientRect delta → /kS to layout px
          const top = topWithin(col, bodyEl) / kS
          col.style.transform = i === 0 ? '' : `translateY(${-c}px)`
          // window in col-local px: page margins are pT/pB (body padding);
          // content coord y maps to screen top + y - c
          const bottomLocal = height - pB - top + c
          const topLocal = i === 0 ? 0 : c + pT - top
          const next = seq[i + 1]
          clip(col, topLocal, next != null ? Math.min(bottomLocal, next) : bottomLocal)
        })
      } else {
        const seq = cuts[0] || [0]
        const c = shift(seq)
        bodyEl.style.transform = i === 0 ? '' : `translateY(${-c}px)`
        const next = seq[i + 1]
        // bodyEl local y renders at y - c (its top is the page top)
        clip(bodyEl, i === 0 ? 0 : c + pT, next != null ? Math.min(height - pB + c, next + pT) : height - pB + c)
      }
    })
  }, [cuts, height])

  const pages = Math.max(...cuts.map((c) => c.length))
  const totalH = pages * height * scale

  return (
    <div
      ref={outerRef}
      className={fit ? 'w-full' : undefined}
      style={fit ? { height: totalH, opacity: fit && !scale ? 0 : undefined } : undefined}
    >
      <div style={fit ? { width: width * scale, height: totalH, margin: '0 auto' } : undefined}>
        <div
          className="print-pages flex flex-col items-center gap-6 print:gap-0"
          style={fit ? { width, transform: `scale(${scale})`, transformOrigin: 'top left' } : undefined}
        >
          <style>{`@page { size: ${width}px ${height}px; margin: 0 }`}</style>
          {Array.from({ length: pages }, (_, i) => (
            <div
              key={i}
              className="print-page relative overflow-hidden bg-white shadow-md print:shadow-none"
              style={{ width, height }}
            >
              <div
                ref={i === 0 ? wrapRef : undefined}
                className="absolute top-0 left-0"
                style={{ width }}
              >
                {children}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
