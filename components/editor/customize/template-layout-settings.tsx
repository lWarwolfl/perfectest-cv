'use client'

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Columns2, GripVertical, RectangleHorizontal, Rows3 } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Customization, TSection } from '@/features/resume/types'

interface TemplateLayoutSettingsProps {
  customization: Customization
  sections: TSection[]
  onPatch: (patch: Partial<Customization['layout']>) => void
  onReorderSections: (sectionIds: string[]) => void
  onToggleSection: (sectionId: string, hidden: boolean) => void
  showLayoutOptions?: boolean
}

const LAYOUT_OPTIONS = [
  { value: 'one', label: 'Single Column', icon: RectangleHorizontal },
  { value: 'two', label: 'Two Column', icon: Columns2 },
] as const

function SortableSectionRow({
  section,
  onToggle,
}: {
  section: TSection
  onToggle: (sectionId: string, hidden: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="cursor-grab touch-none text-muted-foreground/60 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="flex-1 truncate text-sm">{section.displayName}</span>
      <Switch checked={!section.hidden} onCheckedChange={(v) => onToggle(section.id, !v)} />
    </div>
  )
}

export default function TemplateLayoutSettings({
  customization,
  sections,
  onPatch,
  onReorderSections,
  onToggleSection,
  showLayoutOptions = true,
}: TemplateLayoutSettingsProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorderSections(arrayMove(sections, oldIndex, newIndex).map((s) => s.id))
  }

  const two = customization.layout.two

  return (
    <CustomizeCard title="Template & Layout" icon={Rows3} description={showLayoutOptions ? 'Choose the overall architecture of your resume.' : 'Layout of your cover letter.'}>
      {showLayoutOptions && (
        <div className="grid grid-cols-2 gap-3">
          {LAYOUT_OPTIONS.map((option) => {
            const active = customization.layout.selected === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPatch({ selected: option.value })}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors ${
                  active ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <option.icon className="size-8" />
                {option.label}
              </button>
            )
          })}
        </div>
      )}
      {showLayoutOptions && customization.layout.selected === 'two' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Column width ratio</Label>
          <div className="flex items-center gap-3">
            <Input
              type="range"
              min={20}
              max={80}
              value={two.leftWidth}
              onChange={(e) => onPatch({ two: { ...two, leftWidth: Number(e.target.value), rightWidth: 100 - Number(e.target.value) } })}
              className="flex-1 accent-primary"
            />
            <span className="w-16 text-right text-sm font-semibold text-foreground">
              {two.leftWidth}/{two.rightWidth}
            </span>
          </div>
        </div>
      )}
      {sections.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Section order & visibility</Label>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionRow key={section.id} section={section} onToggle={onToggleSection} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </CustomizeCard>
  )
}
