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
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useAiSettings, useAiTransform } from '@/features/ai/ai.hooks'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { getResumeTextAction } from '@/server/ai/ai.actions'
import { getErrorMessage } from '@/lib/utils'

const LANGUAGES = [
  'English',
  'Persian (فارسی)',
  'German',
  'French',
  'Spanish',
  'Arabic',
  'Turkish',
  'Chinese',
]

function ConnectionBadge() {
  const { data: settings, isLoading } = useAiSettings()
  if (isLoading) return <Spinner className="size-4" />
  const ok = !!(settings?.baseUrl && settings?.apiKey && settings?.model)
  return (
    <Link href="/app/dashboard" className="group">
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
    description: 'Create a translated version of your resume in the language of your choice.',
    cta: 'Translate now',
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
    description: 'Check spelling, grammar and punctuation without rewriting.',
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
  const [copied, setCopied] = useState(false)
  const transform = useAiTransform()

  const missingJob = jobDescription.trim().length < 40
  const hasSource = !!resumeId || !!resumeText.trim()

  const run = async (f: (typeof FEATURES)[number]) => {
    if (!aiReady) {
      toast.error('Set up your AI connection on the dashboard first')
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
    const html = await transform.mutateAsync({
      feature: f.id,
      text,
      ...(f.id === 'translate' ? { language } : {}),
      ...(f.needsJob ? { jobDescription } : {}),
    })
    setResult({ feature: f.id, html })
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
          <Link href="/app/dashboard">
            <Button size="sm">
              <Settings className="size-3.5" /> Dashboard
            </Button>
          </Link>
        </div>
      )}

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Resume"
              className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm disabled:opacity-50"
              value={resumeId}
              onChange={async (e) => {
                setResumeId(e.target.value)
                setResumeText('')
                setResult(null)
              }}
              disabled={isLoading || !aiReady}
            >
              <option value="">Choose a resume...</option>
              {(resumes ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
            <select
              aria-label="Language"
              className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm disabled:opacity-50"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={!aiReady}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
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
          const disabled = !aiReady || (!hasSource && aiReady) || transform.isPending
          return (
            <Card key={f.id} className={disabled ? 'opacity-60' : ''}>
              <CardContent className="flex h-full flex-col gap-2 pt-4">
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
                  <p className="text-amber-600 flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="size-3 shrink-0" /> Paste a job description first
                  </p>
                )}
                {!aiReady && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="text-amber-500 size-3 shrink-0" /> Needs AI connection
                  </p>
                )}
                {aiReady && !hasSource && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="text-amber-500 size-3 shrink-0" /> Choose a resume first
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={disabled}
                  onClick={() => run(f).catch(() => {})}
                >
                  {transform.isPending ? <Spinner className="size-4" /> : <f.icon className="size-4" />}
                  {f.cta}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {result && (
        <Card>
          <CardContent className="space-y-3 pt-4">
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
              <Link href={`/app/resumes/${resumeId}`} className="underline">
                Open the resume
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
