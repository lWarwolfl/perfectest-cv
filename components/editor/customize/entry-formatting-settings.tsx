'use client'

import { List } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { Customization, SectionDisplay } from '@/features/resume/types'

interface EntryFormattingSettingsProps {
  customization: Customization
  onSectionDisplayPatch: (section: 'skill' | 'language' | 'interest' | 'certificate', patch: Partial<SectionDisplay>) => void
  onEntryLayoutPatch: (patch: Partial<Customization['entryLayout']>) => void
  onRegionalPatch: (patch: Partial<Customization['regional']>) => void
  onReset: () => void
}

const SECTION_LABELS: Record<'skill' | 'language' | 'interest' | 'certificate', string> = {
  skill: 'Skills',
  language: 'Languages',
  interest: 'Interests',
  certificate: 'Certificates',
}

const DISPLAY_MODES: { value: SectionDisplay['selected']; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'rows', label: 'Rows' },
  { value: 'compact', label: 'Compact' },
  { value: 'bubble', label: 'Bubble' },
  { value: 'level', label: 'Level bars' },
]

export default function EntryFormattingSettings({
  customization,
  onSectionDisplayPatch,
  onEntryLayoutPatch,
  onRegionalPatch,
  onReset,
}: EntryFormattingSettingsProps) {
  return (
    <CustomizeCard title="Lists & Dates" icon={List} description="Bullet styles, date formats and per-section overrides.">
      <div className="space-y-2">
        <Label>Date format</Label>
        <Select value={customization.regional.dateDisplay} onValueChange={(v) => onRegionalPatch({ dateDisplay: v || 'MM/YYYY' })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MM/YYYY">MM/YYYY (04/2026)</SelectItem>
            <SelectItem value="MMM YYYY">MMM YYYY (Apr 2026)</SelectItem>
            <SelectItem value="YYYY">YYYY (2026)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Date position</Label>
        <Select
          value={customization.entryLayout.displayMode}
          onValueChange={(v) => onEntryLayoutPatch({ displayMode: v as Customization['entryLayout']['displayMode'] })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateLocationRight">Right aligned on title line</SelectItem>
            <SelectItem value="dateLocationLeft">Left of title</SelectItem>
            <SelectItem value="fullWidth">Full width line</SelectItem>
            <SelectItem value="dateContentLocation">Inline with content</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(['language', 'interest', 'certificate'] as const).map((section) => (
        <div key={section} className="space-y-2 rounded-xl border border-border/60 p-3">
          <Label className="text-sm font-semibold">{SECTION_LABELS[section]} style</Label>
          <Select
            value={customization[section].selected}
            onValueChange={(v) => onSectionDisplayPatch(section, { selected: v as SectionDisplay['selected'] })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISPLAY_MODES.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {customization[section].selected === 'grid' && (
            <div className="flex items-center justify-between pt-1">
              <Label className="text-xs text-muted-foreground">Split commas into bullets</Label>
              <Switch
                checked={customization[section].grid.splitCommasIntoBullets}
                onCheckedChange={(v) => onSectionDisplayPatch(section, { grid: { ...customization[section].grid, splitCommasIntoBullets: v === true } })}
              />
            </div>
          )}
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/40 p-4">
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onReset}>
          Reset Customizations
        </Button>
      </div>
    </CustomizeCard>
  )
}
