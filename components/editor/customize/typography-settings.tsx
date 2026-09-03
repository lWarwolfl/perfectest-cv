'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Type } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import type { Customization } from '@/features/resume/types'

interface TypographySettingsProps {
  customization: Customization
  onPatch: (patch: Partial<Customization['spacing']>) => void
  onFontChange: (patch: Partial<Customization['font']>) => void
}

const FONT_FAMILIES = [
  { group: 'Sans-Serif', value: 'Inter' },
  { group: 'Sans-Serif', value: 'Roboto' },
  { group: 'Sans-Serif', value: 'Arial' },
  { group: 'Serif', value: 'Lora' },
  { group: 'Serif', value: 'Merriweather' },
  { group: 'Serif', value: 'Garamond' },
  { group: 'Monospace', value: 'Geist Mono' },
  { group: 'Monospace', value: 'JetBrains Mono' },
] as const

const LINE_HEIGHTS = [
  { value: '1', label: 'Compact (1.3)' },
  { value: '3', label: 'Normal (1.5)' },
  { value: '5', label: 'Relaxed (1.7)' },
] as const

export default function TypographySettings({ customization, onPatch, onFontChange }: TypographySettingsProps) {
  const spacing = customization.spacing
  return (
    <CustomizeCard title="Typography & Spacing" icon={Type} description="Fonts, sizes and vertical rhythm.">
      <div className="space-y-2">
        <Label>Font family</Label>
        <Select value={customization.font.fontFamily} onValueChange={(v) => onFontChange({ fontFamily: v || 'Inter', selected: 'custom' })}>
          <SelectTrigger className="w-full" style={{ fontFamily: customization.font.fontFamily }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Sans-Serif', 'Serif', 'Monospace'].map((group) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {FONT_FAMILIES.filter((f) => f.group === group).map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    <span style={{ fontFamily: f.value }}>{f.value}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Overall font size</Label>
          <span className="text-sm font-semibold text-foreground">{10 + Number(spacing.fontSize)}pt</span>
        </div>
        <Input
          type="range"
          min={0}
          max={8}
          value={spacing.fontSize}
          onChange={(e) => onPatch({ fontSize: e.target.value })}
          className="accent-primary"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Name size</Label>
          <span className="text-sm font-semibold text-foreground">{spacing.nameFontSizePt}pt</span>
        </div>
        <Input
          type="range"
          min={16}
          max={40}
          value={spacing.nameFontSizePt}
          onChange={(e) => onPatch({ nameFontSizePt: Number(e.target.value) })}
          className="accent-primary"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Job title size</Label>
          <span className="text-sm font-semibold text-foreground">{spacing.jobTitleFontSizePt}pt</span>
        </div>
        <Input
          type="range"
          min={10}
          max={30}
          value={spacing.jobTitleFontSizePt}
          onChange={(e) => onPatch({ jobTitleFontSizePt: Number(e.target.value) })}
          className="accent-primary"
        />
      </div>
      <div className="space-y-2">
        <Label>Line height</Label>
        <div className="grid grid-cols-3 gap-2">
          {LINE_HEIGHTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPatch({ lineHeight: option.value })}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                spacing.lineHeight === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </CustomizeCard>
  )
}
