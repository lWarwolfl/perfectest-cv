'use client'

import { useState } from 'react'
import {
  Bot,
  Check,
  ChevronDown,
  FileText,
  Languages,
  PenLine,
  Search,
  SpellCheck,
  Sparkles,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAiSettings, useAiTransform } from '@/features/ai/ai.hooks'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { getResumeTextAction } from '@/server/ai/ai.actions'
import { listAiModelsAction } from '@/server/ai/ai.actions'
import { getErrorMessage, cn } from '@/lib/utils'

const LANGUAGES = [
  'English', 'Persian (فارسی)', 'German', 'French', 'Spanish', 'Arabic', 'Turkish', 'Chinese',
]

function ModelBadge() {
  const { data: settings } = useAiSettings()
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const fetchModels = useMutation({
    mutationFn: async () => {
      if (!settings?.baseUrl || !settings?.apiKey) throw new Error('Save your API address and secret on the dashboard first')
      const ids = await listAiModelsAction(settings.baseUrl, settings.apiKey)
      setModels(ids)
      setOpen(true)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const filtered = filter ? models.filter((m) => m.toLowerCase().includes(filter.toLowerCase())) : models
  const switchModel = useMutation({
    mutationFn: async (m: string) => {
      if (!settings) throw new Error('No AI settings')
      const { saveAiSettingsAction } = await import('@/server/ai/ai.actions')
      await saveAiSettingsAction({ baseUrl: settings.baseUrl, apiKey: settings.apiKey, model: m })
    },
    onSuccess: () => {
      toast.success('Model switched')
      setOpen(false)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="flex items-center gap-2">
      <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
        <Bot className="size-3.5" />
        {settings?.model || 'No model configured'}
      </span>
      <Button variant="ghost" size="sm" disabled={fetchModels.isPending} onClick={() => fetchModels.mutate()}>
        {fetchModels.isPending ? <Spinner className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        Switch model
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverContent className="w-80 p-0">
          <div className="border-border/60 flex items-center gap-2 border-b px-2.5 py-2">
            <Search className="text-muted-foreground size-3.5" />
            <input
              autoFocus
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
              placeholder="Search models..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.map((m) => (
              <button
                key={m}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                onClick={() => switchModel.mutate(m)}
              >
                <span className="min-w-0 flex-1 truncate">{m}</span>
                {m === settings?.model && <Check className="size-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const FEATURES = [
  {
    id: 'translate' as const,
    icon: Languages,
    title: 'Translate resume',
    description: 'Create a translated version of your resume in the language of your choice.',
    cta: 'Translate now',
    needsLanguage: true,
  },
  {
    id: 'improve' as const,
    icon: PenLine,
    title: 'Improve writing',
    description: 'Strengthen your resume with clearer, more concise and impactful writing.',
    cta: 'Improve now',
    badge: 'New',
  },
  {
    id: 'cover-letter' as const,
    icon: FileText,
    title: 'Draft cover letter',
    description: 'Draft a tailored cover letter based on your resume and a target job description.',
    cta: 'Draft now',
    badge: 'New',
    needsJob: true,
  },
  {
    id: 'summary' as const,
    icon: Sparkles,
    title: 'Generate summary',
    description: 'Turn your existing resume content into a professional summary for your resume.',
    cta: 'Generate now',
    badge: 'New',
  },
  {
    id: 'grammar' as const,
    icon: SpellCheck,
    title: 'Check spelling & grammar',
    description: 'Check spelling, grammar and punctuation without rewriting.',
    cta: 'Check now',
  },
] as const

export default function AiFeaturesPage() {
  const { data: resumes, isLoading } = useListResumes()
  const [resumeId, setResumeId] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<{ feature: string; html: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const transform = useAiTransform()

  const run = async (feature: (typeof FEATURES)[number]['id']) => {
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
    const html = await transform.mutateAsync({
      feature,
      text,
      ...(feature === 'translate' ? { language } : {}),
      ...(feature === 'cover-letter' ? { jobDescription } : {}),
    })
    setResult({ feature, html })
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
        <ModelBadge />
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Resume"
              className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm"
              value={resumeId}
              onChange={async (e) => {
                setResumeId(e.target.value)
                setResumeText('')
                setResult(null)
              }}
              disabled={isLoading}
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
              className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <span className="text-muted-foreground text-xs">
              {resumeText ? `${resumeText.split(/\s+/).filter(Boolean).length} words loaded` : 'Resume text loads on first run'}
            </span>
          </div>
          <Input
            placeholder="Target job description (for cover letter drafts)"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.id}>
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
              <Button
                variant="outline"
                className="w-full"
                disabled={transform.isPending || (!resumeId && !resumeText)}
                onClick={() => run(f.id).catch(() => {})}
              >
                {transform.isPending ? <Spinner className="size-4" /> : <f.icon className="size-4" />}
                {f.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {result && (
        <Card>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{resultTitle} — result</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied ? <Check className="size-3.5" /> : null}
                  {copied ? 'Copied' : 'Copy HTML'}
                </Button>
              </div>
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
