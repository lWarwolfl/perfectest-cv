'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { useSaveLetterContent, useSaveLetterDesign, useCopyResumeDesign, useCopyResumeDetails, useRenameLetter } from '@/features/letter/hooks/letter.hooks'
import { getLetterAction } from '@/server/letter/letter.actions'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import { QUERY_KEYS } from '@/features/queries/keys'
import { EMPTY_LETTER_DESIGN, type LetterDesign } from '@/features/letter/types'
import EditorHeader, { EditorShell } from '@/components/editor/editor-header'
import { ScreenGate } from '@/components/editor/screen-gate'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { PageLoader } from '@/components/common/page-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  SenderDetailsForm,
  DateForm,
  RecipientDetailsForm,
  SubjectForm,
  SignatureForm,
  BodyForm,
} from '@/components/cover-letter/forms'
import HeaderControls from '@/components/editor/customize/header-controls'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization } from '@/features/resume/types'
import type { TListResumesAction } from '@/server/resume/resume.actions'
import { listResumesAction } from '@/server/resume/resume.actions'

type SectionKey = 'sender' | 'date' | 'recipient' | 'subject' | 'body' | 'signature'

export default function LetterEditorPage() {
  const params = useParams()
  const router = useRouter()
  const qc = useQueryClient()
  const id = params.id as string
  const { data: letter, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.LETTERS, id],
    queryFn: () => getLetterAction(id),
    enabled: !!id,
  })
  const { data: resumes } = useQuery<TListResumesAction>({
    queryKey: [QUERY_KEYS.RESUMES],
    queryFn: listResumesAction,
  })
  const saveContent = useSaveLetterContent(id)
  const saveDesign = useSaveLetterDesign(id)
  const copyDesign = useCopyResumeDesign()
  const copyDetails = useCopyResumeDetails(id)
  const rename = useRenameLetter()
  const [form, setForm] = useState<LetterContentPatch>({})
  const [design, setDesign] = useState<LetterDesign>(EMPTY_LETTER_DESIGN)
  const [syncResumeId, setSyncResumeId] = useState('')
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const dirty = useRef(false)

  useEffect(() => {
    if (letter) {
      setForm({ ...letter })
      setDesign({ ...EMPTY_LETTER_DESIGN, ...(letter.design || {}) })
      setTitleDraft(letter.title)
    }
  }, [letter])

  useEffect(() => {
    if (!syncResumeId && resumes?.length) setSyncResumeId(resumes[0].id)
  }, [resumes, syncResumeId])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      saveContent.mutate(form)
      saveDesign.mutate(design)
    }, 1500)
    return () => clearTimeout(t)
  }, [form, design])

  function markDirty() { dirty.current = true }

  function patchForm(patch: Partial<LetterContentPatch>) {
    setForm((f) => ({ ...f, ...patch }))
    markDirty()
  }

  function patchDesign(patch: Partial<LetterDesign>) {
    setDesign((d) => ({ ...d, ...patch }))
    markDirty()
  }

  function handleCopyResumeDesign() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDesign.mutate({ letterId: id, resumeId: target.id })
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS, id] })
  }

  function handleCopyResumeDetails() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDetails.mutate(target.id, {
      onSuccess: (patch) => { setForm((f) => ({ ...f, ...patch })); markDirty() },
    })
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const sections: { key: SectionKey; title: string; badge?: string; preview: string; placeholder?: boolean }[] = [
    { key: 'sender', title: 'Sender details', badge: design.senderDisplay?.style === 'classicSender' ? 'Classic' : 'Modern header', preview: [form.senderName, form.senderJobTitle].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'date', title: 'Date', preview: form.dateMode === 'custom' ? (form.dateCustom || 'Not added') : today },
    { key: 'recipient', title: 'Recipient details', preview: [form.recipientName, form.recipientCompany].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'subject', title: 'Subject', preview: form.subject || 'Not added', placeholder: !form.subject },
    { key: 'body', title: 'Body', badge: `${(form.body || '').split(/\s+/).filter(Boolean).length} words`, preview: (form.body || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 80) || 'Not added', placeholder: !form.body },
    { key: 'signature', title: 'Signature', preview: form.signatureName || form.senderName || 'Not added' },
  ]

  if (isLoading) {
    return (
      <EditorShell
        header={<EditorHeader overviewHref="/app/letters" activeTab={tab} onTabChange={setTab} onDownload={() => {}} />}
        sidebar={<div />}
        preview={<PageLoader />}
      />
    )
  }

  return (
    <>
      <ScreenGate overviewHref="/app/letters" onDownload={() => window.print()} />
      <EditorShell
      header={
        <EditorHeader
          overviewHref="/app/letters"
          activeTab={tab}
          onTabChange={(t) => { setTab(t); setActiveSection(null) }}
          onDownload={() => window.print()}
        />
      }
      sidebar={
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => (activeSection ? setActiveSection(null) : router.push('/app/letters'))}
              aria-label="Back"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="h-8 text-sm font-medium"
              placeholder="Letter title"
            />
            <Button size="sm" disabled={!titleDraft.trim() || titleDraft === (letter?.title || '')} onClick={() => { if (titleDraft.trim()) rename.mutate({ id, title: titleDraft.trim() }) }}>
              Save
            </Button>
          </div>
          {tab === 'content' ? (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {activeSection === null ? (
                <div className="space-y-2">
                  {sections.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setActiveSection(s.key)}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{s.title}</span>
                          {s.badge && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s.badge}</span>}
                        </div>
                        <p className={`mt-0.5 line-clamp-1 pr-4 text-xs ${s.placeholder ? 'italic text-muted-foreground/60' : 'text-muted-foreground'}`}>{s.preview}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSection === 'sender' && <SenderDetailsForm value={form} onChange={patchForm} />}
                  {activeSection === 'date' && <DateForm value={form} onChange={patchForm} />}
                  {activeSection === 'recipient' && <RecipientDetailsForm value={form} onChange={patchForm} />}
                  {activeSection === 'subject' && <SubjectForm value={form} onChange={patchForm} />}
                  {activeSection === 'body' && <BodyForm value={form} onChange={patchForm} />}
                  {activeSection === 'signature' && <SignatureForm value={form} onChange={patchForm} />}
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
              <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Sync Styles</p>
                  <p className="text-xs text-muted-foreground">Match your cover letter design to one of your resumes</p>
                </div>
                <div className="space-y-1">
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
              <div className="space-y-1">
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
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Font size</Label>
                  <span className="text-sm font-semibold">{design.fontSizePt}pt</span>
                </div>
                <Input type="range" min={8} max={14} value={design.fontSizePt} onChange={(e) => patchDesign({ fontSizePt: Number(e.target.value) })} className="accent-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Line height</Label>
                  <span className="text-sm font-semibold">{design.lineHeightPct}</span>
                </div>
                <Input type="range" min={110} max={170} value={design.lineHeightPct * 100} onChange={(e) => patchDesign({ lineHeightPct: Number(e.target.value) / 100 })} className="accent-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Vertical margin</Label>
                  <span className="text-sm font-semibold">{design.verticalMarginMm}mm</span>
                </div>
                <Input type="range" min={10} max={30} value={design.verticalMarginMm} onChange={(e) => patchDesign({ verticalMarginMm: Number(e.target.value) })} className="accent-primary" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Horizontal margin</Label>
                  <span className="text-sm font-semibold">{design.horizontalMarginMm}mm</span>
                </div>
                <Input type="range" min={10} max={30} value={design.horizontalMarginMm} onChange={(e) => patchDesign({ horizontalMarginMm: Number(e.target.value) })} className="accent-primary" />
              </div>
              <div className="space-y-1">
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
                <Input value={design.colors?.basic?.single || ''} onChange={(e) => patchDesign({ colors: { ...design.colors, mode: 'basic', basic: { ...design.colors?.basic, single: e.target.value, selected: 'single' } } })} className="w-28 font-mono text-xs" />
              </div>
              <div className="space-y-1">
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
              <div className="space-y-1">
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
          )}
        </div>
      }
      preview={
        <div className="preview-light">
          <LetterRenderer form={form} design={design} />
        </div>
      }
      />
    </>
  )
}
