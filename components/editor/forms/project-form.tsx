'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichTextEditor from '@/components/editor/rich-text-editor'
import LinkPopover from '@/components/editor/link-popover'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon } from 'lucide-react'
import type { ProjectEntry } from '@/features/resume/types'

interface ProjectFormProps {
  data: ProjectEntry
  onChange: (patch: Partial<ProjectEntry>) => void
}

function parseDate(value: string): { month: string; year: string } {
  const [m, y] = value.split('/')
  return { month: m || '', year: y || '' }
}

export default function ProjectForm({ data, onChange }: ProjectFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="proj-title" className="shrink-0">Project title</Label>
        <Input
          id="proj-title"
          placeholder="e.g. Perfectest CV"
          value={data.projectTitle}
          onChange={(e) => onChange({ projectTitle: e.target.value })}
        />
        <LinkPopover
          trigger={
            <Button variant="outline" size="icon" type="button">
              <LinkIcon className="size-3" />
            </Button>
          }
          onLinkSet={(url) => onChange({ projectTitleLink: url })}
        />
      </div>
      <div>
        <Label htmlFor="proj-subtitle">Sub title</Label>
        <Input
          id="proj-subtitle"
          placeholder="e.g. Next.js - TypeScript - Tailwind CSS - Drizzle"
          value={data.subTitle}
          onChange={(e) => onChange({ subTitle: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="proj-start">Start Date</Label>
          <Input
            id="proj-start"
            placeholder="MM/YYYY"
            value={`${data.startDate.month}/${data.startDate.year}`.replace(/^\/|\/$/g, '')}
            onChange={(e) => {
              const { month, year } = parseDate(e.target.value)
              onChange({ startDate: { hide: false, year, month, ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
            }}
          />
        </div>
        <div>
          <Label htmlFor="proj-end">End Date</Label>
          <Input
            id="proj-end"
            placeholder="MM/YYYY"
            value={data.endDate.ongoing ? 'Present' : `${data.endDate.month}/${data.endDate.year}`.replace(/^\/|\/$/g, '')}
            onChange={(e) => {
              if (e.target.value.toLowerCase() === 'present') {
                onChange({ endDate: { hide: false, year: '', month: '', ongoing: true, onlyYear: false, customOngoingWord: 'present' } })
                return
              }
              const { month, year } = parseDate(e.target.value)
              onChange({ endDate: { hide: false, year, month, ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
            }}
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <RichTextEditor value={data.description} onUpdate={(html) => onChange({ description: html })} />
      </div>
    </div>
  )
}
