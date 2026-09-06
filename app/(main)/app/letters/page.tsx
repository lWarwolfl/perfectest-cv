'use client'

import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { CreateCard } from '@/components/common/create-card'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ShareButton } from '@/components/common/share-button'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useCreateLetter,
  useDeleteLetter,
  useDuplicateLetter,
  useListLetterPreviews,
} from '@/features/letter/hooks/letter.hooks'
import { normalizeLetterDesign } from '@/features/letter/types'
import { useShareLetter } from '@/features/share/share.hooks'
import { Copy, Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function LettersPage() {
  const { data: letters, isLoading } = useListLetterPreviews()
  const create = useCreateLetter()
  const del = useDeleteLetter()
  const dup = useDuplicateLetter()
  const share = useShareLetter()
  const [confirm, setConfirm] = useState<{
    kind: 'delete' | 'duplicate'
    id: string
    title: string
  } | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CreateCard
          label="Letter name"
          buttonLabel="New Letter"
          className="aspect-210/297 justify-center"
          pending={create.isPending}
          onCreate={(name) => create.mutate(name || undefined)}
        />
        {isLoading
          ? Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="bg-muted aspect-210/297 animate-pulse rounded-lg" />
            ))
          : letters?.map((l) => (
              <div key={l.id} className="group relative flex flex-col gap-3">
                <div className="relative">
                  <PreviewFrame>
                    <LetterRenderer
                      form={l}
                      design={normalizeLetterDesign(l.design)}
                      showPlaceholder
                    />
                  </PreviewFrame>
                  <Link
                    href={`/app/letters/${l.id}`}
                    aria-label={`Edit ${l.title}`}
                    className="absolute inset-0 rounded-lg"
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="bg-background/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-sm">
                    <Pencil className="size-3.5" /> Edit
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Updated {new Date(l.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu
                    open={menuId === l.id}
                    onOpenChange={(o) => setMenuId(o ? l.id : null)}
                  >
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" aria-label="Card menu">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setConfirm({ kind: 'duplicate', id: l.id, title: l.title })}
                      >
                        <Copy /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirm({ kind: 'delete', id: l.id, title: l.title })}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => window.open(`/api/letters/${l.id}/pdf`, '_blank')}
                      >
                        <Download /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ShareButton
                        className="mt-1 w-full"
                        live={l.webResumeLive}
                        kind="letter"
                        pending={share.isPending}
                        onToggle={(live) => share.mutateAsync({ id: l.id, live })}
                        onOpen={() => setMenuId(null)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
      </div>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={
          confirm?.kind === 'delete'
            ? `Delete "${confirm.title}"?`
            : `Duplicate "${confirm?.title}"?`
        }
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
