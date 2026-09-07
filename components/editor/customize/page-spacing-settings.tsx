'use client'

import { FileText } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import StepperSlider from './stepper-slider'
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
    <CustomizeCard
      title="Page Setup"
      icon={FileText}
      description="Paper size, margins and density."
    >
      <div className="space-y-2">
        <Label>Paper size</Label>
        <Select
          value={regional.pageFormat}
          onValueChange={(v) =>
            onRegionalPatch({ pageFormat: v === 'US Letter' ? 'US Letter' : 'A4' })
          }
        >
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
        <Label>List markers</Label>
        <Select
          value={regional.listMarker ?? 'disc'}
          onValueChange={(v) => onRegionalPatch({ listMarker: v === 'dash' ? 'dash' : 'disc' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="disc">Dots (•)</SelectItem>
            <SelectItem value="dash">Dashes (–)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Top / bottom margin</Label>
          <span className="text-foreground text-sm font-semibold">
            {14 + Number(spacing.marginVertical) * 3}px
          </span>
        </div>
        <StepperSlider
          min={0}
          max={6}
          value={Number(spacing.marginVertical)}
          onChange={(v) => onPatch({ marginVertical: String(v) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Left / right margin</Label>
          <span className="text-foreground text-sm font-semibold">
            {16 + Number(spacing.marginHorizontal) * 3}px
          </span>
        </div>
        <StepperSlider
          min={0}
          max={6}
          value={Number(spacing.marginHorizontal)}
          onChange={(v) => onPatch({ marginHorizontal: String(v) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Section gap</Label>
          <span className="text-foreground text-sm font-semibold">
            {Number(spacing.spacingFactor) * 2}px
          </span>
        </div>
        <StepperSlider
          min={0}
          max={10}
          value={Number(spacing.spacingFactor)}
          onChange={(v) => onPatch({ spacingFactor: String(v) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Entry gap</Label>
          <span className="text-foreground text-sm font-semibold">
            {Number(spacing.entryGap ?? 4) * 2}px
          </span>
        </div>
        <StepperSlider
          min={0}
          max={10}
          value={Number(spacing.entryGap ?? 4)}
          onChange={(v) => onPatch({ entryGap: String(v) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Heading gap</Label>
          <span className="text-foreground text-sm font-semibold">
            {Number(spacing.headingGap ?? 3) * 2}px
          </span>
        </div>
        <StepperSlider
          min={0}
          max={10}
          value={Number(spacing.headingGap ?? 3)}
          onChange={(v) => onPatch({ headingGap: String(v) })}
        />
      </div>
    </CustomizeCard>
  )
}
