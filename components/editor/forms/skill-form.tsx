'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RichTextEditor from '@/components/editor/rich-text-editor'
import type { SkillEntry } from '@/features/resume/types'

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

interface SkillFormProps {
  data: SkillEntry
  onChange: (patch: Partial<SkillEntry>) => void
}

export default function SkillForm({ data, onChange }: SkillFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="skill-name">Skill</Label>
        <Input
          id="skill-name"
          placeholder="e.g. Next.js"
          value={data.skill}
          onChange={(e) => onChange({ skill: e.target.value })}
        />
      </div>
      <div>
        <Label>Information / Sub-skills</Label>
        <RichTextEditor value={data.infoHtml} onUpdate={(html) => onChange({ infoHtml: html })} />
      </div>
      <div>
        <Label>Skill level</Label>
        <Select value={data.level} onValueChange={(v) => onChange({ level: v || '' })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            {SKILL_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
