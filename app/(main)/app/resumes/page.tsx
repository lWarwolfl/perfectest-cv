'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Pencil, Trash2, Download, Link2, MoreVertical } from 'lucide-react'
import {
  useListResumePreviews,
  useCreateResume,
  useDeleteResume,
  useDuplicateResume,
} from '@/features/resume/hooks/resume.hooks'
import { useShareResume } from '@/features/share/share.hooks'
import { Button } from '@/components/ui/button'
import { CreateCard } from '@/components/common/create-card'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ShareDialog } from '@/components/common/share-button'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { DEFAULT_CUSTOMIZATION, EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { usePrintNode } from '@/lib/use-print'

export default function ResumesPage() {
  const { data: resumes, isLoading } = useListResumePreviews()
  const create = useCreateResume()
  const del = useDeleteResume()
  const dup = useDuplicateResume()
  const share = useShareResume()
  const { print, job } = usePrintNode()
  const [confirm, setConfirm] = useState<{
    kind: 'delete' | 'duplicate'
    id: string
    title: string
  } | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [shareState, setShare] = useState<{ id: string; live: boolean } | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Resumes</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CreateCard
          label="Resume name"
          buttonLabel="New Resume"
          className="aspect-[210/297] justify-center"
          pending={create.isPending}
          onCreate={(name) => create.mutate(name || undefined)}
        />
        {isLoading
          ? Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="bg-muted aspect-[210/297] animate-pulse rounded-lg" />
            ))
          : resumes?.map((r) => (
              <div key={r.id} className="group relative flex flex-col gap-3">
                <div className="relative">
                  <PreviewFrame pageFormat={r.doc.customization?.regional?.pageFormat}>
                    <ResumeRenderer
                      personalDetails={r.doc.personalDetails ?? EMPTY_PERSONAL_DETAILS}
                      sections={r.doc.sections}
                      customization={r.doc.customization ?? DEFAULT_CUSTOMIZATION}
                    />
                  </PreviewFrame>
                  <Link
                    href={`/app/resumes/${r.id}`}
                    aria-label={`Edit ${r.title}`}
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
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Updated {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu open={menuId === r.id} onOpenChange={(o) => setMenuId(o ? r.id : null)}>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="secondary" size="icon" aria-label="Card menu">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setConfirm({ kind: 'duplicate', id: r.id, title: r.title })}
                      >
                        <Copy /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirm({ kind: 'delete', id: r.id, title: r.title })}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          print(
                            r.id,
                            (r.doc.customization?.fileName || r.title || 'resume').replace(
                              /\.pdf$/i,
                              ''
                            )
                          )
                        }
                      >
                        <Download /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setMenuId(null)
                          setShare({ id: r.id, live: r.webResumeLive })
                        }}
                      >
                        <Link2 /> Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Full-size hidden copy of the same preview, only visible in print output */}
                <div className={`print-only ${job?.id === r.id ? '' : 'hidden'}`}>
                  <ResumeRenderer
                    personalDetails={r.doc.personalDetails ?? EMPTY_PERSONAL_DETAILS}
                    sections={r.doc.sections}
                    customization={r.doc.customization ?? DEFAULT_CUSTOMIZATION}
                  />
                </div>
              </div>
            ))}
      </div>
      {shareState && (
        <ShareDialog
          live={shareState.live}
          kind="resume"
          pending={share.isPending}
          onToggle={(live) => share.mutateAsync({ id: shareState.id, live })}
          onClose={() => setShare(null)}
        />
      )}
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
            ? 'This permanently removes the resume and all its sections. This cannot be undone.'
            : 'A full copy including sections and entries will be created.'
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
