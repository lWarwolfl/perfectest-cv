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

export const RESUME_HELP_SEEN_KEY = 'perfectest-cv:resume-help-seen'

const STEPS = [
  {
    title: 'Start from the sample content',
    body: 'Your resume is prefilled with example content from the template. Click any entry to replace it with your own experience.',
  },
  {
    title: 'Fill in personal details',
    body: 'Open Personal details at the top of the sidebar to set your name, title, and contact links.',
  },
  {
    title: 'Add sections and entries',
    body: 'Use Add entry inside a section, or Add section at the bottom, to grow your resume. Trash icons delete — always with a confirmation.',
  },
  {
    title: 'Polish the design',
    body: 'Switch to the Design tab or apply another template to change fonts, colors, and layout.',
  },
  {
    title: 'Download or share',
    body: 'Use Download PDF in the header when ready, or Share to publish a live web resume.',
  },
]

export function ResumeHelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  function close(seen: boolean) {
    if (seen) {
      try {
        localStorage.setItem(RESUME_HELP_SEEN_KEY, '1')
      } catch {
        // storage unavailable — dialog just closes
      }
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close(true)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How to build your resume</DialogTitle>
          <DialogDescription>
            Five quick steps — your template already gave you a head start with sample content.
          </DialogDescription>
        </DialogHeader>
        <ol className="-mx-4 max-h-[50vh] space-y-3 overflow-y-auto px-4 py-1">
          {STEPS.map((s, i) => (
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
          <Button variant="ghost" onClick={() => close(true)}>
            Don&apos;t show again
          </Button>
          <Button onClick={() => close(true)}>Get started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
