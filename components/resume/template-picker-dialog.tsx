'use client'

import { useState } from 'react'
import { FilePlus2, Search } from 'lucide-react'
import { RESUME_TEMPLATES } from '@/features/resume/templates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

export function TemplatePickerDialog({
  open,
  onOpenChange,
  pendingId,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingId?: string | null
  onPick: (templateId: string) => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const templates = q
    ? RESUME_TEMPLATES.filter((t) =>
        [t.name, t.description, ...t.tags].join(' ').toLowerCase().includes(q)
      )
    : RESUME_TEMPLATES

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            Your resume comes prefilled with sample content you can replace with your own.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            aria-label="Search templates"
            className="pl-8"
          />
        </div>
        <div className="-mx-4 max-h-[50vh] space-y-2 overflow-y-auto px-4 py-1">
          {templates.map((t) => (
            <div
              key={t.id}
              className="border-border bg-card flex items-start justify-between gap-3 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground line-clamp-2 text-xs">{t.description}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                disabled={!!pendingId}
                onClick={() => onPick(t.id)}
                aria-label={`Create a resume from the ${t.name} template`}
              >
                {pendingId === t.id ? <Spinner className="size-4" /> : <FilePlus2 className="size-4" />}
                Use
              </Button>
            </div>
          ))}
          {templates.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No templates match &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
