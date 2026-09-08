'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useShareResume } from '@/features/share/share.hooks'
import { ShareButton } from '@/components/common/share-button'
import {
  useResumeDocument,
  useSaveResumePersonalDetails,
  useSaveResumeCustomization,
  useRenameResume,
  useAddSection,
  useDeleteSection,
  useAddEntry,
  useDeleteEntry,
  useUpdateEntryData,
  useUpdateEntryMeta,
  useSaveSectionMeta,
  useReorderSections,
  useReorderEntries,
} from '@/features/resume/hooks/resume.hooks'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { EMPTY_PERSONAL_DETAILS, DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type {
  PersonalDetails,
  Customization,
  EntryData,
  HeadingStyle,
  SectionType,
} from '@/features/resume/types'
import { LabeledInput } from '@/components/ui/labeled'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight } from 'lucide-react'
import EditorHeader, { EditorShell } from '@/components/editor/editor-header'
import { ScreenGate } from '@/components/editor/screen-gate'
import { PageLoader } from '@/components/common/page-loader'
import ResumeSidebar from '@/components/editor/resume/resume-sidebar'
import { useResumeStyleStore } from '@/stores/use-resume-style-store'
import { useAutosaveStore } from '@/stores/use-autosave-store'
import { useAutosave, AutosaveStatus, AutosaveDialog } from '@/components/editor/autosave'
import StyleSettings from '@/components/editor/customize/style-settings'

function printWithFileName(name: string) {
  const prev = document.title
  document.title = name
  window.print()
  document.title = prev
}

function mergeCustomization(
  base: Customization,
  saved: Customization | null | undefined
): Customization {
  const out = { ...base } as unknown as Record<string, unknown>
  for (const key of Object.keys(base) as (keyof Customization)[]) {
    const value = saved?.[key] as unknown
    const b = base[key] as unknown
    if (
      b &&
      typeof b === 'object' &&
      !Array.isArray(b) &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      out[key] = { ...(b as Record<string, unknown>), ...(value as Record<string, unknown>) }
    } else if (value !== undefined && value !== null) {
      out[key] = value
    }
  }
  return out as unknown as Customization
}

export default function ResumeEditorPage() {
  const params = useParams()
  const id = params.id as string
  const { data: doc, isLoading } = useResumeDocument(id)
  const savePersonal = useSaveResumePersonalDetails()
  const saveCustom = useSaveResumeCustomization()
  const rename = useRenameResume()
  const addSection = useAddSection(id)
  const deleteSection = useDeleteSection(id)
  const addEntry = useAddEntry(id)
  const deleteEntry = useDeleteEntry(id)
  const updateData = useUpdateEntryData(id)
  const updateMeta = useUpdateEntryMeta(id)
  const saveSectionMeta = useSaveSectionMeta(id)
  const reorderSections = useReorderSections(id)
  const reorderEntries = useReorderEntries(id)
  const share = useShareResume()

  const [sections, setSections] = useState<import('@/features/resume/types').TSection[]>([])
  const [personal, setPersonal] = useState<PersonalDetails>(EMPTY_PERSONAL_DETAILS)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOMIZATION)
  const [editing, setEditing] = useState<{ sectionId: string; entryId: string } | null>(null)
  const hydrateStyle = useResumeStyleStore((s) => s.hydrate)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const dirty = useRef(false)
  const personalDirty = useRef(false)
  const customDirty = useRef(false)
  const entriesDirty = useRef(false)

  useEffect(() => {
    if (doc) {
      const next = [...(doc.sections || [])].sort((a, b) => a.order - b.order)
      setSections(next)
      setPersonal({ ...EMPTY_PERSONAL_DETAILS, ...doc.resume.personalDetails })
      const merged = mergeCustomization(DEFAULT_CUSTOMIZATION, doc.resume.customization)
      setCustom(merged)
      hydrateStyle(merged)
      setTitleDraft(doc.resume.title)
      // Profile section is mandatory: auto-create it if missing, and keep exactly one entry.
      if (!next.some((s) => s.sectionType === 'profile')) {
        addSection.mutate('profile')
      }
    }
  }, [doc])

  const saveAll = useCallback(async () => {
    if (!dirty.current) return
    if (useAutosaveStore.getState().status === 'saving') return
    useAutosaveStore.getState().start()
    try {
      // mutateAsync (not mutate) so failures reject here — mutate() swallows
      // errors into onError toasts and we'd mark the doc saved when it isn't.
      if (personalDirty.current) {
        await savePersonal.mutateAsync({ id, personalDetails: personal })
      }
      if (customDirty.current) {
        await saveCustom.mutateAsync({ id, customization: custom })
      }
      if (entriesDirty.current) {
        for (const s of sections) {
          for (const e of s.entries) {
            if (e._dirty) await updateData.mutateAsync({ entryId: e.id, data: e.data })
          }
        }
      }
      if (editing) {
        dirty.current = true
        useAutosaveStore.getState().success()
        return
      }
      dirty.current = false
      personalDirty.current = false
      customDirty.current = false
      entriesDirty.current = false
      setSections((prev) =>
        prev.map((s) => ({ ...s, entries: s.entries.map((e) => ({ ...e, _dirty: false })) }))
      )
      useAutosaveStore.getState().success()
    } catch {
      useAutosaveStore.getState().failure()
    }
  }, [id, personal, custom, sections, editing])

  useAutosave(saveAll)

  function markDirty() {
    dirty.current = true
  }

  function mutateData(sectionId: string, entryId: string, patch: Partial<EntryData>) {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s
        return {
          ...s,
          entries: s.entries.map((e) => {
            if (e.id !== entryId) return e
            return { ...e, _dirty: true, data: { ...e.data, ...patch } as EntryData }
          }),
        }
      })
    )
    markDirty()
    entriesDirty.current = true
  }

  function patchPersonal(patch: Partial<PersonalDetails>) {
    setPersonal((p) => ({ ...p, ...patch }))
    markDirty()
    personalDirty.current = true
  }

  function patchSectionHeading(
    sectionId: string,
    patch: { style?: HeadingStyle; showTitle?: boolean }
  ) {
    setCustom((c) => ({
      ...c,
      sectionHeadings: {
        ...c.sectionHeadings,
        [sectionId]: { ...c.sectionHeadings?.[sectionId], ...patch },
      },
    }))
    markDirty()
    customDirty.current = true
  }

  function toggleEntryHidden(entryId: string, hidden: boolean) {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === entryId ? { ...e, hidden } : e)),
      }))
    )
    updateMeta.mutate({ entryId, hidden })
  }

  function closeEntryEdit(save: boolean) {
    if (save) {
      dirty.current = true
      const editingEntry = sections
        .find((s) => s.id === editing?.sectionId)
        ?.entries.find((e) => e.id === editing?.entryId)
      if (editingEntry?._dirty) {
        updateData.mutate({ entryId: editingEntry.id, data: editingEntry.data })
        entriesDirty.current = true
      }
    } else if (doc) {
      const snapshot = [...(doc.sections || [])].sort((a, b) => a.order - b.order)
      setSections((prev) =>
        snapshot.map((s) => {
          const local = prev.find((p) => p.id === s.id)
          return local ? { ...s, hidden: local.hidden } : s
        })
      )
    }
    setEditing(null)
  }

  function handlePrint() {
    const name =
      (custom.fileName || doc?.resume.title || 'resume').replace(/\.pdf$/i, '').trim() || 'resume'
    printWithFileName(name)
  }

  const resume = doc?.resume

  if (isLoading) {
    return (
      <EditorShell
        header={
          <EditorHeader
            overviewHref="/resumes"
            activeTab={tab}
            onTabChange={setTab}
            onDownload={() => {}}
          />
        }
        sidebar={<div />}
        preview={<PageLoader />}
      />
    )
  }

  return (
    <>
      <ScreenGate overviewHref="/resumes" onDownload={handlePrint} />
      <EditorShell
        header={
          <EditorHeader
            overviewHref="/resumes"
            activeTab={tab}
            onTabChange={setTab}
            onDownload={handlePrint}
            saveStatus={<AutosaveStatus />}
            share={
              <ShareButton
                className="h-8 text-sm"
                live={resume?.webResumeLive ?? false}
                kind="resume"
                pending={share.isPending}
                onToggle={(live) => share.mutateAsync({ id, live })}
              />
            }
          />
        }
        sidebar={
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="bg-background sticky top-0 z-10 flex items-center gap-2 border-b p-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTab(tab === 'content' ? 'design' : 'content')}
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
                  placeholder="Resume title"
                />
              </div>
              <Button
                size="sm"
                disabled={!titleDraft.trim() || titleDraft === (resume?.title || '')}
                onClick={() => {
                  if (titleDraft.trim()) rename.mutate({ id, title: titleDraft.trim() })
                }}
              >
                Save
              </Button>
            </div>
            {tab === 'content' ? (
              <ResumeSidebar
                sections={sections}
                personal={personal}
                custom={custom}
                editing={editing}
                detailsOpen={detailsOpen}
                onDetailsOpenChange={setDetailsOpen}
                onPatchPersonal={patchPersonal}
                onToggleSection={(sectionId, hidden) => {
                  saveSectionMeta.mutate({ sectionId, hidden })
                  setSections((prev) =>
                    prev.map((s) => (s.id === sectionId ? { ...s, hidden } : s))
                  )
                }}
                onDeleteSection={(sectionId) => deleteSection.mutate(sectionId)}
                onAddEntry={(sectionId) => addEntry.mutate(sectionId)}
                onEntryClick={(sectionId, entryId) => setEditing({ sectionId, entryId })}
                onSaveMeta={(sectionId, patch) => saveSectionMeta.mutate({ sectionId, ...patch })}
                onSectionHeadingPatch={patchSectionHeading}
                onAddSection={(type: SectionType) => addSection.mutate(type)}
                onUpdateEntry={mutateData}
                onDeleteEntry={(entryId) => deleteEntry.mutate(entryId)}
                onCloseEntryEdit={closeEntryEdit}
                onToggleEntryHidden={toggleEntryHidden}
                onReorderEntries={(sectionId, entryIds) => {
                  setSections((prev) =>
                    prev.map((s) => {
                      if (s.id !== sectionId) return s
                      const byId = new Map(s.entries.map((e) => [e.id, e]))
                      return { ...s, entries: entryIds.map((eid) => byId.get(eid)!).filter(Boolean) }
                    })
                  )
                  reorderEntries.mutate({ sectionId, entryIds })
                }}
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <StyleSettings
                  sections={sections}
                  onChange={(next: Customization) => {
                    setCustom(next)
                    hydrateStyle(next)
                    markDirty()
                    customDirty.current = true
                  }}
                  onReorderSections={(ids) => {
                    const byId = new Map(sections.map((s) => [s.id, s]))
                    const next = ids
                      .map((sid, i) => {
                        const s = byId.get(sid)
                        return s ? { ...s, order: i } : null
                      })
                      .filter(Boolean) as import('@/features/resume/types').TSection[]
                    setSections(next)
                    reorderSections.mutate(ids)
                  }}
                  onToggleSection={(sectionId, hidden) => {
                    saveSectionMeta.mutate({ sectionId, hidden })
                    setSections((prev) =>
                      prev.map((s) => (s.id === sectionId ? { ...s, hidden } : s))
                    )
                  }}
                />
              </div>
            )}
          </div>
        }
        preview={
          <div className="preview-light">
            <ResumeRenderer personalDetails={personal} sections={sections} customization={custom} />
          </div>
        }
      />
      <AutosaveDialog />
    </>
  )
}
