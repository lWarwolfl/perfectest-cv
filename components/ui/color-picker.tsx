'use client'

import { HexColorPicker } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LabeledInput } from '@/components/ui/labeled'
import { cn } from '@/lib/utils'

export function ColorPicker({ value, onChange, className }: {
  value: string
  onChange: (hex: string) => void
  className?: string
}) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'
  return (
    <Popover>
      <PopoverTrigger
        className={cn('size-7 shrink-0 cursor-pointer rounded-lg border border-border shadow-inner', className)}
        style={{ backgroundColor: value || '#ffffff' }}
        aria-label="Pick color"
      />
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={safe} onChange={onChange} />
        <LabeledInput label="Hex value" hideLabel value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full font-mono text-xs" />
      </PopoverContent>
    </Popover>
  )
}
