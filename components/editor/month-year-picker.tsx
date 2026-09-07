'use client'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => String(CURRENT_YEAR - i))

/**
 * Month/year picker (no days) built on Base UI Popover + Select.
 * value: "MM/YYYY"; parts may be empty ("", "2026", "04/2026").
 */
export default function MonthYearPicker({
  value,
  onChange,
  placeholder = 'MM/YYYY',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [m, y] = value.split('/')
  const label =
    m && y
      ? format(new Date(Number(y), Number(m) - 1, 1), 'MM/yyyy')
      : y || ''
  const set = (nm: string, ny: string) =>
    onChange([nm, ny].join('/').replace(/^\/|\/$/g, ''))
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between font-normal"
          >
            <span className={label ? '' : 'text-muted-foreground'}>{label || placeholder}</span>
            <CalendarDays className="text-muted-foreground size-4" />
          </Button>
        }
      />
      <PopoverContent className="w-72 space-y-2">
        <div className="flex gap-2">
          <Select value={m || undefined} onValueChange={(v) => set(v || '', y || '')}>
            <SelectTrigger className="min-w-0 flex-1">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={name} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={y || undefined} onValueChange={(v) => set(m || '', v || '')}>
            <SelectTrigger className="w-24 shrink-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="xs"
          className="w-full"
          onClick={() => onChange('')}
        >
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  )
}
