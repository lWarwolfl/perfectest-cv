'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

type LabeledProps = { label: string; hideLabel?: boolean; labelClassName?: string }

export function LabeledInput({ label, hideLabel, id, labelClassName, ...props }: React.ComponentProps<typeof Input> & LabeledProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <Field>
      <FieldLabel htmlFor={inputId} className={cn(hideLabel && 'sr-only', labelClassName)}>{label}</FieldLabel>
      <Input id={inputId} {...props} />
    </Field>
  )
}

export function LabeledTextarea({ label, hideLabel, id, labelClassName, ...props }: React.ComponentProps<typeof Textarea> & LabeledProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <Field>
      <FieldLabel htmlFor={inputId} className={cn(hideLabel && 'sr-only', labelClassName)}>{label}</FieldLabel>
      <Textarea id={inputId} {...props} />
    </Field>
  )
}
