'use client'

import { UserRound } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import type { Customization } from '@/features/resume/types'

interface HeaderTitleSettingsProps {
  customization: Customization
  onHeaderPatch: (patch: Partial<Customization['header']>) => void
  onHeadingPatch: (patch: Partial<Customization['heading']>) => void
}

const POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const

const HEADING_STYLES = [
  { value: 'line', label: 'Line' },
  { value: 'box', label: 'Box' },
  { value: 'underline', label: 'Underline' },
  { value: 'simple', label: 'Simple' },
  { value: 'topBottomLine', label: 'Top & Bottom' },
  { value: 'thickShortUnderline', label: 'Thick Short' },
] as const

const PHOTO_SHAPES = [
  { value: 'round', label: 'Circle' },
  { value: 'squareRounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'portrait', label: 'Portrait' },
] as const

export default function HeaderTitleSettings({
  customization,
  onHeaderPatch,
  onHeadingPatch,
}: HeaderTitleSettingsProps) {
  const header = customization.header
  const heading = customization.heading
  return (
    <CustomizeCard title="Header & Titles" icon={UserRound} description="Header placement, photo and section title styling.">
      <div className="space-y-2">
        <Label>Header position</Label>
        <div className="grid grid-cols-3 gap-2">
          {POSITIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onHeaderPatch({ position: option.value })}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                header.position === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>Show photo</Label>
        <Switch checked={header.photo.show} onCheckedChange={(v) => onHeaderPatch({ photo: { ...header.photo, show: v === true } })} />
      </div>
      {header.photo.show && (
        <>
          <div className="space-y-2">
            <Label>Photo shape</Label>
            <div className="grid grid-cols-4 gap-2">
              {PHOTO_SHAPES.map((shape) => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => onHeaderPatch({ photo: { ...header.photo, shape: shape.value } })}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    header.photo.shape === shape.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Grayscale photo</Label>
            <Switch checked={header.photo.grayscale} onCheckedChange={(v) => onHeaderPatch({ photo: { ...header.photo, grayscale: v === true } })} />
          </div>
        </>
      )}
      <div className="flex items-center justify-between">
        <Label>Accentuate name</Label>
        <Switch checked={header.accentuateName} onCheckedChange={(v) => onHeaderPatch({ accentuateName: v === true })} />
      </div>
      <div className="space-y-2">
        <Label>Section heading style</Label>
        <div className="grid grid-cols-3 gap-2">
          {HEADING_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onHeadingPatch({ style: style.value })}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                heading.style === style.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Heading capitalization</Label>
        <div className="grid grid-cols-2 gap-2">
          {(['uppercase', 'capitalize'] as const).map((cap) => (
            <button
              key={cap}
              type="button"
              onClick={() => onHeadingPatch({ capitalization: cap })}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                heading.capitalization === cap
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {cap === 'uppercase' ? 'UPPERCASE' : 'Title Case'}
            </button>
          ))}
        </div>
      </div>
      <div className="hidden">
        <Input />
      </div>
    </CustomizeCard>
  )
}
