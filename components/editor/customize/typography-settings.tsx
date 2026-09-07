'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import StepperSlider from './stepper-slider'
import { Label } from '@/components/ui/label'
import { Type } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import type { Customization } from '@/features/resume/types'
import { FONTS, fontCss } from '@/features/resume/fonts'

interface TypographySettingsProps {
  customization: Customization
  onPatch: (patch: Partial<Customization['spacing']>) => void
  onFontChange: (patch: Partial<Customization['font']>) => void
}

export default function TypographySettings({
  customization,
  onPatch,
  onFontChange,
}: TypographySettingsProps) {
  const spacing = customization.spacing
  return (
    <CustomizeCard
      title="Typography & Spacing"
      icon={Type}
      description="Fonts, sizes and vertical rhythm."
    >
      <div className="space-y-2">
        <Label>Font family</Label>
        <Select
          value={customization.font.fontFamily}
          onValueChange={(v) => onFontChange({ fontFamily: v || 'Inter', selected: 'custom' })}
        >
          <SelectTrigger className="w-full" style={{ fontFamily: fontCss(customization.font.fontFamily) }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Sans-Serif', 'Serif', 'Monospace'].map((group) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {FONTS.filter((f) => f.group === group).map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    <span style={{ fontFamily: fontCss(f.value) }}>{f.value}</span>
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
          <span className="text-foreground text-sm font-semibold">
            {Math.round((10 + Number(spacing.fontSize) * 0.5) * 10) / 10}pt
          </span>
        </div>
        <StepperSlider
          min={0}
          max={14}
          value={Number(spacing.fontSize)}
          onChange={(v) => onPatch({ fontSize: String(v) })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Name size</Label>
          <span className="text-foreground text-sm font-semibold">{spacing.nameFontSizePt}pt</span>
        </div>
        <StepperSlider
          min={16}
          max={40}
          value={spacing.nameFontSizePt}
          onChange={(v) => onPatch({ nameFontSizePt: v })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Job title size</Label>
          <span className="text-foreground text-sm font-semibold">
            {spacing.jobTitleFontSizePt}pt
          </span>
        </div>
        <StepperSlider
          min={10}
          max={30}
          value={spacing.jobTitleFontSizePt}
          onChange={(v) => onPatch({ jobTitleFontSizePt: v })}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line height</Label>
          <span className="text-foreground text-sm font-semibold">
            {(1.2 + Number(spacing.lineHeight) * 0.1).toFixed(1)}
          </span>
        </div>
        <StepperSlider
          min={0}
          max={8}
          value={Number(spacing.lineHeight)}
          onChange={(v) => onPatch({ lineHeight: String(v) })}
        />
      </div>
    </CustomizeCard>
  )
}
