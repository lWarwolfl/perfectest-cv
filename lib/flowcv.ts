import type {
  DateObject,
  EntryData,
  PersonalDetails,
  SectionType,
} from '@/features/resume/types'

/**
 * Fetches and parses a FlowCV public resume page (https://flowcv.com/resume/<id>).
 * FlowCV public pages are server-rendered static HTML, so a regex parser over the
 * markup is enough — no headless browser needed.
 *
 * ponytail: only profile/work/education/skill/language/project sections are synced;
 * interests/certificates/etc. on the FlowCV side are ignored. Extend FLOWCV_SECTIONS
 * when needed.
 */

export const FLOWCV_URL_PATTERN = /^https:\/\/(www\.)?flowcv\.com\/resume\/[A-Za-z0-9]+\/?$/

const FLOWCV_SECTIONS = ['work', 'skill', 'education', 'language', 'project'] as const

export interface FlowcvEntry {
  title: string
  link: string
  subTitle: string
  dateRaw: string
  location: string
  descriptionHtml: string
}

export interface FlowcvData {
  name: string
  jobTitle: string
  summaryHtml: string
  email: string
  phone: string
  website: string
  websiteDisplay: string
  linkedIn: string
  github: string
  work: FlowcvEntry[]
  education: FlowcvEntry[]
  project: FlowcvEntry[]
  skills: { skill: string; infoHtml: string }[]
  languages: { language: string; level: string }[]
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** FlowCV obfuscates email links as /cdn-cgi/l/email-protection#hex */
function cfDecode(hex: string) {
  try {
    const key = parseInt(hex.slice(0, 2), 16)
    let out = ''
    for (let i = 2; i < hex.length; i += 2) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key)
    }
    return out
  } catch {
    return ''
  }
}

function inlineText(html: string) {
  return decodeEntities(
    html
      .replace(/<[^>]*>/g, '')
      .replace(/[\u200B-\u200F\u2060-\u2064\uFEFF]/g, '')
  )
}

function text(s: string) {
  return inlineText(s).replace(/\s+/g, ' ').trim()
}

/** Preserves the single spaces FlowCV puts at word-span boundaries ("Sugimoto " + "Visa"). */
function joinWords(html: string, re: RegExp) {
  const out: string[] = []
  let m: RegExpExecArray | null
  const r = new RegExp(re.source, 'g')
  while ((m = r.exec(html))) out.push(inlineText(m[1]))
  return out.join('').replace(/\s+/g, ' ').replace(/\s*,\s*$/, '').trim()
}

const ALLOWED_TAGS = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 'br', 'p', 'ul', 'ol', 'li'])

/** Allowlist sanitizer — output ends up in dangerouslySetInnerHTML, so this is a trust boundary. */
export function sanitizeFlowcvHtml(html: string): string {
  let s = html
    .replace(/<\s*(script|style|svg|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|svg|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/<span[^>]*font-size:\s*1px[^>]*>[\s\S]*?<\/span>/gi, '') // hidden bullet glyphs
    .replace(/<wbr\s*\/?>/gi, '')
  // drop disallowed tags, keep their text
  s = s.replace(/<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)[^<>]*>/g, (m, tag: string) =>
    (ALLOWED_TAGS as Set<string>).has(tag.toLowerCase()) ? m : ''
  )
  // rebuild kept tags without attributes; only http(s) href survives on <a>
  s = s.replace(/<([a-zA-Z][a-zA-Z0-9-]*)[^<>]*>/g, (m, tag: string) => {
    const t = tag.toLowerCase()
    if (t === 'a') {
      const href = /href\s*=\s*"([^"]*)"/.exec(m)?.[1] ?? ''
      const safe = /^https?:\/\//.test(href) ? href : ''
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">`
    }
    return `<${t}>`
  })
  return s.trim()
}

function preprocess(raw: string) {
  return raw
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<span[^>]*font-size:\s*1px[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<wbr\s*\/?>/gi, '')
}

function match1(html: string, re: RegExp) {
  const m = re.exec(html)
  return m ? m[1] : ''
}

function descriptionHtml(slice: string) {
  const ps = [...slice.matchAll(/<p id="tag-[^"]*"[^>]*>([\s\S]*?)<\/p>/g)].map((m) =>
    sanitizeFlowcvHtml(m[1])
  )
  const lis = [...slice.matchAll(/<li id="tag-[^"]*"[^>]*>([\s\S]*?)<\/li>/g)].map((m) =>
    sanitizeFlowcvHtml(m[1])
  )
  const parts = ps.filter(Boolean).map((p) => `<p>${p}</p>`)
  if (lis.length) parts.push(`<ul>${lis.filter(Boolean).map((li) => `<li>${li}</li>`).join('')}</ul>`)
  return parts.join('')
}

function parseEntries(chunk: string): FlowcvEntry[] {
  // split chunk into entry slices at each `<div id="BASE-title">`; same-BASE slices
  // (FlowCV promotion grouping) are merged
  const titleRe = /id="([A-Za-z0-9_-]+)-title"/g
  const marks: { id: string; pos: number }[] = []
  let m: RegExpExecArray | null
  while ((m = titleRe.exec(chunk))) marks.push({ id: m[1], pos: m.index })
  const slices: { id: string; html: string }[] = marks.map((mk, i) => ({
    id: mk.id,
    html: chunk.slice(mk.pos, i + 1 < marks.length ? marks[i + 1].pos : undefined),
  }))
  const merged = new Map<string, string>()
  for (const s of slices) merged.set(s.id, (merged.get(s.id) ?? '') + s.html)

  const entries: FlowcvEntry[] = []
  for (const [id, slice] of merged) {
    const titleZone = slice.slice(0, slice.indexOf('</div>'))
    const title = joinWords(slice, /data-role="title-word"[^>]*>([\s\S]*?)<\/span>/)
    if (!title && !descriptionHtml(slice)) continue
    const subTitleZone = slice.slice(slice.indexOf('data-role="subTitle-container"'))
    const subTitle = joinWords(
      subTitleZone,
      /data-role="subTitle-word"[^>]*>([\s\S]*?)<\/span>/
    )
    const dateRaw = text(match1(slice, new RegExp(`id="${id}-date"[^>]*>([\\s\\S]*?)<\\/span>`)))
    const location = text(match1(slice, new RegExp(`id="${id}-location"[^>]*>([\\s\\S]*?)<\\/span>`)))
    entries.push({
      title,
      link: match1(titleZone, /href="([^"]*)"/),
      subTitle,
      dateRaw,
      location,
      descriptionHtml: descriptionHtml(slice),
    })
  }
  return entries
}

function parseWordInfoItems(chunk: string) {
  const items: { word: string; info: string }[] = []
  const re = /id="([A-Za-z0-9_-]+)-word"[^>]*>([\s\S]*?)<\/span>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(chunk))) {
    const infoRe = new RegExp(`id="${m[1]}-info"[^>]*>([\\s\\S]*?)<\\/(?:div|span)>`)
    items.push({ word: text(m[2]), info: match1(chunk, infoRe) })
  }
  return items
}

export function parseDateObject(raw: string, ongoing = false): DateObject {
  const monthYear = /(\d{1,2})\/(\d{4})/.exec(raw)
  const year = /(\d{4})/.exec(raw)
  return {
    hide: false,
    year: year?.[1] ?? '',
    month: monthYear?.[1] ?? '',
    ongoing,
    onlyYear: false,
    customOngoingWord: 'present',
  }
}

/** Splits '04/2024 – 03/2026' or '2022 – present' into the two DateObjects. */
export function parseDateRange(raw: string): { start: DateObject; end: DateObject } {
  const [startRaw = '', endRaw = ''] = raw.split(/\s*[–—]\s*/)
  const endOngoing = /present|now|current/i.test(endRaw)
  return {
    start: parseDateObject(startRaw),
    end: parseDateObject(endOngoing ? '' : endRaw, endOngoing),
  }
}

export function parseFlowcvHtml(raw: string): FlowcvData {
  const html = preprocess(raw)

  const name = text(match1(html, /class="js-fullName"[^>]*>([\s\S]*?)<\/span>/))
  const jobTitle = text(match1(html, /class="js-jobTitle"[^>]*>([\s\S]*?)<\/span>/))

  const details: Record<string, { text: string; href: string }> = {}
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/g
  let am: RegExpExecArray | null
  while ((am = anchorRe.exec(html))) {
    const idMatch = /id="detailItem-([a-zA-Z]+)"/.exec(am[1])
    if (!idMatch) continue
    let href = match1(am[1], /href="([^"]*)"/)
    const cf = /email-protection#([0-9a-fA-F]+)/.exec(href)
    if (cf) href = `mailto:${cfDecode(cf[1])}`
    details[idMatch[1]] = { text: text(am[2]), href: decodeEntities(href) }
  }

  const profileStart = html.indexOf('id="profile"')
  const profileEnd = html.indexOf('id="profileBottomSpace"')
  const summaryHtml =
    profileStart !== -1
      ? sanitizeFlowcvHtml(
          match1(
            html.slice(profileStart, profileEnd === -1 ? undefined : profileEnd),
            /<p id="tag-[^"]*"[^>]*>([\s\S]*?)<\/p>/
          )
        )
      : ''

  // section chunks are delimited by the next `-section-heading` marker
  const headings = FLOWCV_SECTIONS.map((key) => ({
    key,
    pos: html.indexOf(`id="${key}-section-heading"`),
  })).filter((h) => h.pos !== -1)
  const chunks = new Map<string, string>()
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].pos
    const end = headings[i + 1]?.pos ?? html.length
    chunks.set(headings[i].key, html.slice(start, end))
  }

  const toEntry = (e: FlowcvEntry) => e
  const skills = parseWordInfoItems(chunks.get('skill') ?? '')
    .filter((s) => s.word)
    .map((s) => ({ skill: s.word, infoHtml: sanitizeFlowcvHtml(s.info) }))
  const languages = parseWordInfoItems(chunks.get('language') ?? '')
    .filter((l) => l.word)
    .map((l) => {
      const info = text(l.info)
      const level = info.replace(/^—\s*/, '').trim()
      return { language: l.word, level }
    })

  return {
    name,
    jobTitle,
    summaryHtml,
    email: details.displayEmail?.href.replace(/^mailto:/, '') || details.displayEmail?.text || '',
    phone: details.phone?.text || '',
    website: details.website?.href || '',
    websiteDisplay: details.website?.text || '',
    linkedIn: details.linkedIn?.href || '',
    github: details.github?.href || '',
    work: parseEntries(chunks.get('work') ?? '').map(toEntry),
    education: parseEntries(chunks.get('education') ?? '').map(toEntry),
    project: parseEntries(chunks.get('project') ?? '').map(toEntry),
    skills,
    languages,
  }
}

export async function fetchFlowcvResume(url: string): Promise<FlowcvData> {
  if (!FLOWCV_URL_PATTERN.test(url.trim())) {
    throw new Error('Not a valid FlowCV public resume URL (expected https://flowcv.com/resume/<id>)')
  }
  const res = await fetch(url.trim(), {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PerfectestCV/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`FlowCV returned ${res.status} — check the link is public`)
  const html = await res.text()
  const data = parseFlowcvHtml(html)
  if (!data.name && !data.work.length && !data.skills.length) {
    throw new Error('Could not read any resume content from that FlowCV page')
  }
  return data
}

/** Maps parsed FlowCV data onto this app's PersonalDetails (keeps photo/custom fields). */
export function flowcvToPersonalDetails(
  data: FlowcvData,
  prev: PersonalDetails
): PersonalDetails {
  return {
    ...prev,
    fullName: data.name || prev.fullName,
    jobTitle: data.jobTitle || prev.jobTitle,
    displayEmail: data.email || prev.displayEmail,
    phone: data.phone || prev.phone,
    website: data.websiteDisplay || prev.website,
    websiteLink: data.website || prev.websiteLink,
    social: {
      linkedIn: { link: data.linkedIn || prev.social.linkedIn.link, display: prev.social.linkedIn.display },
      github: { link: data.github || prev.social.github.link, display: prev.social.github.display },
    },
  }
}

export function flowcvToEntryData(data: FlowcvData): { sectionType: SectionType; entries: EntryData[] }[] {
  const sections: { sectionType: SectionType; entries: EntryData[] }[] = []
  const dates = (raw: string) => parseDateRange(raw)

  if (data.summaryHtml) {
    sections.push({ sectionType: 'profile', entries: [{ type: 'profile', text: data.summaryHtml }] })
  }
  if (data.work.length) {
    sections.push({
      sectionType: 'work',
      entries: data.work.map((w) => {
        const d = dates(w.dateRaw)
        return {
          type: 'work',
          jobTitle: w.subTitle,
          employer: w.title,
          employerLink: w.link,
          location: w.location,
          city: '',
          country: '',
          startDate: d.start,
          endDate: d.end,
          description: w.descriptionHtml,
        }
      }),
    })
  }
  if (data.education.length) {
    sections.push({
      sectionType: 'education',
      entries: data.education.map((e) => {
        const d = dates(e.dateRaw)
        return {
          type: 'education',
          degree: e.title,
          school: e.subTitle,
          schoolLink: e.link,
          location: e.location,
          startDate: d.start,
          endDate: d.end,
          description: e.descriptionHtml,
        }
      }),
    })
  }
  if (data.skills.length) {
    sections.push({
      sectionType: 'skill',
      entries: data.skills.map((s) => ({ type: 'skill', skill: s.skill, level: '', infoHtml: s.infoHtml })),
    })
  }
  if (data.languages.length) {
    sections.push({
      sectionType: 'language',
      entries: data.languages.map((l) => ({ type: 'language', language: l.language, level: l.level, infoHtml: '' })),
    })
  }
  if (data.project.length) {
    sections.push({
      sectionType: 'project',
      entries: data.project.map((p) => {
        const d = dates(p.dateRaw)
        return {
          type: 'project',
          projectTitle: p.title,
          projectTitleLink: p.link,
          subTitle: p.subTitle,
          startDate: d.start,
          endDate: d.end,
          description: p.descriptionHtml,
        }
      }),
    })
  }
  return sections
}
