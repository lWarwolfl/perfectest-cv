'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { useCopyResumeDesign, useCopyResumeDetails } from '@/features/letter/hooks/letter.hooks'
import { QUERY_KEYS } from '@/features/queries/keys'
import type { LetterDesign } from '@/features/letter/types'
import { Button } from '@/components/ui/button'
import { LabeledInput } from '@/components/ui/labeled'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import HeaderControls from '@/components/editor/customize/header-controls'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization } from '@/features/resume/types'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { TListResumesAction } from '@/server/resume/resume.actions'
import { listResumesAction } from '@/server/resume/resume.actions'

interface LetterDesignSidebarProps {
  letterId: string
  design: LetterDesign
  patchDesign: (patch: Partial<LetterDesign>) => void
  onCopyDetails: (patch: Partial<LetterContentPatch>) => void
}

export default function LetterDesignSidebar({ letterId, design, patchDesign, onCopyDetails }: LetterDesignSidebarProps) {
  const qc = useQueryClient()
  const { data: resumes } = useQuery<TListResumesAction>({
    queryKey: [QUERY_KEYS.RESUMES],
    queryFn: listResumesAction,
  })
  const copyDesign = useCopyResumeDesign()
  const copyDetails = useCopyResumeDetails(letterId)
  const [syncResumeId, setSyncResumeId] = useState('')

  useEffect(() => {
    if (!syncResumeId && resumes?.length) setSyncResumeId(resumes[0].id)
  }, [resumes, syncResumeId])

  function handleCopyResumeDesign() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDesign.mutate({ letterId, resumeId: target.id })
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS, letterId] })
  }

  function handleCopyResumeDetails() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDetails.mutate(target.id, {
      onSuccess: (patch) => onCopyDetails(patch),
    })
  }

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Sync Styles</p>
          <p className="text-xs text-muted-foreground">Match your cover letter design to one of your resumes</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Resume</Label>
          <Select value={syncResumeId || undefined} onValueChange={(v) => setSyncResumeId(v || '')}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Pick a resume" /></SelectTrigger>
            <SelectContent>
              {resumes?.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyResumeDesign} disabled={!syncResumeId}>
            <Copy className="size-3.5" /> Copy design
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyResumeDetails} disabled={!syncResumeId}>
            <Copy className="size-3.5" /> Copy sender details
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Font</Label>
        <Select value={design.fontFamily || 'Inter'} onValueChange={(v) => patchDesign({ fontFamily: v || 'Inter' })}>
          <SelectTrigger className="w-full" style={{ fontFamily: design.fontFamily }}><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Inter', 'Roboto', 'Arial', 'Lora', 'Merriweather', 'Garamond', 'Geist Mono', 'JetBrains Mono'].map((f) => (
              <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Slider label="Font size" value={design.fontSizePt} display={`${design.fontSizePt}pt`} min={8} max={14} onChange={(v) => patchDesign({ fontSizePt: v })} />
      <Slider label="Line height" value={design.lineHeightPct * 100} display={`${design.lineHeightPct}`} min={110} max={170} onChange={(v) => patchDesign({ lineHeightPct: v / 100 })} />
      <Slider label="Vertical margin" value={design.verticalMarginMm} display={`${design.verticalMarginMm}mm`} min={10} max={30} onChange={(v) => patchDesign({ verticalMarginMm: v })} />
      <Slider label="Horizontal margin" value={design.horizontalMarginMm} display={`${design.horizontalMarginMm}mm`} min={10} max={30} onChange={(v) => patchDesign({ horizontalMarginMm: v })} />
      <div className="space-y-1.5">
        <Label className="text-xs">Accent color</Label>
        <div className="flex gap-2 flex-wrap">
          {['#4f46e5', '#0891b2', '#ea580c', '#4a7c59', '#b91c1c', '#475569', '#1e293b', '#7c3aed'].map((c) => (
            <button
              key={c}
              type="button"
              className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${design.colors?.basic?.single === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => patchDesign({ colors: { ...design.colors, mode: 'basic', basic: { ...design.colors?.basic, single: c, selected: 'single' } } })}
              aria-label={`Accent ${c}`}
            />
          ))}
        </div>
        <LabeledInput label="Custom accent hex" hideLabel value={design.colors?.basic?.single || ''} onChange={(e) => patchDesign({ colors: { ...design.colors, mode: 'basic', basic: { ...design.colors?.basic, single: e.target.value, selected: 'single' } } })} className="w-28 font-mono text-xs" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Sender style</Label>
        <Select value={design.senderDisplay?.style || 'classicSender'} onValueChange={(v) => patchDesign({ senderDisplay: { ...design.senderDisplay, style: v as LetterDesign['senderDisplay']['style'] } })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="classicSender">Classic top</SelectItem>
            <SelectItem value="modernHeader">Modern header</SelectItem>
            <SelectItem value="centered">Centered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <HeaderControls
        customization={{ ...DEFAULT_CUSTOMIZATION, header: design.headerSettings || DEFAULT_CUSTOMIZATION.header } as Customization}
        onHeaderPatch={(patch) => patchDesign({ headerSettings: { ...(design.headerSettings || DEFAULT_CUSTOMIZATION.header), ...patch } })}
        onPhotoPositionPatch={() => {}}
      />
      <div className="space-y-1.5">
        <Label className="text-xs">Date position</Label>
        <Select value={design.letterDateDisplay?.position || 'left'} onValueChange={(v) => patchDesign({ letterDateDisplay: { position: v as 'left' | 'right' | 'center' } })}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function Slider({ label, value, display, min, max, onChange }: {
  label: string
  value: number
  display: string
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-sm font-semibold">{display}</span>
      </div>
      <LabeledInput label={`${label} slider`} hideLabel type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-primary" />
    </div>
  )
}

