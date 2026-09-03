'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichTextEditor from '@/components/editor/rich-text-editor'
import LinkPopover from '@/components/editor/link-popover'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon } from 'lucide-react'
import type { InterestEntry } from '@/features/resume/types'

interface InterestFormProps {
  data: InterestEntry
  onChange: (patch: Partial<InterestEntry>) => void
}

export default function InterestForm({ data, onChange }: InterestFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="interest-name" className="shrink-0">Interest</Label>
        <Input
          id="interest-name"
          placeholder="e.g. Three.js"
          value={data.interest}
          onChange={(e) => onChange({ interest: e.target.value })}
        />
        <LinkPopover
          trigger={
            <Button variant="outline" size="icon" type="button">
              <LinkIcon className="size-3" />
            </Button>
          }
          onLinkSet={(url) => onChange({ interestLink: url })}
        />
      </div>
      <div>
        <Label>Additional information</Label>
        <RichTextEditor value={data.infoHtml} onUpdate={(html) => onChange({ infoHtml: html })} />
      </div>
    </div>
  )
}
