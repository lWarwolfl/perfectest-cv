'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LabeledInput } from '@/components/ui/labeled'
import { Link as LinkIcon, Link2Off } from 'lucide-react'

interface LinkDialogProps {
  value: string
  onConfirm: (url: string) => void
}

export default function LinkDialog({ value, onConfirm }: LinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (open) setUrl(value)
  }, [open, value])

  const confirm = (next: string) => {
    onConfirm(next.trim())
    setOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = url.trim()
    confirm(
      trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : trimmed ? `https://${trimmed}` : ''
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        type="button"
        aria-label={value ? 'Edit link' : 'Add link'}
        className={value ? 'text-primary' : ''}
        onClick={() => setOpen(true)}
      >
        <LinkIcon className="size-3" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add link</DialogTitle>
            <DialogDescription>
              Point this title at a URL. Leave it empty to remove the link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <LabeledInput
              label="Link URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. github.com/user"
              autoFocus
            />
            <DialogFooter>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => confirm('')}
                >
                  <Link2Off className="size-4" /> Remove
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
