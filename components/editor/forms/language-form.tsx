'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RichTextEditor from '@/components/editor/rich-text-editor'
import { X } from 'lucide-react'
import type { LanguageEntry } from '@/features/resume/types'

export const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Proficient', 'Intermediate', 'Basic']

interface LanguageFormProps {
  data: LanguageEntry
  onChange: (patch: Partial<LanguageEntry>) => void
}

export default function LanguageForm({ data, onChange }: LanguageFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="lang-name">Language</Label>
        <Input
          id="lang-name"
          placeholder="e.g. English"
          value={data.language}
          onChange={(e) => onChange({ language: e.target.value })}
        />
      </div>
      <div>
        <Label>Additional information</Label>
        <RichTextEditor value={data.infoHtml} onUpdate={(html) => onChange({ infoHtml: html })} />
      </div>
      <div>
        <Label>Language level</Label>
        <div className="flex items-center gap-2">
          <Select value={data.level} onValueChange={(v) => onChange({ level: v || '' })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.level && (
            <button
              type="button"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => onChange({ level: '' })}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
