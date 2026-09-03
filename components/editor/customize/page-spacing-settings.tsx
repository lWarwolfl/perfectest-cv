'use client'

import { FileText } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { Customization } from '@/features/resume/types'

interface PageSpacingSettingsProps {
  customization: Customization
  onPatch: (patch: Partial<Customization['spacing']>) => void
  onRegionalPatch: (patch: Partial<Customization['regional']>) => void
}

export default function PageSpacingSettings({
  customization,
  onPatch,
  onRegionalPatch,
}: PageSpacingSettingsProps) {
  const spacing = customization.spacing
  const regional = customization.regional
  return (
    <CustomizeCard title="Page Setup" icon={FileText} description="Paper size, margins and density.">
      <div className="space-y-2">
        <Label>Paper size</Label>
        <Select value={regional.pageFormat} onValueChange={(v) => onRegionalPatch({ pageFormat: v === 'US Letter' ? 'US Letter' : 'A4' })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
            <SelectItem value="US Letter">US Letter (8.5 × 11 in)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Top / bottom margin</Label>
          <span className="text-sm font-semibold text-foreground">{14 + Number(spacing.marginVertical) * 3}px</span>
        </div>
        <Input
          type="range"
          min={0}
          max={6}
          value={spacing.marginVertical}
          onChange={(e) => onPatch({ marginVertical: e.target.value })}
          className="accent-primary"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Left / right margin</Label>
          <span className="text-sm font-semibold text-foreground">{16 + Number(spacing.marginHorizontal) * 3}px</span>
        </div>
        <Input
          type="range"
          min={0}
          max={6}
          value={spacing.marginHorizontal}
          onChange={(e) => onPatch({ marginHorizontal: e.target.value })}
          className="accent-primary"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Section gap</Label>
          <span className="text-sm font-semibold text-foreground">{Number(spacing.spacingFactor) * 2}px</span>
        </div>
        <Input
          type="range"
          min={0}
          max={10}
          value={spacing.spacingFactor}
          onChange={(e) => onPatch({ spacingFactor: e.target.value })}
          className="accent-primary"
        />
      </div>
    </CustomizeCard>
  )
}
