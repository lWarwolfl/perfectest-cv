'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  RefreshCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { useAiSettings, useSaveAiSettings } from '@/features/ai/ai.hooks'
import { detectAiConfigAction, listAiModelsAction } from '@/server/ai/ai.actions'
import { getErrorMessage, cn } from '@/lib/utils'

export const AI_PRESETS = [
  ['OpenAI', 'https://api.openai.com/v1'],
  ['OpenRouter', 'https://openrouter.ai/api/v1'],
  ['TokenRouter', 'https://tokenrouter.me/v1'],
  ['OpenCode Zen', 'https://opencode.ai/zen/v1'],
  ['OpenCode Go', 'https://opencode.ai/zen/go/v1'],
  ['Groq', 'https://api.groq.com/openai/v1'],
  ['Z.AI', 'https://api.z.ai/api/paas/v4'],
  ['Gemini', 'https://generativelanguage.googleapis.com/v1beta/openai'],
  ['DeepSeek', 'https://api.deepseek.com/v1'],
  ['Ollama', 'http://localhost:11434/v1'],
] as const

export function AiSettingsCard() {
  const { data: saved, isLoading } = useAiSettings()
  const [baseUrl, setBaseUrl] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [modelsOpen, setModelsOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [modelError, setModelError] = useState('')

  const save = useSaveAiSettings()

  const url = baseUrl ?? saved?.baseUrl ?? ''
  const key = apiKey ?? saved?.apiKey ?? ''
  const selected = model ?? saved?.model ?? ''

  const fetchModels = useMutation({
    mutationFn: async () => {
      const ids = await listAiModelsAction(url, key)
      setModels(ids)
      setModelError('')
      setModelsOpen(true)
    },
    onError: (e) => {
      setModelError(getErrorMessage(e))
      toast.error(getErrorMessage(e))
    },
  })

  const detect = useMutation({
    mutationFn: detectAiConfigAction,
    onSuccess: (r) => {
      if (r.baseUrl) {
        setBaseUrl(r.baseUrl)
        setModels([])
        setModel(r.baseUrl === (saved?.baseUrl ?? '') ? saved?.model ?? null : null)
      }
      if (r.apiKey) setApiKey(r.apiKey)
      if (r.baseUrl && r.apiKey) {
        toast.success(`Auto-detected ${r.name ?? 'provider'} — now fetch models`)
      } else {
        toast.warning('No key found on this machine. Paste your API secret manually.')
      }
    },
    onError: (e) => {
      toast.error(getErrorMessage(e))
    },
  })

  const filtered = useMemo(
    () => (filter ? models.filter((m) => m.toLowerCase().includes(filter.toLowerCase())) : models),
    [models, filter]
  )
  const dirty = url !== (saved?.baseUrl ?? '') || key !== (saved?.apiKey ?? '') || selected !== (saved?.model ?? '')
  const canFetch = /^https?:\/\//.test(url.trim()) && key.trim().length > 0
  const noModels = models.length === 0

  if (isLoading) return <div className="bg-muted h-40 animate-pulse rounded-xl" />

  return (
    <Card>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Bot className="size-4" />
          </span>
          <div className="flex-1">
            <h3 className="text-sm leading-tight font-semibold">AI Connection</h3>
            <p className="text-muted-foreground text-xs">
              OpenAI-compatible API endpoint used by the AI features.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={detect.isPending}
            onClick={() => detect.mutate()}
          >
            {detect.isPending ? <Spinner className="size-3.5" /> : <Sparkles className="size-3.5" />}
            Auto-detect
          </Button>
        </div>
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-medium">API address</label>
          <Input
            placeholder="https://api.openai.com/v1"
            value={url}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {AI_PRESETS.map(([label, base]) => (
              <button
                key={label}
                type="button"
                className={cn(
                  'border-input hover:bg-muted rounded-full border px-2 py-0.5 text-[11px]',
                  url === base && 'bg-primary/10 border-primary text-primary'
                )}
                onClick={() => setBaseUrl(base)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-medium">API secret</label>
          <Input
            type="password"
            placeholder="sk-..."
            value={key}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-muted-foreground text-[11px]">
            Kept only in your browser as a secure cookie — never stored on our servers or in our
            database. Clearing your browser data deletes it, so keep a copy of your key.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-medium">Model</label>
          <div className="flex gap-2">
            <Popover open={modelsOpen} onOpenChange={setModelsOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full min-w-0 flex-1 justify-between font-normal"
                    disabled={!models.length}
                  >
                    <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                      {selected || 'Fetch models first'}
                    </span>
                    <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                  </Button>
                }
              />
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
                  {filtered.length === 0 && (
                    <p className="text-muted-foreground px-2 py-4 text-center text-xs">No models match</p>
                  )}
                  {filtered.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                      onClick={() => {
                        setModel(m)
                        setModelsOpen(false)
                        setFilter('')
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate">{m}</span>
                      {m === selected && <Check className="size-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="shrink-0"
              disabled={!canFetch || fetchModels.isPending}
              onClick={() => fetchModels.mutate()}
            >
              {fetchModels.isPending ? <Spinner className="size-4" /> : <RefreshCcw className="size-4" />}
              Fetch
            </Button>
          </div>
          {noModels && (
            <p className="text-muted-foreground flex items-start gap-1.5 text-[11px]">
              <AlertTriangle className="text-amber-500 mt-0.5 size-3 shrink-0" />
              {modelError ||
                'No models fetched yet — enter your API address and secret, then click "Fetch models".'}
            </p>
          )}
          {modelError && !noModels && (
            <p className="text-destructive flex items-start gap-1.5 text-[11px]">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {modelError}
            </p>
          )}
        </div>
        {!canFetch || noModels || !selected ? (
          <Button className="mt-auto w-full" disabled>
            Save connection
          </Button>
        ) : (
          <Button
            className="mt-auto w-full"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate({ baseUrl: url.trim(), apiKey: key.trim(), model: selected })}
          >
            {save.isPending ? <Spinner className="size-4" /> : <Check className="size-4" />}
            Save connection
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
