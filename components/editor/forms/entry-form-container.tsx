'use client'

import * as React from 'react'
import { Eye, EyeOff, Lightbulb, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface EntryFormContainerProps {
  title?: string
  visible: boolean
  onToggleVisible: () => void
  onDelete: () => void
  onDone: () => void
  children: React.ReactNode
}

export default function EntryFormContainer({
  title = 'Edit Entry',
  visible,
  onToggleVisible,
  onDelete,
  onDone,
  children,
}: EntryFormContainerProps) {
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 p-6 pb-4">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Lightbulb className="size-3.5" />
            Get Tips
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-9 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground"
            onClick={onToggleVisible}
            aria-label={visible ? 'Hide entry' : 'Show entry'}
          >
            {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-9 rounded-xl bg-muted/60 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete entry"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <div className="max-h-[calc(100vh-220px)] space-y-4 overflow-y-auto p-6">{children}</div>
      <div className="sticky bottom-0 left-0 right-0 z-10 flex justify-center border-t border-border/60 bg-background/80 p-4 backdrop-blur-md">
        <Button
          onClick={onDone}
          className="flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 font-bold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-95"
        >
          Done
        </Button>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete entry?</DialogTitle>
              <DialogDescription>
                This will permanently remove this entry from your resume.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmOpen(false)
                  onDelete()
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
