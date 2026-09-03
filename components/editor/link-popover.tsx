'use client'

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check } from 'lucide-react'

interface LinkPopoverProps {
  trigger: React.ReactElement
  onLinkSet: (url: string) => void
}

export default function LinkPopover({ trigger, onLinkSet }: LinkPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    onLinkSet(finalUrl)
    setUrl('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-80 rounded-2xl border border-border bg-card p-2 shadow-xl">
        <span className="mb-1.5 block text-sm font-bold text-foreground">Link URL</span>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            className="flex-1"
          />
          <Button
            type="submit"
            className="size-10 shrink-0 rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95"
          >
            <Check className="size-5 stroke-[2.5] text-white" />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
