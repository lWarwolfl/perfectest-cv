'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSaveLetterContent, useSaveLetterDesign } from '@/features/letter/hooks/letter.hooks'
import { getLetterAction } from '@/server/letter/letter.actions'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/features/queries/keys'
import { EMPTY_LETTER_DESIGN, type LetterDesign } from '@/features/letter/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LetterEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: letter } = useQuery({
    queryKey: [QUERY_KEYS.LETTERS, id],
    queryFn: () => getLetterAction(id),
    enabled: !!id,
  })
  const saveContent = useSaveLetterContent(id)
  const saveDesign = useSaveLetterDesign(id)
  const [form, setForm] = useState<LetterContentPatch>({})
  const [design, setDesign] = useState<LetterDesign>(EMPTY_LETTER_DESIGN)
  const dirty = useRef(false)

  useEffect(() => {
    if (letter) {
      setForm({
        body: letter.body,
        subject: letter.subject,
        dateMode: letter.dateMode,
        dateCustom: letter.dateCustom,
        senderName: letter.senderName,
        senderJobTitle: letter.senderJobTitle,
        senderEmail: letter.senderEmail,
        senderPhone: letter.senderPhone,
        senderAddress: letter.senderAddress,
        senderWebsite: letter.senderWebsite,
        senderLinkedIn: letter.senderLinkedIn,
        senderGitHub: letter.senderGitHub,
        recipientName: letter.recipientName,
        recipientPosition: letter.recipientPosition,
        recipientCompany: letter.recipientCompany,
        recipientAddress: letter.recipientAddress,
        signatureName: letter.signatureName,
        signaturePlace: letter.signaturePlace,
        signatureDate: letter.signatureDate,
        signatureImageId: letter.signatureImageId,
      })
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

  function handlePrint() { window.print() }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const colors = design?.colors?.basic?.selected === 'multi'
    ? { accent: design.colors.basic.multi?.accentColor || '#044cb5', text: '#000', bg: design.colors.basic.multi?.backgroundColor || '#fff' }
    : { accent: design?.colors?.basic?.single || '#044cb5', text: '#000', bg: '#fff' }

  return (
    <div className="fixed inset-0 top-0 left-56 flex print:static print:inset-auto print:left-auto">
      <div className="flex w-96 shrink-0 flex-col border-r bg-card print:hidden">
        <div className="flex items-center gap-2 border-b p-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/app/letters')}><ChevronLeft className="size-4" /></Button>
          <span className="text-sm font-medium">{letter?.title || 'Cover Letter'}</span>
        </div>
        <Tabs defaultValue="content" className="flex-1">
          <TabsList className="mx-3 mt-2 grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="flex-1 overflow-auto p-3 space-y-3">
            <Button variant="outline" size="sm" onClick={handlePrint}><Download className="mr-1 size-3" /> PDF</Button>
            <div>
              <Label className="text-xs">Your Name</Label>
              <Input placeholder="Full Name" value={form.senderName || ''} onChange={(e) => { setForm((f) => ({ ...f, senderName: e.target.value })); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Recipient</Label>
              <Input placeholder="HR Name" value={form.recipientName || ''} onChange={(e) => { setForm((f) => ({ ...f, recipientName: e.target.value })); markDirty() }} />
              <Input placeholder="Position / Department" value={form.recipientPosition || ''} onChange={(e) => { setForm((f) => ({ ...f, recipientPosition: e.target.value })); markDirty() }} />
              <Input placeholder="Company" value={form.recipientCompany || ''} onChange={(e) => { setForm((f) => ({ ...f, recipientCompany: e.target.value })); markDirty() }} />
              <Input placeholder="Address" value={form.recipientAddress || ''} onChange={(e) => { setForm((f) => ({ ...f, recipientAddress: e.target.value })); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Input placeholder="Subject" value={form.subject || ''} onChange={(e) => { setForm((f) => ({ ...f, subject: e.target.value })); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea placeholder="Write your cover letter..." value={form.body || ''} onChange={(e) => { setForm((f) => ({ ...f, body: e.target.value })); markDirty() }} className="min-h-[200px]" />
            </div>
            <div>
              <Label className="text-xs">Signature Name</Label>
              <Input placeholder="Sign-off Name" value={form.signatureName || ''} onChange={(e) => { setForm((f) => ({ ...f, signatureName: e.target.value })); markDirty() }} />
            </div>
          </TabsContent>
          <TabsContent value="design" className="flex-1 overflow-auto p-3 space-y-3">
            <div>
              <Label className="text-xs">Font</Label>
              <Select value={design.fontFamily || 'Inter'} onValueChange={(v) => { setDesign({ ...design, fontFamily: v || '' }); markDirty() }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Nunito">Nunito</SelectItem>
                  <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                  <SelectItem value="Crimson Pro">Crimson Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Accent Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#044cb5', '#0891b2', '#ea580c', '#4a7c59', '#b91c1c', '#475569'].map((c) => (
                  <button key={c} className="size-7 rounded-full border-2" style={{ backgroundColor: c, borderColor: design.colors?.basic?.single === c ? 'var(--primary)' : 'transparent' }} onClick={() => { setDesign({ ...design, colors: { ...design.colors, basic: { ...design.colors?.basic, single: c, selected: 'single' } } }); markDirty() }} />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Sender Style</Label>
              <Select value={design.senderDisplay?.style || 'classicSender'} onValueChange={(v) => { setDesign({ ...design, senderDisplay: { ...design.senderDisplay, style: v as LetterDesign['senderDisplay']['style'] } }); markDirty() }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="classicSender">Classic</SelectItem>
                  <SelectItem value="modernHeader">Modern Header</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto bg-muted/30 p-4 print:overflow-visible print:bg-white print:p-0">
        <div className="mx-auto max-w-[794px] bg-white" style={{ fontFamily: design.fontFamily, fontSize: `${design.fontSizePt}pt` }}>
          <div className="p-8" style={{ margin: `${design.verticalMarginMm}mm ${design.horizontalMarginMm}mm` }}>
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-xl font-bold" style={{ color: colors.accent }}>{form.senderName || 'Your Name'}</h1>
            </div>
            {form.recipientCompany || form.recipientName ? (
              <div className="mb-4">
                {form.recipientName && <p>{form.recipientName}</p>}
                {form.recipientCompany && <p>{form.recipientCompany}</p>}
                {form.recipientAddress && <p>{form.recipientAddress}</p>}
              </div>
            ) : null}
            <p className="mb-4 text-sm">{today}</p>
            {form.recipientName && <p className="mb-4">Dear {form.recipientName},</p>}
            {form.subject && <p className="mb-4 font-medium">Re: {form.subject}</p>}
            <div className="text-sm" style={{ lineHeight: design.lineHeightPct }}>{form.body || ''}</div>
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