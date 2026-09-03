'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSaveLetterContent, useSaveLetterDesign, useCopyResumeDesign } from '@/features/letter/hooks/letter.hooks'
import { getLetterAction } from '@/server/letter/letter.actions'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import { QUERY_KEYS } from '@/features/queries/keys'
import { EMPTY_LETTER_DESIGN, type LetterDesign } from '@/features/letter/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  SenderDetailsForm,
  DateForm,
  RecipientDetailsForm,
  SubjectForm,
  SignatureForm,
  BodyForm,
} from '@/components/cover-letter/forms'
import type { TListResumesAction } from '@/server/resume/resume.actions'
import { listResumesAction } from '@/server/resume/resume.actions'

type SectionKey = 'sender' | 'date' | 'recipient' | 'subject' | 'body' | 'signature'

export default function LetterEditorPage() {
  const params = useParams()
  const router = useRouter()
  const qc = useQueryClient()
  const id = params.id as string
  const { data: letter } = useQuery({
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
  const [form, setForm] = useState<LetterContentPatch>({})
  const [design, setDesign] = useState<LetterDesign>(EMPTY_LETTER_DESIGN)
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
  const dirty = useRef(false)

  useEffect(() => {
    if (letter) {
      setForm({ ...letter })
      setDesign({ ...EMPTY_LETTER_DESIGN, ...(letter.design || {}) })
    }
  }, [letter])

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

  function handlePrint() { window.print() }

  function handleCopyResumeDesign() {
    const firstResume = resumes?.[0]
    if (!firstResume) { toast.error('Create a resume first'); return }
    copyDesign.mutate({ letterId: id, resumeId: firstResume.id })
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS, id] })
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const colors = design?.colors?.basic?.selected === 'multi'
    ? { accent: design.colors.basic.multi?.accentColor || '#044cb5', text: '#000', bg: design.colors.basic.multi?.backgroundColor || '#fff' }
    : { accent: design?.colors?.basic?.single || '#044cb5', text: '#000', bg: '#fff' }

  const sections: { key: SectionKey; title: string; badge?: string; preview: string; placeholder?: boolean }[] = [
    { key: 'sender', title: 'Sender details', badge: design.senderDisplay?.style === 'classicSender' ? 'Classic' : 'Modern header', preview: [form.senderName, form.senderJobTitle].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'date', title: 'Date', preview: form.dateMode === 'custom' ? (form.dateCustom || 'Not added') : today },
    { key: 'recipient', title: 'Recipient details', preview: [form.recipientName, form.recipientCompany].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'subject', title: 'Subject', preview: form.subject || 'Not added', placeholder: !form.subject },
    { key: 'body', title: 'Body', badge: `${(form.body || '').split(/\s+/).filter(Boolean).length} words`, preview: (form.body || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 80) || 'Not added', placeholder: !form.body },
    { key: 'signature', title: 'Signature', preview: form.signatureName || form.senderName || 'Not added' },
  ]

  function back() { setActiveSection(null) }

  return (
    <div className="fixed inset-0 top-0 left-56 flex print:static print:inset-auto print:left-auto">
      <div className="flex w-96 shrink-0 flex-col border-r bg-card print:hidden">
        <div className="flex items-center gap-2 border-b p-3">
          <Button variant="ghost" size="icon-sm" onClick={() => (activeSection ? back() : router.push('/app/letters'))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium">{letter?.title || 'Cover Letter'}</span>
          <Button variant="outline" size="sm" className="ml-auto" onClick={handlePrint}>
            PDF
          </Button>
        </div>
        <Tabs defaultValue="content" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-3 mt-2 grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex-1 overflow-auto p-3">
            {activeSection === null ? (
              <div className="space-y-3.5">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveSection(s.key)}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{s.title}</span>
                        {s.badge && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-normal text-muted-foreground">{s.badge}</span>}
                      </div>
                      <p className={`mt-1 line-clamp-1 pr-4 text-sm ${s.placeholder ? 'italic text-muted-foreground/60' : 'text-muted-foreground'}`}>{s.preview}</p>
                    </div>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
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
          </TabsContent>

          <TabsContent value="design" className="flex-1 space-y-3 overflow-auto p-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div>
                <p className="text-sm font-bold text-foreground">Sync Styles</p>
                <p className="text-xs text-muted-foreground">Match your cover letter design to your primary resume</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 rounded-xl border-primary/30 text-primary hover:bg-primary/10" onClick={handleCopyResumeDesign}>
                Copy resume design
              </Button>
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
                {['#044cb5', '#0891b2', '#ea580c', '#4a7c59', '#b91c1c', '#475569', '#1e293b', '#7c3aed'].map((c) => (
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
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto bg-muted/30 p-4 print:overflow-visible print:bg-white print:p-0">
        <div className="mx-auto max-w-[794px] bg-white" style={{ fontFamily: design.fontFamily, fontSize: `${design.fontSizePt}pt` }}>
          <div className="p-8" style={{ margin: `${design.verticalMarginMm}mm ${design.horizontalMarginMm}mm` }}>
            {design.senderDisplay?.style === 'modernHeader' ? (
              <div className="mb-6 flex items-center justify-between rounded-xl p-4" style={{ backgroundColor: colors.accent, color: colors.bg }}>
                <div>
                  <h1 className="text-xl font-bold">{form.senderName || 'Your Name'}</h1>
                  {form.senderJobTitle && <p className="text-sm opacity-90">{form.senderJobTitle}</p>}
                </div>
                <div className="text-right text-xs opacity-90">
                  {form.senderEmail && <p>{form.senderEmail}</p>}
                  {form.senderPhone && <p>{form.senderPhone}</p>}
                </div>
                <div className="text-xs opacity-90">
                  <p>{form.dateMode === 'custom' ? (form.dateCustom || today) : today}</p>
                </div>
              </div>
            ) : (
              <div className={`mb-6 flex flex-col gap-1 ${design.senderDisplay?.style === 'centered' ? 'items-center text-center' : ''}`}>
                <h1 className="text-xl font-bold" style={{ color: colors.accent }}>{form.senderName || 'Your Name'}</h1>
                {form.senderJobTitle && <p className="text-sm">{form.senderJobTitle}</p>}
                <p className="text-xs text-gray-500">{[form.senderEmail, form.senderPhone].filter(Boolean).join(' • ')}</p>
                {(
                  <p className={`text-sm ${design.letterDateDisplay?.position === 'right' ? 'self-end' : design.letterDateDisplay?.position === 'center' ? 'self-center' : ''}`}>
                    {form.dateMode === 'custom' ? (form.dateCustom || today) : today}
                  </p>
                )}
              </div>
            )}
            {form.recipientCompany || form.recipientName ? (
              <div className="mb-4">
                {form.recipientName && <p>{form.recipientName}</p>}
                {form.recipientPosition && <p>{form.recipientPosition}</p>}
                {form.recipientCompany && <p>{form.recipientCompany}</p>}
                {form.recipientAddress && <p className="whitespace-pre-line">{form.recipientAddress}</p>}
              </div>
            ) : null}
            {form.subject && <p className="mb-4 font-medium">Re: {form.subject}</p>}
            <div className="text-sm" style={{ lineHeight: design.lineHeightPct }} dangerouslySetInnerHTML={{ __html: form.body || '' }} />
            <div className="mt-8">
              <p>Sincerely,</p>
              <p className="font-semibold">{form.signatureName || form.senderName || 'Your Name'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
