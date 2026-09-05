'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LabeledInput } from '@/components/ui/labeled'

export function CreateCard({ label, buttonLabel, className, pending, onCreate }: {
  label: string
  buttonLabel: string
  className?: string
  pending?: boolean
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  return (
    <div className={`flex flex-col gap-2 rounded-lg border-2 border-dashed p-3 ${className || ''}`}>
      <LabeledInput label={label} hideLabel placeholder={label} value={name} onChange={(e) => setName(e.target.value)} />
      <Button variant="outline" onClick={() => { onCreate(name.trim()); setName('') }} disabled={pending}>
        <Plus className="size-4" /> {buttonLabel}
      </Button>
    </div>
  )
}
