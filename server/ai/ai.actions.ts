'use server'

import { db } from '@/drizzle'
import { Resume, ResumeSection, User } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { asc, eq } from 'drizzle-orm'

export async function getAiSettingsAction() {
  const user = await requireUser()
  const [row] = await db.select({ aiSettings: User.aiSettings }).from(User).where(eq(User.id, user.id))
  return row?.aiSettings ?? { baseUrl: '', apiKey: '', model: '' }
}
export type AiSettings = NonNullable<Awaited<ReturnType<typeof getAiSettingsAction>>>

export async function saveAiSettingsAction(settings: AiSettings) {
  const user = await requireUser()
  const baseUrl = settings.baseUrl.trim().replace(/\/+$/, '')
  const model = settings.model.trim()
  if (!/^https?:\/\//.test(baseUrl)) throw new Error('API address must be an http(s) URL')
  if (!settings.apiKey.trim()) throw new Error('API secret is required')
  if (!model) throw new Error('Model is required')
  await db.update(User).set({ aiSettings: { baseUrl, apiKey: settings.apiKey.trim(), model } }).where(eq(User.id, user.id))
  return { ok: true }
}

export async function listAiModelsAction(baseUrl: string, apiKey: string) {
  await requireUser()
  const url = baseUrl.trim().replace(/\/+$/, '') + '/models'
  const res = await fetch(url, {
    headers: apiKey.trim() ? { Authorization: `Bearer ${apiKey.trim()}` } : {},
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`Failed to fetch models (${res.status})`)
  const json = (await res.json()) as { data?: { id?: unknown }[] }
  const ids = (json.data ?? [])
    .map((m) => (typeof m?.id === 'string' ? m.id : ''))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  if (!ids.length) throw new Error('No models found at this endpoint')
  return ids
}

function stripTags(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
}

function textToParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, '<br>').trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('')
}

async function chat(settings: { baseUrl: string; apiKey: string; model: string }, messages: { role: string; content: string }[]) {
  let res: Response
  try {
    res = await fetch(settings.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
      body: JSON.stringify({ model: settings.model, messages, temperature: 0.4 }),
      signal: AbortSignal.timeout(120_000),
    })
  } catch (e) {
    const name = e instanceof Error ? e.name : ''
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new Error('The AI endpoint timed out. The model may be loading (local runtimes) or overloaded — try again.')
    }
    throw new Error("Can't reach the AI endpoint. Check the API address on the dashboard and that the provider is up.")
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(friendlyApiError(res.status, body, settings.model))
  }
  const json = (await res.json()) as { choices?: { message?: { content?: unknown } }[] }
  const content = json.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) throw new Error('AI returned an empty response')
  return content.trim()
}

function friendlyApiError(status: number, body: string, model: string) {
  const detail = body.slice(0, 200)
  switch (status) {
    case 401:
    case 403:
      return 'API key rejected (401). Check the API secret on the dashboard.'
    case 404:
      return 'Endpoint not found (404). The API address must include the version path, e.g. https://api.openai.com/v1'
    case 429:
      return 'Rate limited or out of quota (429) at the provider. Wait a moment or check your plan/billing.'
    case 400:
      return `Request rejected (400). The model "${model}" may not exist at this endpoint — re-fetch models on the dashboard. ${detail}`
    case 502:
    case 503:
      return 'Provider is temporarily down (5xx). Try again shortly.'
    default:
      return `AI request failed (${status}): ${detail}`
  }
}

export async function aiTransformAction(input: {
  feature: 'improve' | 'summary' | 'translate' | 'grammar' | 'cover-letter' | 'bullet' | 'ats-match'
  text: string
  language?: string
  jobDescription?: string
}) {
  const user = await requireUser()
  const [row] = await db.select({ aiSettings: User.aiSettings }).from(User).where(eq(User.id, user.id))
  const settings = row?.aiSettings
  if (!settings?.baseUrl || !settings.apiKey || !settings.model) {
    throw new Error('Set up your AI connection first (AI Features page)')
  }
  const text = input.text?.trim()
  if (!text) throw new Error('Nothing to work with — add some content first')

  const system =
    'You are a professional resume-writing assistant. ' +
    'Return ONLY the rewritten text — no preamble, no explanations, no markdown code fences. ' +
    'Keep the input language unless asked to translate. Preserve line/paragraph structure.'
  let prompt: string
  switch (input.feature) {
    case 'improve':
      prompt = `Rewrite this resume content to be clearer, more concise and more impactful. Keep it truthful — do not invent facts:\n\n${text}`
      break
    case 'summary':
      prompt = `Write a short professional summary (3-5 sentences) for a resume based on this content:\n\n${text}`
      break
    case 'translate':
      prompt = `Translate this resume content into ${input.language || 'English'}. Keep names, links and technical terms intact:\n\n${text}`
      break
    case 'grammar':
      prompt = `Fix spelling, grammar and punctuation ONLY — do not rewrite or restructure. Return the corrected text:\n\n${text}`
      break
    case 'cover-letter':
      prompt = `Write a tailored cover letter (max 350 words) based on this resume content${
        input.jobDescription ? ` and this job description:\n\n<job>\n${input.jobDescription}\n</job>` : ''
      }:\n\n<resume>\n${text}\n</resume>`
      break
    case 'bullet':
      prompt = `Rewrite this duty/description as 1-3 strong achievement bullets for a resume. Start each with a past-tense action verb, add plausible-sounding but generic metrics ONLY if implied (never invent employers/dates), use "Improved X by Y%" phrasing. One bullet per line:\n\n${text}`
      break
    case 'ats-match':
      prompt = `You are an ATS (applicant tracking system) optimization expert. Compare this resume against the job description and return a report in this exact plain-text structure:

Match score: <0-100>%

Missing keywords:
- <keyword or phrase from the job description not present in the resume> (one per line, 5-12 items)

Suggestions:
- <one concrete rewrite suggestion per line, referencing resume content>

<job description>
${input.jobDescription || '(no job description provided)'}

<resume>
${text}`
      break
  }
  const raw = await chat(settings, [
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ])
  return textToParagraphs(raw)
}

export async function getResumeTextAction(resumeId: string) {
  const user = await requireUser()
  const resume = await db.query.Resume.findFirst({
    where: (t, { and }) => and(eq(t.id, resumeId), eq(t.userId, user.id)),
  })
  if (!resume) throw new Error('Resume not found')
  const sections = await db.query.ResumeSection.findMany({
    where: eq(ResumeSection.resumeId, resumeId),
    orderBy: [asc(ResumeSection.order)],
    with: { entries: true },
  })
  const p = resume.personalDetails
  const parts: string[] = []
  if (p?.fullName) parts.push(`${p.fullName}${p.jobTitle ? ` — ${p.jobTitle}` : ''}`)
  if (p?.displayEmail) parts.push(p.displayEmail)
  if (p?.phone) parts.push(p.phone)
  for (const s of sections) {
    parts.push(`\n## ${s.displayName || s.sectionType}`)
    for (const e of s.entries) {
      if (e.hidden) continue
      const d = e.data as unknown as Record<string, unknown>
      const line = [d.jobTitle, d.employer, d.degree, d.school, d.skill, d.language, d.projectTitle, d.title, d.interest, d.name]
        .filter((v): v is string => typeof v === 'string' && !!v)
        .join(' | ')
      const dates = [d.startDate, d.endDate]
        .map((x) => {
          const o = x as { month?: unknown; year?: unknown } | undefined
          return o && typeof o === 'object' ? [o.month, o.year].filter((v) => typeof v === 'string' && v).join('/') : ''
        })
        .filter(Boolean)
        .join(' - ')
      if (line) parts.push(line + (dates ? ` (${dates})` : ''))
      for (const key of ['text', 'description', 'infoHtml']) {
        if (typeof d[key] === 'string' && d[key]) parts.push(stripTags(d[key] as string))
      }
    }
  }
  return { title: resume.title, text: parts.join('\n') }
}
