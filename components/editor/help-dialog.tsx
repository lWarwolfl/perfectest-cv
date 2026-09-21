'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'

const BADGE_GRADIENTS = [
  'from-violet-500 to-purple-500',
  'from-fuchsia-500 to-pink-500',
  'from-orange-400 to-amber-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-500',
  'from-rose-500 to-red-500',
]

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
        <div className="-mx-4 -mt-4 rounded-t-xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 p-4 text-white">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Sparkles className="size-4" />
            {title}
          </p>
          <p className="mt-0.5 text-xs text-white/85">{subtitle}</p>
        </div>
        <ol className="-mx-4 max-h-[50vh] space-y-3 overflow-y-auto px-4 py-1">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${BADGE_GRADIENTS[i % BADGE_GRADIENTS.length]}`}
              >
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
          <Button
            onClick={close}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:from-violet-500 hover:to-fuchsia-400"
          >
            Get started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
