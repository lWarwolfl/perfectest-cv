'use client'

import { HelpDialog } from '@/components/editor/help-dialog'

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
  return (
    <HelpDialog
      open={open}
      onOpenChange={onOpenChange}
      title="How to build your resume"
      subtitle="Five quick steps — your template already gave you a head start with sample content."
      steps={STEPS}
      seenKey={RESUME_HELP_SEEN_KEY}
    />
  )
}
