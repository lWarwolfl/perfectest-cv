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
import { normalizeLetterDesign, type LetterDesign } from '@/features/letter/types'
import type { Customization } from '@/features/resume/types'
import EditorHeader, { EditorShell } from '@/components/editor/editor-header'
import { ScreenGate } from '@/components/editor/screen-gate'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import LetterDesignSidebar from '@/components/cover-letter/letter-design-sidebar'
import { PageLoader } from '@/components/common/page-loader'
import { Button } from '@/components/ui/button'
import { LabeledInput } from '@/components/ui/labeled'
import {
  SenderDetailsForm,
  DateForm,
  RecipientDetailsForm,
  SubjectForm,
  SignatureForm,
  BodyForm,
} from '@/components/cover-letter/forms'

type SectionKey = 'sender' | 'date' | 'recipient' | 'subject' | 'body' | 'signature'

const SECTION_TITLES: Record<SectionKey, string> = {
  sender: 'Sender details',
  date: 'Date',
  recipient: 'Recipient details',
  subject: 'Subject',
  body: 'Body',
  signature: 'Signature',
}

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
  const [design, setDesign] = useState<LetterDesign | null>(null)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const dirty = useRef(false)

  useEffect(() => {
    if (letter) {
      setForm({ ...letter })
      setDesign(normalizeLetterDesign(letter.design))
      setTitleDraft(letter.title)
    }
  }, [letter])

  useEffect(() => {
    if (!dirty.current || !design) return
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

  function patchCustomization(patch: Partial<Customization>) {
    setDesign((d) => normalizeLetterDesign({ ...(d || undefined), customization: { ...(d?.customization || ({} as Customization)), ...patch } }))
    markDirty()
  }

  function closeSection(save: boolean) {
    if (!save && letter) {
      setForm({ ...letter })
    }
    setActiveSection(null)
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const sections: { key: SectionKey; badge?: string; preview: string; placeholder?: boolean }[] = [
    { key: 'sender', badge: form.senderPhotoImageId ? 'With photo' : undefined, preview: [form.senderName, form.senderJobTitle].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'date', preview: form.dateMode === 'custom' ? (form.dateCustom || 'Not added') : today },
    { key: 'recipient', preview: [form.recipientName, form.recipientCompany].filter(Boolean).join(' • ') || 'Not added' },
    { key: 'subject', preview: form.subject || 'Not added', placeholder: !form.subject },
    { key: 'body', badge: `${(form.body || '').split(/\s+/).filter(Boolean).length} words`, preview: (form.body || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 80) || 'Not added', placeholder: !form.body },
    { key: 'signature', preview: form.signatureName || form.senderName || 'Not added' },
  ]

  if (isLoading || !design) {
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
              className="h-8 text-sm"
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
              onClick={() => (activeSection ? closeSection(false) : setTab(tab === 'content' ? 'design' : 'content'))}
              aria-label="Swap content/design"
            >
              <ArrowLeftRight className="size-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <LabeledInput
                label="Title"
                hideLabel
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="h-8 text-sm font-medium"
                placeholder="Letter title"
              />
            </div>
            <Button size="sm" disabled={!titleDraft.trim() || titleDraft === (letter?.title || '')} onClick={() => { if (titleDraft.trim()) rename.mutate({ id, title: titleDraft.trim() }) }}>
              Save
            </Button>
          </div>
          {tab === 'content' ? (
            activeSection ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center gap-2 border-b p-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{SECTION_TITLES[activeSection]}</span>
                  <Button size="sm" onClick={() => closeSection(true)}>Save</Button>
                  <Button variant="outline" size="sm" onClick={() => closeSection(false)}>Cancel</Button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  {activeSection === 'sender' && <SenderDetailsForm value={form} onChange={patchForm} />}
                  {activeSection === 'date' && <DateForm value={form} onChange={patchForm} />}
                  {activeSection === 'recipient' && <RecipientDetailsForm value={form} onChange={patchForm} />}
                  {activeSection === 'subject' && <SubjectForm value={form} onChange={patchForm} />}
                  {activeSection === 'body' && <BodyForm value={form} onChange={patchForm} />}
                  {activeSection === 'signature' && <SignatureForm value={form} onChange={patchForm} />}
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
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
                          <span className="text-sm font-semibold text-foreground">{SECTION_TITLES[s.key]}</span>
                          {s.badge && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s.badge}</span>}
                        </div>
                        <p className={`mt-0.5 line-clamp-1 pr-4 text-xs ${s.placeholder ? 'italic text-muted-foreground/60' : 'text-muted-foreground'}`}>{s.preview}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <LetterDesignSidebar
              letterId={id}
              design={design}
              patchCustomization={patchCustomization}
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
