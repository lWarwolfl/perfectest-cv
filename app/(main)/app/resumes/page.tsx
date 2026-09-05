'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { useListResumePreviews, useCreateResume, useDeleteResume, useDuplicateResume } from '@/features/resume/hooks/resume.hooks'
import { useShareResume } from '@/features/share/share.hooks'
import { Button } from '@/components/ui/button'
import { LabeledInput } from '@/components/ui/labeled'
import { PageLoader } from '@/components/common/page-loader'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { ShareButton } from '@/components/common/share-button'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { DEFAULT_CUSTOMIZATION, EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'

export default function ResumesPage() {
  const { data: resumes, isLoading } = useListResumePreviews()
  const create = useCreateResume()
  const del = useDeleteResume()
  const dup = useDuplicateResume()
  const share = useShareResume()
  const [newName, setNewName] = useState('')
  const [confirm, setConfirm] = useState<{ kind: 'delete' | 'duplicate'; id: string; title: string } | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Resumes</h1>
      </div>
      {isLoading && <PageLoader />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-center gap-2 rounded-lg border-2 border-dashed p-3">
          <LabeledInput label="New resume name" hideLabel placeholder="Resume name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button variant="outline" onClick={() => { create.mutate(newName.trim() || undefined); setNewName('') }} disabled={create.isPending}>
            <Plus className="size-4" /> New Resume
          </Button>
        </div>
        {resumes?.map((r) => (
          <div key={r.id} className="flex flex-col gap-3">
            <PreviewFrame pageFormat={r.doc.customization?.regional?.pageFormat}>
              <ResumeRenderer
                personalDetails={r.doc.personalDetails ?? EMPTY_PERSONAL_DETAILS}
                sections={r.doc.sections}
                customization={r.doc.customization ?? DEFAULT_CUSTOMIZATION}
              />
            </PreviewFrame>
            <div className="flex flex-col gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(r.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" render={<Link href={`/app/resumes/${r.id}`} />}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: 'duplicate', id: r.id, title: r.title })}>
                  <Copy className="size-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirm({ kind: 'delete', id: r.id, title: r.title })}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
                <ShareButton
                  live={r.webResumeLive}
                  kind="resume"
                  pending={share.isPending}
                  onToggle={(live) => share.mutateAsync({ id: r.id, live })}
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
