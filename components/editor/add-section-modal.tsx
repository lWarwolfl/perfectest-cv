'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SECTION_LABELS } from '@/features/resume/defaults'
import type { SectionType } from '@/features/resume/types'
import { Plus } from 'lucide-react'

interface AddSectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSection: (sectionType: SectionType) => void
}

export default function AddSectionModal({
  open,
  onOpenChange,
  onAddSection,
}: AddSectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>Choose a section type to add to your resume.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto -mr-4 pr-6">
          {(Object.keys(SECTION_LABELS) as SectionType[]).map((type) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onAddSection(type)
                onOpenChange(false)
              }}
            >
              <Plus className="mr-2 size-4" />
              {SECTION_LABELS[type]}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
