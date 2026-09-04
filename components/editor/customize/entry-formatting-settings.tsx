'use client'

import { List, FileText } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Customization } from '@/features/resume/types'

interface EntryFormattingSettingsProps {
  customization: Customization
  onEntryLayoutPatch: (patch: Partial<Customization['entryLayout']>) => void
  onRegionalPatch: (patch: Partial<Customization['regional']>) => void
  onFileNameChange: (fileName: string) => void
  onReset: () => void
}

export default function EntryFormattingSettings({
  customization,
  onEntryLayoutPatch,
  onRegionalPatch,
  onFileNameChange,
  onReset,
}: EntryFormattingSettingsProps) {
  return (
    <CustomizeCard title="Dates & Download" icon={List} description="Date formats, positions and download file name.">
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
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <FileText className="size-3.5" /> Download file name
        </Label>
        <Input
          value={customization.fileName || ''}
          onChange={(e) => onFileNameChange(e.target.value)}
          placeholder="Resume.pdf"
        />
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/40 p-4">
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onReset}>
          Reset Customizations
        </Button>
      </div>
    </CustomizeCard>
  )
}
