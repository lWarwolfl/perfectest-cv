'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown, Eye, EyeOff, Pencil, GripVertical, Trash2, Plus } from 'lucide-react'
import type { TSection, HeadingStyle } from '@/features/resume/types'
import { SECTION_LABELS } from '@/features/resume/defaults'

const HEADING_STYLE_OPTIONS: { value: HeadingStyle; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'box', label: 'Box' },
  { value: 'underline', label: 'Underline' },
  { value: 'simple', label: 'Simple' },
  { value: 'topBottomLine', label: 'Top & Bottom' },
  { value: 'thickShortUnderline', label: 'Thick Short' },
  { value: 'thinLine', label: 'Thin Line' },
  { value: 'zigZagLine', label: 'Zigzag' },
  { value: 'dottedLine', label: 'Dotted' },
  { value: 'plain', label: 'Plain' },
]

export function stripHtml(s?: string) {
  return (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function entryTitleAndPreview(data: TSection['entries'][number]['data']): { title: string; preview: string } {
  switch (data.type) {
    case 'work':
      return { title: data.jobTitle || data.employer, preview: stripHtml(data.description) }
    case 'education':
      return { title: data.degree || data.school, preview: stripHtml(data.description) }
    case 'skill':
      return { title: data.skill, preview: stripHtml(data.infoHtml) }
    case 'language':
      return { title: data.language, preview: stripHtml(data.infoHtml) }
    case 'interest':
      return { title: data.interest, preview: stripHtml(data.infoHtml) }
    case 'profile':
      return { title: 'Summary', preview: stripHtml(data.text) }
    case 'project':
      return { title: data.projectTitle, preview: stripHtml(data.description) }
    case 'certificate':
    case 'publication':
    case 'organisation':
    case 'course':
    case 'award':
      return { title: data.title, preview: stripHtml('description' in data ? data.description : data.issuer) }
    case 'reference':
      return { title: data.name, preview: data.contact }
    case 'declaration':
      return { title: 'Declaration', preview: stripHtml(data.text) }
    default:
      return { title: data.title, preview: stripHtml(data.description) }
  }
}

export default function SectionCard({ section, onToggle, onDelete, onAddEntry, onEntryClick, saveMeta, onSectionHeadingPatch, headingStyle, showTitle, canDelete }: {
  section: TSection
  onToggle: (hidden: boolean) => void
  onDelete: () => void
  onAddEntry: () => void
  onEntryClick: (entryId: string) => void
  saveMeta: (sectionId: string, patch: { hidden?: boolean; displayName?: string }) => void
  onSectionHeadingPatch: (sectionId: string, patch: { style?: HeadingStyle; showTitle?: boolean }) => void
  headingStyle: HeadingStyle
  showTitle: boolean
  canDelete: boolean
}) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function commitEdit() {
    const title = draft.trim()
    setEditing(false)
    if (title && title !== section.displayName) {
      saveMeta(section.id, { displayName: title })
    }
  }

  const isProfile = section.sectionType === 'profile'

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
        {editing ? (
          <Input
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="h-7"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{section.displayName}</span>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Rename section" onClick={() => { setDraft(section.displayName); setEditing(true) }}>
          <Pencil className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={section.hidden ? 'Show section' : 'Hide section'} onClick={() => onToggle(!section.hidden)}>
          {section.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Delete section" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Toggle section" onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border/60 p-3">
          {!isProfile && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-2">
              <span className="text-xs font-medium text-muted-foreground">Title style</span>
              <Select value={headingStyle} onValueChange={(v) => onSectionHeadingPatch(section.id, { style: v as HeadingStyle })}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_STYLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionHeadingPatch(section.id, { showTitle: !showTitle })}
              >
                {showTitle ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {showTitle ? 'Title shown' : 'Title hidden'}
              </Button>
            </div>
          )}
          {isProfile ? (
            section.entries.slice(0, 1).map((entry) => {
              const { title, preview } = entryTitleAndPreview(entry.data)
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onEntryClick(entry.id)}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="block truncate text-sm font-medium">{title || 'Summary'}</span>
                  {preview && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{preview}</span>}
                </button>
              )
            })
          ) : (
            <>
              {section.entries.map((entry) => {
                const { title, preview } = entryTitleAndPreview(entry.data)
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onEntryClick(entry.id)}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="block truncate text-sm font-medium">{title || SECTION_LABELS[section.sectionType]}</span>
                    {preview && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{preview}</span>}
                  </button>
                )
              })}
              <Button variant="outline" size="sm" onClick={onAddEntry}>
                <Plus className="size-3" /> Add entry
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
