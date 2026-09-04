'use client'

import { CustomizeCard } from '../customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LayoutGrid } from 'lucide-react'
import type { Customization, SectionDisplay } from '@/features/resume/types'

interface SkillsStyleSettingsProps {
  customization: Customization
  onSectionDisplayPatch: (section: 'skill', patch: Partial<SectionDisplay>) => void
}

const LAYOUT_MODES: { value: SectionDisplay['selected']; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'rows', label: 'Rows' },
  { value: 'compact', label: 'Compact' },
  { value: 'bubble', label: 'Bubble' },
  { value: 'level', label: 'Level' },
]

function SubinfoSelector({ value, onChange }: { value: SectionDisplay['subinfo']; onChange: (v: SectionDisplay['subinfo']) => void }) {
  const options: { value: SectionDisplay['subinfo']; label: string }[] = [
    { value: 'colon', label: ': Colon' },
    { value: 'dash', label: '- Dash' },
    { value: 'bracket', label: '() Bracket' },
  ]
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold text-foreground">Subinfo Style</Label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
              value === o.value
                ? 'border-primary bg-primary/10 font-semibold text-primary'
                : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SkillsStyleSettings({ customization, onSectionDisplayPatch }: SkillsStyleSettingsProps) {
  const display = customization.skill

  function patch(p: Partial<SectionDisplay>) {
    onSectionDisplayPatch('skill', p)
  }

  return (
    <CustomizeCard title="Skills" icon={LayoutGrid} description="Skill list layout and formatting.">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Layout</Label>
        <div className="grid grid-cols-5 gap-2">
          {LAYOUT_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => patch({ selected: m.value })}
              className={`rounded-xl border px-1 py-2 text-xs transition-colors ${
                display.selected === m.value
                  ? 'border-primary bg-primary/10 font-semibold text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {display.selected === 'grid' && (
        <div className="space-y-2">
          <Label className="text-sm font-bold text-foreground">Columns</Label>
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => patch({ grid: { ...display.grid, columns: n } })}
                className={`h-11 flex items-center justify-center gap-0.5 rounded-xl border transition-all ${
                  display.grid.columns === n
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-muted'
                }`}
              >
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i} className="h-4 w-1.5 rounded-[2px] bg-current opacity-70" />
                ))}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="skills-split-commas"
              checked={display.grid.splitCommasIntoBullets}
              onCheckedChange={(v) => patch({ grid: { ...display.grid, splitCommasIntoBullets: v === true } })}
            />
            <Label htmlFor="skills-split-commas" className="cursor-pointer text-sm text-foreground">
              Split commas into bullets
            </Label>
          </div>
        </div>
      )}

      {display.selected === 'rows' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">Row Spacing</Label>
            <div className="grid w-3/4 grid-cols-2 gap-3">
              {(['tight', 'spacious'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => patch({ rows: { ...display.rows, spacing: v } })}
                  className={`rounded-xl border px-2 py-2 text-sm capitalize transition-colors ${
                    display.rows.spacing === v
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="skills-row-bullets"
              checked={display.rows.bullets}
              onCheckedChange={(v) => patch({ rows: { ...display.rows, bullets: v === true } })}
            />
            <Label htmlFor="skills-row-bullets" className="cursor-pointer text-sm text-foreground">
              Start rows with bullets
            </Label>
          </div>
          <SubinfoSelector value={display.subinfo} onChange={(v) => patch({ subinfo: v })} />
        </div>
      )}

      {display.selected === 'compact' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">Separator</Label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'bullet', label: 'Bullet ( • )' },
                { value: 'pipe', label: 'Pipe ( | )' },
                { value: 'comma', label: 'Comma ( , )' },
              ] as const).map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => patch({ text: o.value })}
                  className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                    display.text === o.value
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <SubinfoSelector value={display.subinfo} onChange={(v) => patch({ subinfo: v })} />
        </div>
      )}

      {display.selected === 'bubble' && <SubinfoSelector value={display.subinfo} onChange={(v) => patch({ subinfo: v })} />}
    </CustomizeCard>
  )
}
