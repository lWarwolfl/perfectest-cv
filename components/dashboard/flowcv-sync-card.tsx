'use client'

import { useState } from 'react'
import { CloudDownload, FileText, Link2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSyncFlowcv } from '@/features/resume/hooks/resume.hooks'
import { getErrorMessage } from '@/lib/utils'

const FLOWCV_URL_RE = /^https:\/\/(www\.)?flowcv\.com\/resume\/[A-Za-z0-9]+\/?$/

export function FlowcvSyncCard({ resumes }: { resumes: { id: string; title: string }[] }) {
  const [url, setUrl] = useState('')
  const [resumeId, setResumeId] = useState('')
  const sync = useSyncFlowcv()

  const valid = FLOWCV_URL_RE.test(url.trim())

  const onSync = () => {
    sync.mutate(
      { resumeId, url: url.trim() },
      {
        onSuccess: () => {
          window.location.href = `/app/resumes/${resumeId}`
        },
      }
    )
  }

  return (
    <div className="border-l lg:pl-6 flex flex-col gap-3 flex-1 min-w-72 mt-6 lg:mt-0">
      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <CloudDownload className="size-4" />
        </span>
        <div>
          <h3 className="text-sm leading-tight font-semibold">Import from FlowCV</h3>
          <p className="text-muted-foreground text-xs">
            Pull your public FlowCV resume straight into one of your resumes.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <Link2 className="size-3" /> Public resume URL
        </label>
        <Input
          placeholder="https://flowcv.com/resume/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          <FileText className="size-3" /> Sync into resume
        </label>
        <Select value={resumeId} onValueChange={(v) => setResumeId(v ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a resume" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        className="mt-auto w-full"
        disabled={!valid || !resumeId || sync.isPending}
        onClick={onSync}
      >
        {sync.isPending ? <Spinner className="size-4" /> : <RefreshCcw className="size-4" />}
        Sync now
      </Button>
      <p className="text-muted-foreground text-[11px]">
        Replaces Profile, Work, Education, Skills, Languages &amp; Projects on the selected resume.
      </p>
    </div>
  )
}
