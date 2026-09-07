'use client'

import { useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BriefcaseBusiness,
  BookOpen,
  BookOpenCheck,
  ChevronDown,
  Code,
  Eye,
  EyeOff,
  FolderOpen,
  Globe,
  GraduationCap,
  GripVertical,
  Heart,
  Pencil,
  Plus,
  Quote,
  SquarePen,
  Star,
  Trash2,
  Trophy,
  UserRound,
  Users,
  Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TSection, HeadingStyle, SectionType } from '@/features/resume/types'
import { SECTION_LABELS } from '@/features/resume/defaults'

export const SECTION_ICONS: Record<SectionType, LucideIcon> = {
  profile: UserRound,
  work: BriefcaseBusiness,
  education: GraduationCap,
  skill: Code,
  language: Globe,
  interest: Heart,
  project: FolderOpen,
  certificate: Award,
  publication: BookOpen,
  organisation: Users,
  course: BookOpenCheck,
  award: Trophy,
  reference: Quote,
  declaration: SquarePen,
  custom: Star,
}

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
  return (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function entryTitleAndPreview(data: TSection['entries'][number]['data']): {
  title: string
  preview: string
} {
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
      return {
        title: data.title,
        preview: stripHtml('description' in data ? data.description : data.issuer),
      }
    case 'reference':
      return { title: data.name, preview: data.contact }
    case 'declaration':
      return { title: 'Declaration', preview: stripHtml(data.text) }
    default:
      return { title: data.title, preview: stripHtml(data.description) }
  }
}

function SortableEntry({
  entry,
  title,
  preview,
  onEntryClick,
}: {
  entry: TSection['entries'][number]
  title: string
  preview: string
  onEntryClick: (entryId: string) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-card flex items-start gap-1 rounded-lg border ${isDragging ? 'relative z-10 opacity-50' : ''}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label="Drag entry"
        className="text-muted-foreground/40 hover:text-muted-foreground mt-3.5 flex cursor-grab touch-none items-center pl-2 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onEntryClick(entry.id)}
        className="hover:bg-muted/50 min-w-0 flex-1 rounded-r-lg p-3 pl-1 text-left transition-colors"
      >
        <span className="block truncate text-sm font-medium">{title}</span>
        {preview && (
          <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">{preview}</span>
        )}
      </button>
    </div>
  )
}

export default function SectionCard({
  section,
  onToggle,
  onDelete,
  onAddEntry,
  onEntryClick,
  saveMeta,
  onSectionHeadingPatch,
  headingStyle,
  showTitle,
  canDelete,
  onReorderEntries,
}: {
  section: TSection
  onToggle: (hidden: boolean) => void
  onDelete: () => void
  onAddEntry: () => void
  onEntryClick: (entryId: string) => void
  saveMeta: (sectionId: string, patch: { hidden?: boolean; displayName?: string }) => void
  onSectionHeadingPatch: (
    sectionId: string,
    patch: { style?: HeadingStyle; showTitle?: boolean }
  ) => void
  headingStyle: HeadingStyle
  showTitle: boolean
  canDelete: boolean
  onReorderEntries: (sectionId: string, entryIds: string[]) => void
}) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleEntryDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = section.entries.findIndex((e) => e.id === active.id)
    const newIndex = section.entries.findIndex((e) => e.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorderEntries(section.id, arrayMove(section.entries, oldIndex, newIndex).map((e) => e.id))
  }

  function commitEdit() {
    const title = draft.trim()
    setEditing(false)
    if (title && title !== section.displayName) {
      saveMeta(section.id, { displayName: title })
    }
  }

  const isProfile = section.sectionType === 'profile'

  return (
    <div className="border-border bg-card rounded-xl border">
      <div className="flex items-center gap-2 p-3">
        {(() => {
          const Icon = SECTION_ICONS[section.sectionType]
          return Icon ? <Icon className="text-muted-foreground size-4 shrink-0" /> : null
        })()}
        {editing ? (
          <Input
            value={draft}
            autoFocus
            aria-label="Section name"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="h-7"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {section.displayName}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Rename section"
          onClick={() => {
            setDraft(section.displayName)
            setEditing(true)
          }}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={section.hidden ? 'Show section' : 'Hide section'}
          onClick={() => onToggle(!section.hidden)}
        >
          {section.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label="Delete section"
            onClick={onDelete}
          >
            <Trash2 className="size-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle section"
          onClick={() => setOpen((o) => !o)}
        >
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      {open && (
        <div className="border-border/60 space-y-2 border-t p-3">
          {!isProfile && (
            <div className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-lg p-2">
              <span className="text-muted-foreground text-xs font-medium">Title style</span>
              <Select
                value={headingStyle}
                onValueChange={(v) =>
                  onSectionHeadingPatch(section.id, { style: v as HeadingStyle })
                }
              >
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_STYLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
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
                  className="hover:bg-muted/50 w-full rounded-lg border p-3 text-left transition-colors"
                >
                  <span className="block truncate text-sm font-medium">{title || 'Summary'}</span>
                  {preview && (
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                      {preview}
                    </span>
                  )}
                </button>
              )
            })
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleEntryDragEnd}
              >
                <SortableContext
                  items={section.entries.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {section.entries.map((entry) => {
                      const { title, preview } = entryTitleAndPreview(entry.data)
                      return (
                        <SortableEntry
                          key={entry.id}
                          entry={entry}
                          title={title || SECTION_LABELS[section.sectionType]}
                          preview={preview}
                          onEntryClick={onEntryClick}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>
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
