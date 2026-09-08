'use server'

import { db } from '@/drizzle'
import { ResumeSection, User } from '@/drizzle/schema'
import { requireUser } from '@/server/resume/resume.actions'
import { asc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

const AI_KEY_COOKIE = 'ai_api_key'

export async function getAiSettingsAction() {
  const user = await requireUser()
  const [row] = await db.select({ aiSettings: User.aiSettings }).from(User).where(eq(User.id, user.id))
  const saved = row?.aiSettings ?? { baseUrl: '', apiKey: '', model: '' }
  const jar = await cookies()
  return { ...saved, apiKey: jar.get(AI_KEY_COOKIE)?.value ?? '' }
}
export type AiSettings = NonNullable<Awaited<ReturnType<typeof getAiSettingsAction>>>

export async function saveAiSettingsAction(settings: AiSettings) {
  const user = await requireUser()
  const baseUrl = settings.baseUrl.trim().replace(/\/+$/, '')
  const model = settings.model.trim()
  if (!/^https?:\/\//.test(baseUrl)) throw new Error('API address must be an http(s) URL')
  if (!settings.apiKey.trim()) throw new Error('API secret is required')
  if (!model) throw new Error('Model is required')
  const jar = await cookies()
  jar.set(AI_KEY_COOKIE, settings.apiKey.trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  // API secret lives ONLY in the user's browser cookie — never in the database.
  await db.update(User).set({ aiSettings: { baseUrl, apiKey: '', model } }).where(eq(User.id, user.id))
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

const AI_KEY_FILES: [string, RegExp][] = [
  [`${process.env.HOME ?? ''}/.config/opencode/auth.json`, /"?(api_?key|token|key)"?\s*:\s*"([^"]+)"/i],
  [`${process.env.HOME ?? ''}/.openrouter/api.json`, /"?(api_?key|token)"?\s*:\s*"([^"]+)"/i],
]

export async function detectAiConfigAction(): Promise<{
  baseUrl: string | null
  apiKey: string | null
  name: string | null
}> {
  await requireUser()
  const found = async (): Promise<{ apiKey: string | null; name: string | null }> => {
    for (const [name, val] of Object.entries(process.env)) {
      if (
        typeof val === 'string' &&
        /^(sk-|sk_|sk-ant-|gsk_|tr-|or-)[A-Za-z0-9_-]{16,}$/.test(val.trim())
      ) {
        const provider = /OPENROUTER/i.test(name)
          ? 'OpenRouter'
          : /GROQ/i.test(name)
            ? 'Groq'
            : /GITHUB/i.test(name)
              ? 'GitHub Models'
              : /DEEPSEEK/i.test(name)
                ? 'DeepSeek'
                : /ZAI|Z_AI/i.test(name)
                  ? 'Z.AI'
                  : 'OpenAI'
        return { apiKey: val.trim(), name: provider }
      }
    }
    for (const [path, re] of AI_KEY_FILES) {
      try {
        const { readFile } = await import('node:fs/promises')
        const m = re.exec(await readFile(path, 'utf8'))
        if (m?.[2]) return { apiKey: m[2], name: 'config file' }
      } catch {
        // file missing — next candidate
      }
    }
    return { apiKey: null, name: null }
  }

  const { apiKey, name } = await found()
  if (!apiKey) return { baseUrl: null, apiKey: null, name: null }

  const guess: [RegExp, string, string][] = [
    [/tokenrouter/i, 'TokenRouter', 'https://tokenrouter.me/v1'],
    [/openrouter/i, 'OpenRouter', 'https://openrouter.ai/api/v1'],
    [/^sk-or-/, 'OpenRouter', 'https://openrouter.ai/api/v1'],
    [/^gsk_/, 'Groq', 'https://api.groq.com/openai/v1'],
    [/^tr-/, 'TokenRouter', 'https://tokenrouter.me/v1'],
    [/github/i, 'GitHub Models', 'https://models.github.ai/inference'],
    [/deepseek/i, 'DeepSeek', 'https://api.deepseek.com/v1'],
    [/zai|z_ai/, 'Z.AI', 'https://api.z.ai/api/paas/v4'],
    [/^sk-ant-/, 'Anthropic', 'https://api.anthropic.com/v1'],
  ]
  const hit = guess.find(([re]) => re.test(apiKey) || re.test(name ?? ''))
  return {
    baseUrl: hit?.[2] ?? 'https://api.openai.com/v1',
    apiKey,
    name: hit?.[1] ?? name ?? 'OpenAI',
  }
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

function isResponsesApi(baseUrl: string) {
  return /opencode\.ai\/zen\/v1$/.test(baseUrl)
}

function toResponsesInput(messages: { role: string; content: string }[]) {
  return messages.map((m) => ({
    role: m.role,
    content: [{ type: m.role === 'system' ? 'message' : 'input_text', text: m.content }],
  }))
}

async function chat(settings: { baseUrl: string; apiKey: string; model: string }, messages: { role: string; content: string }[]) {
  const base = settings.baseUrl.replace(/\/+$/, '')
  const responsesMode = isResponsesApi(base)
  let res: Response
  try {
    res = await fetch(
      responsesMode ? base + '/responses' : base + '/chat/completions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
        body: responsesMode
          ? JSON.stringify({ model: settings.model, input: toResponsesInput(messages), temperature: 0.4 })
          : JSON.stringify({ model: settings.model, messages, temperature: 0.4 }),
        signal: AbortSignal.timeout(120_000),
      }
    )
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
  const json = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[]
    output?: { type?: string; content?: { type?: string; text?: unknown }[] }[]
  }
  const chatContent = json.choices?.[0]?.message?.content
  const responsesText = json.output
    ?.filter((o) => o?.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c?.type === 'output_text')
    .map((c) => (typeof c.text === 'string' ? c.text : ''))
    .join('')
  const content = responsesMode ? responsesText : chatContent
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
  const jar = await cookies()
  const settings = {
    baseUrl: row?.aiSettings?.baseUrl ?? '',
    apiKey: jar.get(AI_KEY_COOKIE)?.value ?? '',
    model: row?.aiSettings?.model ?? '',
  }
  if (!settings.baseUrl || !settings.apiKey || !settings.model) {
    throw new Error('Set up your AI connection first (AI Features page)')
  }
  const text = input.text?.trim()
  if (!text) throw new Error('Nothing to work with — add some content first')

  const system =
    'You are a professional resume-writing assistant. ' +
    'Return ONLY the rewritten text — no preamble, no explanations, no markdown code fences. ' +
    'Keep the input language unless asked to translate. Preserve line/paragraph structure.'
  // Distilled from r/EngineeringResumes wiki, Google's XYZ formula (Laszlo Bock),
  // MIT/Stanford/UMD career guides, Tech Interview Handbook, ByteByteGo (Ethan Evans).
  const RULES =
    'Writing rules: start every bullet with a strong, plain past-tense action verb (built, designed, led, reduced, automated, migrated) — never "responsible for", "helped with", "worked on", "assisted", "utilized", "leveraged", "spearheaded", "orchestrated". ' +
    'Use the XYZ pattern where possible: accomplished [X] as measured by [Y] by doing [Z]. Quantify outcomes (%, $, users, latency, time saved) and give numbers a baseline when the input implies one ("from 900ms to 120ms"); if there is no outcome metric, quantify scope instead (users served, team size, number of systems, throughput, frequency). ' +
    'Name the tech stack inside the bullet and add domain context (what industry or kind of system). ' +
    'No first-person pronouns, no ending periods on single-line bullets, one sentence per bullet, 1-2 lines. ' +
    'Cut self-praise and filler adjectives (successfully, innovative, excellent, passionate, results-driven). ' +
    'Order bullets most impressive and most relevant first. ' +
    'NEVER invent employers, dates, technologies or numbers that are not implied by the input. '
  let prompt: string
  switch (input.feature) {
    case 'improve':
      prompt =
        RULES +
        `Rewrite this resume content to be clearer, more concise and more impactful following the rules. Keep every claim truthful and defensible in an interview:\n\n${text}`
      break
    case 'summary':
      prompt =
        `Write a concise professional summary (2-4 sentences) for a resume based on this content. ` +
        `Lead with scope and impact (years/roles/domain/stack), no first person, no clichés like "results-driven professional" or "passionate". Only state what the content supports:\n\n${text}`
      break
    case 'translate':
      prompt = `Translate this resume content into ${input.language || 'English'}. Keep names, links and technical terms intact:\n\n${text}`
      break
    case 'grammar':
      prompt = `Fix spelling, grammar and punctuation ONLY — do not rewrite or restructure. Return the corrected text:\n\n${text}`
      break
    case 'cover-letter':
      prompt =
        `Write a tailored cover letter (max 350 words) based on this resume content` +
        (input.jobDescription
          ? ` and this job description. Mirror the job description's key requirements with the resume's concrete achievements (with their numbers), without copying its phrasing:\n\n<job>\n${input.jobDescription}\n</job>`
          : '') +
        `:\n\n<resume>\n${text}\n</resume>`
      break
    case 'bullet':
      prompt =
        RULES +
        `Rewrite this duty/description as 1-3 achievement bullets following the rules. Metrics are acceptable ONLY if implied by the input (never invent employers, dates, or specific figures):\n\n${text}`
      break
    case 'ats-match':
      prompt = `You are an ATS (applicant tracking system) optimization expert. Compare this resume against the job description and return a report in this exact plain-text structure:

Match score: <0-100>%

Missing keywords:
- <keyword or phrase from the job description not present in the resume> (one per line, 5-12 items; prefer exact terms the ATS matches on, and include the expanded form where the resume only uses an abbreviation, e.g. "Amazon Web Services (AWS)")

Suggestions:
- <one concrete rewrite suggestion per line, referencing resume content; suggest moving JD keywords into experience bullets, not just the skills section>

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
