'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function HelpDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  steps,
  seenKey,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle: string
  steps: { title: string; body: string }[]
  seenKey: string
}) {
  function close() {
    try {
      localStorage.setItem(seenKey, '1')
    } catch {
      // storage unavailable — dialog just closes
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        <ol className="-mx-4 max-h-[50vh] space-y-3 overflow-y-auto px-4 py-1">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-muted-foreground text-xs">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Don&apos;t show again
          </Button>
          <Button onClick={close}>Get started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
