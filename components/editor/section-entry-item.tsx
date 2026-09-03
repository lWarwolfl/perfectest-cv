'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react'
import type { TEntry } from '@/features/resume/types'

interface SectionEntryItemProps {
  entry: TEntry
  onToggleVisibility: (entryId: string, hidden: boolean) => void
  onDeleteEntry: (entryId: string) => void
}

function entryPreview(data: TEntry['data']): string {
  if ('jobTitle' in data && data.jobTitle) return data.jobTitle
  if ('degree' in data && data.degree) return data.degree
  if ('skill' in data && data.skill) return data.skill
  if ('language' in data && data.language) return data.language
  if ('interest' in data && data.interest) return data.interest
  if ('projectTitle' in data && data.projectTitle) return data.projectTitle
  if ('title' in data && data.title) return data.title
  if ('text' in data && data.text) {
    return data.text.length > 50 ? `${data.text.substring(0, 50)}...` : data.text
  }
  return 'Entry preview'
}

export default function SectionEntryItem({
  entry,
  onToggleVisibility,
  onDeleteEntry,
}: SectionEntryItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
      <div className="flex shrink-0 items-center gap-2">
        <GripVertical className="size-4 cursor-grab text-muted-foreground/60" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="line-clamp-1 text-xs text-muted-foreground">{entryPreview(entry.data)}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleVisibility(entry.id, !entry.hidden)}
              >
                {entry.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              </Button>
            }
          />
          <TooltipContent sideOffset={4}>{entry.hidden ? 'Show entry' : 'Hide entry'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => onDeleteEntry(entry.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            }
          />
          <TooltipContent sideOffset={4}>Delete entry</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
