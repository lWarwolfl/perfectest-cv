'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useListLetterPreviews, useCreateLetter, useDeleteLetter, useDuplicateLetter } from '@/features/letter/hooks/letter.hooks'
import { useShareLetter } from '@/features/share/share.hooks'
import { Button } from '@/components/ui/button'
import { CreateCard } from '@/components/common/create-card'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ShareButton } from '@/components/common/share-button'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { normalizeLetterDesign } from '@/features/letter/types'

export default function LettersPage() {
  const { data: letters, isLoading } = useListLetterPreviews()
  const create = useCreateLetter()
  const del = useDeleteLetter()
  const dup = useDuplicateLetter()
  const share = useShareLetter()
  const [confirm, setConfirm] = useState<{ kind: 'delete' | 'duplicate'; id: string; title: string } | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CreateCard label="Letter name" buttonLabel="New Letter" className="aspect-[210/297] justify-center" pending={create.isPending} onCreate={(name) => create.mutate(name || undefined)} />
        {isLoading ? (
          Array.from({ length: 2 }, (_, i) => <div key={i} className="aspect-[210/297] animate-pulse rounded-lg bg-muted" />)
        ) : letters?.map((l) => (
          <div key={l.id} className="flex flex-col gap-3">
            <PreviewFrame>
              <LetterRenderer form={l} design={normalizeLetterDesign(l.design)} showPlaceholder />
            </PreviewFrame>
            <div className="flex flex-col gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(l.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" render={<Link href={`/app/letters/${l.id}`} />}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: 'duplicate', id: l.id, title: l.title })}>
                  <Copy className="size-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: 'delete', id: l.id, title: l.title })}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
                <ShareButton
                  live={l.webResumeLive}
                  kind="letter"
                  pending={share.isPending}
                  onToggle={(live) => share.mutateAsync({ id: l.id, live })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.kind === 'delete' ? `Delete "${confirm.title}"?` : `Duplicate "${confirm?.title}"?`}
        description={
          confirm?.kind === 'delete'
            ? 'This permanently removes the cover letter. This cannot be undone.'
            : 'A full copy of the cover letter will be created.'
        }
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Duplicate'}
        destructive={confirm?.kind === 'delete'}
        pending={del.isPending || dup.isPending}
        onConfirm={() => {
          if (!confirm) return
          if (confirm.kind === 'delete') del.mutate(confirm.id)
          else dup.mutate(confirm.id)
          setConfirm(null)
        }}
      />
    </div>
  )
}
