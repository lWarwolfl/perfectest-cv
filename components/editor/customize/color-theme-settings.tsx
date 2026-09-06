'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPicker } from '@/components/ui/color-picker'
import type { Customization } from '@/features/resume/types'

interface ColorThemeSettingsProps {
  customization: Customization
  onPatch: (patch: Partial<Customization['colors']>) => void
  onApplyAccentPatch: (patch: Partial<Customization['applyAccentColor']>) => void
}

const PRESET_ACCENTS = [
  '#044cb5',
  '#0891b2',
  '#ea580c',
  '#4a7c59',
  '#b91c1c',
  '#475569',
  '#1e293b',
  '#7c3aed',
]

function HexField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <ColorPicker value={value} onChange={onChange} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 font-mono text-xs"
      />
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

export default function ColorThemeSettings({
  customization,
  onPatch,
  onApplyAccentPatch,
}: ColorThemeSettingsProps) {
  const basic = customization.colors.basic
  const [customOpen, setCustomOpen] = useState(false)

  const setSingle = (hex: string) =>
    onPatch({
      mode: 'basic',
      basic: { ...basic, single: hex, singleCustom: hex, selected: 'single' },
    })

  return (
    <CustomizeCard
      title="Colors"
      icon={Palette}
      description="Accent color applied across the document."
    >
      <div className="grid grid-cols-6 gap-2.5">
        {PRESET_ACCENTS.map((hex) => (
          <button
            key={hex}
            type="button"
            className={`flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${
              basic.single === hex ? 'ring-primary ring-2 ring-offset-2' : ''
            }`}
            style={{ backgroundColor: hex }}
            onClick={() => setSingle(hex)}
            aria-label={`Accent ${hex}`}
          />
        ))}
      </div>
      <button
        type="button"
        className="text-primary text-xs font-medium hover:underline"
        onClick={() => setCustomOpen((o) => !o)}
      >
        {customOpen ? 'Hide custom colors' : 'Custom colors'}
      </button>
      {customOpen && (
        <div className="space-y-2">
          <HexField
            label="Accent"
            value={basic.singleCustom}
            onChange={(hex) =>
              onPatch({
                mode: 'basic',
                basic: { ...basic, single: hex, singleCustom: hex, selected: 'single' },
              })
            }
          />
          <HexField
            label="Text"
            value={basic.multi.textColor}
            onChange={(hex) =>
              onPatch({
                mode: 'basic',
                basic: { ...basic, selected: 'multi', multi: { ...basic.multi, textColor: hex } },
              })
            }
          />
          <HexField
            label="Accent (multi)"
            value={basic.multi.accentColor}
            onChange={(hex) =>
              onPatch({
                mode: 'basic',
                basic: { ...basic, selected: 'multi', multi: { ...basic.multi, accentColor: hex } },
              })
            }
          />
          <HexField
            label="Background"
            value={basic.multi.backgroundColor}
            onChange={(hex) =>
              onPatch({
                mode: 'basic',
                basic: {
                  ...basic,
                  selected: 'multi',
                  multi: { ...basic.multi, backgroundColor: hex },
                },
              })
            }
          />
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Apply accent color to</Label>
        {(
          [
            ['name', 'Name'],
            ['jobTitle', 'Job title'],
            ['dates', 'Dates'],
            ['headings', 'Section headings'],
            ['icons', 'Icons'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={customization.applyAccentColor[key]}
              onCheckedChange={(v) => onApplyAccentPatch({ [key]: v === true })}
            />
            {label}
          </label>
        ))}
      </div>
    </CustomizeCard>
  )
}
