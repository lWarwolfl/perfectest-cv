'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, ChevronRight } from 'lucide-react'
import { useShareLetter } from '@/features/share/share.hooks'
import { ShareButton } from '@/components/common/share-button'
import { useSaveLetterContent, useSaveLetterDesign, useRenameLetter } from '@/features/letter/hooks/letter.hooks'
import { getLetterAction } from '@/server/letter/letter.actions'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import { QUERY_KEYS } from '@/features/queries/keys'
import { EMPTY_LETTER_DESIGN, type LetterDesign } from '@/features/letter/types'
import EditorHeader, { EditorShell } from '@/components/editor/editor-header'
import { ScreenGate } from '@/components/editor/screen-gate'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import LetterDesignSidebar from '@/components/cover-letter/letter-design-sidebar'
import { PageLoader } from '@/components/common/page-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  SenderDetailsForm,
  DateForm,
  RecipientDetailsForm,
  SubjectForm,
  SignatureForm,
  BodyForm,
} from '@/components/cover-letter/forms'

type SectionKey = 'sender' | 'date' | 'recipient' | 'subject' | 'body' | 'signature'

export default function LetterEditorPage() {
  const params = useParams()
  const id = params.id as string
  const { data: letter, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.LETTERS, id],
    queryFn: () => getLetterAction(id),
    enabled: !!id,
  })
  const saveContent = useSaveLetterContent(id)
  const saveDesign = useSaveLetterDesign(id)
  const rename = useRenameLetter()
  const share = useShareLetter()
  const [form, setForm] = useState<LetterContentPatch>({})
  const [design, setDesign] = useState<LetterDesign>(EMPTY_LETTER_DESIGN)
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
          share={
            <ShareButton
              live={letter?.webResumeLive ?? false}
              kind="letter"
              pending={share.isPending}
              onToggle={(live) => share.mutateAsync({ id, live })}
            />
          }
        />
      }
      sidebar={
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => (activeSection ? setActiveSection(null) : setTab(tab === 'content' ? 'design' : 'content'))}
              aria-label="Swap content/design"
            >
              <ArrowLeftRight className="size-4" />
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
            <LetterDesignSidebar
              letterId={id}
              design={design}
              patchDesign={patchDesign}
              onCopyDetails={patchForm}
            />
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
