'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RichTextEditor from '@/components/editor/rich-text-editor'
import LinkPopover from '@/components/editor/link-popover'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, X } from 'lucide-react'
import type { EducationEntry } from '@/features/resume/types'

interface EducationFormProps {
  data: EducationEntry
  onChange: (patch: Partial<EducationEntry>) => void
}

export default function EducationForm({ data, onChange }: EducationFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edu-degree">Degree</Label>
        <Input
          id="edu-degree"
          placeholder="e.g. Bachelor's Degree, Software Engineering"
          value={data.degree}
          onChange={(e) => onChange({ degree: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-3">
        <Label htmlFor="edu-school" className="shrink-0">School</Label>
        <Input
          id="edu-school"
          placeholder="e.g. University of Tehran"
          value={data.school}
          onChange={(e) => onChange({ school: e.target.value })}
        />
        <LinkPopover
          trigger={
            <Button variant="outline" size="icon" type="button">
              <LinkIcon className="size-3" />
            </Button>
          }
          onLinkSet={(url) => onChange({ schoolLink: url })}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="edu-start">Start Date</Label>
          <div className="relative">
            <Input
              id="edu-start"
              placeholder="MM/YYYY"
              value={data.startDate.onlyYear ? data.startDate.year : `${data.startDate.month}/${data.startDate.year}`.replace(/^\/|\/$/g, '')}
              onChange={(e) => {
                const [m, y] = e.target.value.split('/')
                onChange({ startDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
              }}
            />
            {(data.startDate.year || data.startDate.month) && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => onChange({ startDate: { hide: false, year: '', month: '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="edu-end">End Date</Label>
          <div className="relative">
            <Input
              id="edu-end"
              placeholder="MM/YYYY"
              value={data.endDate.ongoing ? 'Present' : data.endDate.onlyYear ? data.endDate.year : `${data.endDate.month}/${data.endDate.year}`.replace(/^\/|\/$/g, '')}
              onChange={(e) => {
                if (e.target.value.toLowerCase() === 'present') {
                  onChange({ endDate: { hide: false, year: '', month: '', ongoing: true, onlyYear: false, customOngoingWord: 'present' } })
                  return
                }
                const [m, y] = e.target.value.split('/')
                onChange({ endDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
              }}
            />
            {(data.endDate.year || data.endDate.month || data.endDate.ongoing) && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => onChange({ endDate: { hide: false, year: '', month: '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="edu-location">Location</Label>
          <Input
            id="edu-location"
            placeholder="City, Country"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
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
