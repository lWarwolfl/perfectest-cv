'use client'

import { HelpDialog } from '@/components/editor/help-dialog'

export const LETTER_HELP_SEEN_KEY = 'perfectest-cv:letter-help-seen'

const STEPS = [
  {
    title: 'Start from the sample content',
    body: 'Your letter is prefilled with example sender details, recipient, subject, and body from the template. Open each block to replace it with your own.',
  },
  {
    title: 'Fill in sender details',
    body: 'Open Sender details first — or copy them over from one of your resumes in one click.',
  },
  {
    title: 'Address it',
    body: 'Set the recipient, add a subject line, and pick the date format hiring managers expect.',
  },
  {
    title: 'Write the body and signature',
    body: 'Keep the body to 3–4 short paragraphs: why this role, why you, and a clear call to action. Then sign it.',
  },
  {
    title: 'Polish, download, or share',
    body: 'Switch to the Design tab or copy a resume design for a matching set — then Download PDF or Share.',
  },
]

export function LetterHelpDialog({
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
      title="How to write your cover letter"
      subtitle="Five quick steps — your template already gave you a head start with sample content."
      steps={STEPS}
      seenKey={LETTER_HELP_SEEN_KEY}
    />
  )
}
