'use client'

import { useState } from 'react'
import { EntryForm, PersonalDetailsForm } from '@/components/editor/resume/entry-form'
import SectionCard, { entryTitleAndPreview } from '@/components/editor/resume/section-card'
import { Button } from '@/components/ui/button'
import { UserRound, ChevronDown, Plus } from 'lucide-react'
import AddSectionModal from '@/components/editor/add-section-modal'
import { SECTION_LABELS } from '@/features/resume/defaults'
import type { TSection, PersonalDetails, Customization, SectionType, EntryData, HeadingStyle } from '@/features/resume/types'

interface ResumeSidebarProps {
  sections: TSection[]
  personal: PersonalDetails
  custom: Customization
  editing: { sectionId: string; entryId: string } | null
  detailsOpen: boolean
  onDetailsOpenChange: (open: boolean) => void
  onPatchPersonal: (patch: Partial<PersonalDetails>) => void
  onToggleSection: (sectionId: string, hidden: boolean) => void
  onDeleteSection: (sectionId: string) => void
  onAddEntry: (sectionId: string) => void
  onEntryClick: (sectionId: string, entryId: string) => void
  onSaveMeta: (sectionId: string, patch: { hidden?: boolean; displayName?: string }) => void
  onSectionHeadingPatch: (sectionId: string, patch: { style?: HeadingStyle; showTitle?: boolean }) => void
  onAddSection: (type: SectionType) => void
  onUpdateEntry: (sectionId: string, entryId: string, patch: Partial<EntryData>) => void
  onDeleteEntry: (entryId: string) => void
  onCloseEntryEdit: (save: boolean) => void
}

export default function ResumeSidebar({
  sections,
  personal,
  custom,
  editing,
  detailsOpen,
  onDetailsOpenChange,
  onPatchPersonal,
  onToggleSection,
  onDeleteSection,
  onAddEntry,
  onEntryClick,
  onSaveMeta,
  onSectionHeadingPatch,
  onAddSection,
  onUpdateEntry,
  onDeleteEntry,
  onCloseEntryEdit,
}: ResumeSidebarProps) {
  const section = editing ? sections.find((s) => s.id === editing.sectionId) : null
  const entry = section?.entries.find((e) => e.id === editing?.entryId)
  const { title } = (section && entry) ? entryTitleAndPreview(entry.data) : { title: '' }

  return (
    <>
      {editing && section && entry ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b p-3">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title || section.displayName}</span>
            <Button size="sm" onClick={() => onCloseEntryEdit(true)}>Save</Button>
            <Button variant="outline" size="sm" onClick={() => onCloseEntryEdit(false)}>Cancel</Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <EntryForm
              entry={entry}
              sectionType={section.sectionType}
              onChange={(u) => onUpdateEntry(section.id, entry.id, u)}
              onDelete={() => onDeleteEntry(entry.id)}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-3 rounded-xl border border-border bg-card">
            <button
              type="button"
              className="flex w-full items-center gap-2 p-3 text-left"
              onClick={() => onDetailsOpenChange(!detailsOpen)}
            >
              <UserRound className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">Personal details</span>
              <ChevronDown className={`size-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
            {detailsOpen && (
              <div className="border-t border-border/60 p-3">
                <PersonalDetailsForm personal={personal} onChange={onPatchPersonal} />
              </div>
            )}
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[...Object.keys(SECTION_LABELS)].filter((st) => st !== 'profile' && !sections.find((s) => s.sectionType === st as SectionType)).map((st) => (
              <Button
                key={st}
                variant="outline"
                size="sm"
                onClick={() => onAddSection(st as SectionType)}
              >
                <Plus className="size-3" />{SECTION_LABELS[st as keyof typeof SECTION_LABELS]}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {sections
              .map((s) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  canDelete={s.sectionType !== 'profile'}
                  onToggle={(hidden) => onToggleSection(s.id, hidden)}
                  onDelete={() => onDeleteSection(s.id)}
                  onAddEntry={() => onAddEntry(s.id)}
                  onEntryClick={(entryId) => onEntryClick(s.id, entryId)}
                  saveMeta={onSaveMeta}
                  onSectionHeadingPatch={onSectionHeadingPatch}
                  headingStyle={custom.sectionHeadings?.[s.id]?.style || custom.heading.style}
                  showTitle={custom.sectionHeadings?.[s.id]?.showTitle !== false}
                />
              ))}
          </div>
          <div className="py-4">
            <AddSectionInline onAddSection={onAddSection} />
          </div>
        </div>
      )}
    </>
  )
}

function AddSectionInline({ onAddSection }: { onAddSection: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add section
      </Button>
      <AddSectionModal open={open} onOpenChange={setOpen} onAddSection={onAddSection} />
    </>
  )
}
