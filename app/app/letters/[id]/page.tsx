'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSaveLetterContent, useSaveLetterDesign } from '@/features/letter/hooks/letter.hooks'
import { getLetterAction } from '@/server/letter/letter.actions'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/features/queries/keys'
import { EMPTY_LETTER_CONTENT, EMPTY_LETTER_DESIGN, type LetterContent, type LetterDesign } from '@/features/letter/types'
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
  const saveContent = useSaveLetterContent()
  const saveDesign = useSaveLetterDesign()
  const [content, setContent] = useState<LetterContent>(EMPTY_LETTER_CONTENT)
  const [design, setDesign] = useState<LetterDesign>(EMPTY_LETTER_DESIGN)
  const dirty = useRef(false)

  useEffect(() => {
    if (letter) {
      setContent({ ...EMPTY_LETTER_CONTENT, ...(letter.content || {}) })
      setDesign({ ...EMPTY_LETTER_DESIGN, ...(letter.design || {}) })
    }
  }, [letter])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      saveContent.mutate({ id, content })
      saveDesign.mutate({ id, design })
    }, 1500)
    return () => clearTimeout(t)
  }, [content, design])

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
              <Input placeholder="Full Name" value={content.declaration?.fullName || ''} onChange={(e) => { setContent({ ...content, declaration: { ...content.declaration, fullName: e.target.value } }); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Recipient</Label>
              <Input placeholder="HR Name" value={content.recipient?.hrName || ''} onChange={(e) => { setContent({ ...content, recipient: { ...content.recipient, hrName: e.target.value } }); markDirty() }} />
              <Input placeholder="Company" value={content.recipient?.company || ''} onChange={(e) => { setContent({ ...content, recipient: { ...content.recipient, company: e.target.value } }); markDirty() }} />
              <Input placeholder="Address" value={content.recipient?.address || ''} onChange={(e) => { setContent({ ...content, recipient: { ...content.recipient, address: e.target.value } }); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Subject</Label>
              <Input placeholder="Subject" value={content.subject || ''} onChange={(e) => { setContent({ ...content, subject: e.target.value }); markDirty() }} />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea placeholder="Write your cover letter..." value={content.body || ''} onChange={(e) => { setContent({ ...content, body: e.target.value }); markDirty() }} className="min-h-[200px]" />
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
            {design.senderDisplay?.style !== 'modernHeader' ? (
              <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-xl font-bold" style={{ color: colors.accent }}>{content.declaration?.fullName || 'Your Name'}</h1>
              </div>
            ) : null}
            {content.recipient?.company || content.recipient?.hrName ? (
              <div className="mb-4">
                {content.recipient?.hrName && <p>{content.recipient.hrName}</p>}
                {content.recipient?.company && <p>{content.recipient.company}</p>}
                {content.recipient?.address && <p>{content.recipient.address}</p>}
              </div>
            ) : null}
            <p className="mb-4 text-sm">{today}</p>
            {content.recipient?.hrName && <p className="mb-4">Dear {content.recipient.hrName},</p>}
            {content.subject && <p className="mb-4 font-medium">Re: {content.subject}</p>}
            <div className="text-sm" style={{ lineHeight: design.lineHeightPct }}>{content.body}</div>
            <div className="mt-8">
              <p>Sincerely,</p>
              <p className="font-semibold">{content.declaration?.fullName || 'Your Name'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}