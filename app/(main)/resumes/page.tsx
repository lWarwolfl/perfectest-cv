'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Copy,
  Pencil,
  Search,
  Trash2,
  Download,
  Link2,
  MoreVertical,
  LayoutTemplate,
  Plus,
} from 'lucide-react'
import {
  useListResumePreviews,
  useCreateResumeFromTemplate,
  useDeleteResume,
  useDuplicateResume,
} from '@/features/resume/hooks/resume.hooks'
import { useShareResume } from '@/features/share/share.hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplatePickerDialog } from '@/components/resume/template-picker-dialog'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { DataPagination } from '@/components/common/data-pagination'
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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])
  const { data, isLoading } = useListResumePreviews(page, debouncedSearch)
  const resumes = data?.resumes
  const pagination = data?.pagination
  const router = useRouter()
  const create = useCreateResumeFromTemplate()
  const pendingTemplateId = create.isPending
    ? ((create.variables as string | undefined) ?? null)
    : null
  const [pickerOpen, setPickerOpen] = useState(false)
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
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes..."
            aria-label="Search resumes"
            className="pl-8"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground flex aspect-[210/297] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
        >
          <span className="bg-muted flex size-11 items-center justify-center rounded-full">
            <LayoutTemplate className="size-5" />
          </span>
          <span className="flex items-center gap-1 text-sm font-medium">
            <Plus className="size-4" /> New Resume
          </span>
          <span className="px-6 text-center text-xs">Start from a template with sample content</span>
        </button>
        {isLoading
          ? Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="aspect-[210/297] rounded-lg" />
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
                    href={`/resumes/${r.id}`}
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
                  <DropdownMenu
                    open={menuId === r.id}
                    onOpenChange={(o) => setMenuId(o ? r.id : null)}
                  >
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
        {!isLoading && resumes?.length === 0 && (
          <p className="text-muted-foreground col-span-full py-8 text-center text-sm">
            {debouncedSearch
              ? `No resumes match "${debouncedSearch}".`
              : 'No resumes yet — create your first one.'}
          </p>
        )}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <DataPagination pagination={pagination} onPageChange={setPage} />
      )}
      {shareState && (
        <ShareDialog
          live={shareState.live}
          kind="resume"
          pending={share.isPending}
          onToggle={(live) => share.mutateAsync({ id: shareState.id, live })}
          onClose={() => setShare(null)}
        />
      )}
      <TemplatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        pendingId={pendingTemplateId}
        onPick={(templateId) =>
          create.mutate(templateId, {
            onSuccess: (resume) => {
              setPickerOpen(false)
              router.push(`/resumes/${resume.id}?first=1`)
            },
          })
        }
      />
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
