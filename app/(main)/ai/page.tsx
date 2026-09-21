'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Check,
  ClipboardList,
  FileText,
  Languages,
  PenLine,
  Settings,
  SpellCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
  useAiSettings,
  useAiTransform,
  useGrammarCheck,
  useTranslateResume,
} from '@/features/ai/ai.hooks'
import type { GrammarIssue } from '@/features/ai/grammar'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { getResumeTextAction } from '@/server/ai/ai.actions'
import { getErrorMessage } from '@/lib/utils'

const LANGUAGES = [
  'English',
  'German',
  'French',
  'Spanish',
  'Dutch',
  'Turkish',
  'Chinese',
]

function ConnectionBadge() {
  const { data: settings, isLoading } = useAiSettings()
  if (isLoading) return <Spinner className="size-4" />
  const ok = !!(settings?.baseUrl && settings?.apiKey && settings?.model)
  return (
    <Link href="/dashboard" className="group">
      <span
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
          ok ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        }`}
      >
        {ok ? <Bot className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
        {ok ? settings!.model : 'No AI connection — set it up'}
      </span>
    </Link>
  )
}

const FEATURES: {
  id: 'ats-match' | 'translate' | 'improve' | 'cover-letter' | 'summary' | 'grammar' | 'bullet'
  icon: typeof Target
  title: string
  description: string
  cta: string
  badge?: string
  needsJob?: boolean
  needsLanguage?: boolean
}[] = [
  {
    id: 'ats-match',
    icon: Target,
    title: 'ATS Match Report',
    description:
      'Score your resume against a job description: missing keywords and concrete rewrite suggestions to beat the ATS filters.',
    cta: 'Analyze now',
    needsJob: true,
  },
  {
    id: 'translate',
    icon: Languages,
    title: 'Translate resume',
    description: 'Create a translated copy of your resume as a new resume in the language of your choice.',
    cta: 'Translate into new resume',
    needsLanguage: true,
  },
  {
    id: 'improve',
    icon: PenLine,
    title: 'Improve writing',
    description: 'Strengthen your resume with clearer, more concise and impactful writing.',
    cta: 'Improve now',
    badge: 'New',
  },
  {
    id: 'cover-letter',
    icon: FileText,
    title: 'Draft cover letter',
    description: 'A tailored cover letter draft based on your resume and a target job description.',
    cta: 'Draft now',
    badge: 'New',
    needsJob: true,
  },
  {
    id: 'summary',
    icon: Sparkles,
    title: 'Generate summary',
    description: 'Turn your existing resume content into a professional summary for your resume.',
    cta: 'Generate now',
    badge: 'New',
  },
  {
    id: 'grammar',
    icon: SpellCheck,
    title: 'Check spelling & grammar',
    description:
      'Find spelling, grammar and punctuation mistakes and list the fixes — nothing is rewritten.',
    cta: 'Check now',
  },
  {
    id: 'bullet',
    icon: ClipboardList,
    title: 'Bullet polisher',
    description:
      'Turn plain duty descriptions into strong achievement bullets with action verbs and metrics.',
    cta: 'Polish now',
    badge: 'ATS',
  },
]

export default function AiFeaturesPage() {
  const { data: settings } = useAiSettings()
  const { data: resumes, isLoading } = useListResumes()
  const aiReady = !!(settings?.baseUrl && settings?.apiKey && settings?.model)
  const [resumeId, setResumeId] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<{ feature: string; html: string } | null>(null)
  const [issues, setIssues] = useState<GrammarIssue[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmTranslate, setConfirmTranslate] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)
  const [translatedResume, setTranslatedResume] = useState<{ id: string; title: string } | null>(
    null
  )
  const transform = useAiTransform()
  const grammar = useGrammarCheck()
  const translateResume = useTranslateResume()

  const missingJob = jobDescription.trim().length < 40
  const hasSource = !!resumeId || !!resumeText.trim()
  const selectedResume = resumes?.find((r) => r.id === resumeId) ?? null
  const translatedTitle = selectedResume ? `${selectedResume.title} (${language})` : `(${language})`

  const isAiConnectionError = (message: string) =>
    /api secret|api key|401|403|endpoint|unreachable|timed out|connection|model|5xx|failed to fetch models/i.test(
      message
    )

  const run = async (f: (typeof FEATURES)[number]) => {
    if (!aiReady) {
      toast.error('Set up your AI connection on the dashboard first')
      return
    }
    if (f.id === 'translate') {
      if (!resumeId) {
        toast.error('Select a resume to translate')
        return
      }
      setTranslateError(null)
      setTranslatedResume(null)
      setConfirmTranslate(true)
      return
    }
    let text = resumeText
    if (!text && resumeId) {
      const doc = await getResumeTextAction(resumeId)
      text = doc.text
      setResumeText(text)
    }
    if (!text.trim()) {
      toast.error('Select a resume to work with')
      return
    }
    if (f.needsJob && missingJob) {
      toast.error('Paste the target job description (at least a few sentences) first')
      return
    }
    const feature = f.id
    setBusy(feature)
    try {
      if (feature === 'grammar') {
        setResult(null)
        setIssues(await grammar.mutateAsync(text))
        return
      }
      setIssues(null)
      setResult({
        feature,
        html: await transform.mutateAsync({
          feature,
          text,
          ...(f.needsJob ? { jobDescription } : {}),
        }),
      })
    } finally {
      setBusy(null)
    }
  }

  const confirmTranslateRun = async () => {
    if (!resumeId) {
      toast.error('Select a resume to translate')
      return
    }
    setConfirmTranslate(false)
    setTranslateError(null)
    setTranslatedResume(null)
    setBusy('translate')
    try {
      const created = await translateResume.mutateAsync({ resumeId, language })
      setTranslatedResume(created)
    } catch (e) {
      const message = getErrorMessage(e)
      setTranslateError(message)
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const resultTitle = FEATURES.find((f) => f.id === result?.feature)?.title ?? 'Result'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">AI Features</h1>
        <ConnectionBadge />
      </div>

      {!aiReady && (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">AI is not configured yet</p>
            <p className="text-muted-foreground text-xs">
              Add your API address, secret and model on the dashboard — every feature below stays
              disabled until then.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="sm">
              <Settings className="size-3.5" /> Dashboard
            </Button>
          </Link>
        </div>
      )}

      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={resumeId || null}
              onValueChange={(v) => {
                setResumeId(String(v ?? ''))
                setResumeText('')
                setResult(null)
                setIssues(null)
                setTranslateError(null)
                setTranslatedResume(null)
              }}
              disabled={isLoading || !aiReady}
            >
              <SelectTrigger aria-label="Resume" className="w-56">
                <SelectValue placeholder="Choose a resume..." />
              </SelectTrigger>
              <SelectContent>
                {(resumes ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v ?? '')}
              disabled={!aiReady}
            >
              <SelectTrigger aria-label="Language" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground text-xs">
              {resumeText
                ? `${resumeText.split(/\s+/).filter(Boolean).length} words loaded`
                : 'Resume text loads on first run'}
            </span>
          </div>
          <textarea
            aria-label="Target job description"
            className="border-input placeholder:text-muted-foreground min-h-20 w-full rounded-lg border bg-transparent p-2.5 text-sm outline-none disabled:opacity-50"
            placeholder="Paste the target job description here — required for ATS Match and Cover Letter drafts"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={!aiReady}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const needsJobMissing = f.needsJob && aiReady && hasSource && missingJob
          const running = busy === f.id
          const disabled = !aiReady || !hasSource || running
          return (
            <Card key={f.id} className={disabled ? 'opacity-60' : ''}>
              <CardContent className="flex h-full flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                    <f.icon className="size-4" />
                  </span>
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    {f.title}
                    {'badge' in f && f.badge && (
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                        {f.badge}
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-muted-foreground flex-1 text-xs">{f.description}</p>
                {needsJobMissing && (
                  <p className="flex items-center gap-1.5 text-[11px] text-amber-600">
                    <AlertTriangle className="size-3 shrink-0" /> Paste a job description first
                  </p>
                )}
                {!aiReady && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="size-3 shrink-0 text-amber-500" /> Needs AI connection
                  </p>
                )}
                {aiReady && !hasSource && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="size-3 shrink-0 text-amber-500" /> Choose a resume
                    first
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={disabled}
                  onClick={() => run(f).catch(() => {})}
                >
                  {running ? <Spinner className="size-4" /> : <f.icon className="size-4" />}
                  {f.cta}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {translateError && (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Translation failed — no new resume was created</p>
            <p className="text-sm">{translateError}</p>
            {isAiConnectionError(translateError) && (
              <p className="text-muted-foreground text-xs">
                The AI service looks unreachable or rejected the request. Check the API address,
                secret and model on the dashboard, then try again.
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" variant="outline" onClick={() => setTranslateError(null)}>
              Dismiss
            </Button>
            <Link href="/dashboard">
              <Button size="sm">
                <Settings className="size-3.5" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}

      {translatedResume && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Languages className="size-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Translated resume created</p>
              <p className="text-muted-foreground text-xs">
                {translatedResume.title} — your original resume was left untouched.
              </p>
            </div>
            <Link href={`/resumes/${translatedResume.id}`}>
              <Button size="sm">
                <FileText className="size-3.5" /> Open translated resume
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {issues && (
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-sm font-semibold">Check spelling &amp; grammar — result</h2>
            {issues.length === 0 ? (
              <p className="text-sm">No spelling or grammar problems found.</p>
            ) : (
              <ul className="divide-border max-h-96 divide-y overflow-y-auto rounded-lg border">
                {issues.map((issue, i) => (
                  <li key={`${issue.original}-${i}`} className="space-y-0.5 p-3 text-sm">
                    <p className="text-destructive line-through">{issue.original}</p>
                    <p>{issue.suggestion}</p>
                    {issue.reason && (
                      <p className="text-muted-foreground text-xs">{issue.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{resultTitle} — result</h2>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="size-3.5" /> : null}
                {copied ? 'Copied' : 'Copy HTML'}
              </Button>
            </div>
            <div
              className="resume-prose max-h-96 overflow-y-auto rounded-lg border p-3 text-sm"
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
            <p className="text-muted-foreground text-xs">
              Paste this into any editor, or replace your profile/summary section with it.{' '}
              <Link href={`/resumes/${resumeId}`} className="underline">
                Open the resume
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmTranslate} onOpenChange={setConfirmTranslate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translate into a new resume?</DialogTitle>
            <DialogDescription>
              This creates a separate resume named “{translatedTitle}” from “
              {selectedResume?.title ?? 'your resume'}” in {language}. Your original stays
              untouched. Confirm the target language before continuing — translation uses AI and
              may take a minute.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTranslate(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTranslateRun} disabled={busy === 'translate'}>
              {busy === 'translate' ? <Spinner className="size-4" /> : <Languages className="size-4" />}
              Create translated copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
