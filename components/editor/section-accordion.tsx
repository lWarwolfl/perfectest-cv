'use client'

import * as React from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronDown,
  Code,
  Folder,
  Globe,
  GraduationCap,
  GripVertical,
  Heart,
  Library,
  Pencil,
  PenLine,
  Plus,
  Quote,
  Star,
  Trash2,
  Trophy,
  User,
  Users,
} from 'lucide-react'
import type { EntryData, TSection } from '@/features/resume/types'

const ICON_MAP: Record<string, React.ElementType> = {
  user: User,
  briefcase: Briefcase,
  graduation: GraduationCap,
  code: Code,
  globe: Globe,
  heart: Heart,
  folder: Folder,
  award: Award,
  book: BookOpen,
  users: Users,
  academic: Library,
  trophy: Trophy,
  quote: Quote,
  pen: PenLine,
  star: Star,
}

function entryPreview(data: EntryData): string {
  switch (data.type) {
    case 'work':
      return data.jobTitle || data.employer
    case 'education':
      return data.degree || data.school
    case 'skill':
      return data.skill
    case 'language':
      return data.language
    case 'interest':
      return data.interest
    case 'profile':
      return data.text
    case 'project':
      return data.projectTitle
    case 'certificate':
      return data.title
    case 'reference':
      return data.name
    case 'declaration':
      return data.text
    default:
      return data.title
  }
}

interface SectionAccordionProps {
  sections: TSection[]
  onSectionToggle: (sectionId: string, hidden: boolean) => void
  onSectionReorder: (sectionIds: string[]) => void
  onAddEntry: (sectionId: string) => void
  onSectionDelete: (sectionId: string) => void
  onSectionEditTitle: (sectionId: string, newTitle: string) => void
}

export default function SectionAccordion({
  sections,
  onSectionToggle,
  onSectionReorder,
  onAddEntry,
  onSectionDelete,
  onSectionEditTitle,
}: SectionAccordionProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onSectionReorder(arrayMove(sections, oldIndex, newIndex).map((s) => s.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="w-full space-y-2">
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              onSectionToggle={onSectionToggle}
              onAddEntry={onAddEntry}
              onSectionDelete={onSectionDelete}
              onSectionEditTitle={onSectionEditTitle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SectionRowProps {
  section: TSection
  onSectionToggle: (sectionId: string, hidden: boolean) => void
  onAddEntry: (sectionId: string) => void
  onSectionDelete: (sectionId: string) => void
  onSectionEditTitle: (sectionId: string, newTitle: string) => void
}

function SectionRow({
  section,
  onSectionToggle,
  onAddEntry,
  onSectionDelete,
  onSectionEditTitle,
}: SectionRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const Icon = ICON_MAP[section.iconKey] || Folder

  const startEdit = () => {
    setDraft(section.displayName)
    setEditing(true)
  }

  const commitEdit = () => {
    const title = draft.trim()
    setEditing(false)
    if (title && title !== section.displayName) {
      onSectionEditTitle(section.id, title)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-border bg-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="cursor-grab touch-none text-muted-foreground/60 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
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
            <span className="truncate text-sm font-semibold text-foreground">{section.displayName}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={startEdit}>
            <Pencil className="size-3" />
          </Button>
          <Checkbox
            checked={!section.hidden}
            onCheckedChange={(v) => onSectionToggle(section.id, !v)}
            aria-label={section.hidden ? 'Show section' : 'Hide section'}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => onSectionDelete(section.id)}
          >
            <Trash2 className="size-3" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen((o) => !o)}>
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border/60 p-3">
          {section.entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <span className="line-clamp-1 flex-1 text-xs text-muted-foreground">
                {entryPreview(entry.data)}
              </span>
              {entry.hidden && (
                <span className="text-[10px] uppercase text-muted-foreground">hidden</span>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onAddEntry(section.id)}>
            <Plus className="mr-1 size-3" /> Add Entry
          </Button>
        </div>
      )}
    </div>
  )
}
