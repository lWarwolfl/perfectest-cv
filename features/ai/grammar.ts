export type GrammarIssue = {
  original: string
  suggestion: string
  reason: string
}

export const GRAMMAR_SYSTEM =
  'You are a meticulous proofreader for resumes. You reply with a JSON array only — never prose, never code fences.'

export function grammarPrompt(text: string) {
  return (
    'Find spelling, grammar and punctuation mistakes in the resume text below. ' +
    'Do not rewrite, reorder or restructure anything, and do not flag style preferences. ' +
    'Reply with ONLY a JSON array of objects: {"original":"...","suggestion":"...","reason":"..."}. ' +
    'original must be an exact substring copied from the text, suggestion the corrected substring, reason at most 6 words. ' +
    'One item per mistake, never merged. If there are no mistakes reply [].\n\n' +
    text
  )
}

function str(v: unknown) {
  return typeof v === 'string' ? v : ''
}

export function parseGrammarIssues(raw: string): GrammarIssue[] {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start < 0 || end < start) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw.slice(start, end + 1))
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed
    .map((item) => {
      const o = item as { original?: unknown; suggestion?: unknown; reason?: unknown }
      return { original: str(o?.original), suggestion: str(o?.suggestion), reason: str(o?.reason) }
    })
    .filter(
      (i) => i.original.trim() !== '' && i.suggestion.trim() !== '' && i.original !== i.suggestion
    )
    .slice(0, 50)
}
