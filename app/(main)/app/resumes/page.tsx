'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { useListResumePreviews, useCreateResume, useDeleteResume } from '@/features/resume/hooks/resume.hooks'
import { Button } from '@/components/ui/button'
import { PageLoader } from '@/components/common/page-loader'
import { PreviewFrame } from '@/components/common/preview-frame'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { DEFAULT_CUSTOMIZATION, EMPTY_PERSONAL_DETAILS } from '@/features/resume/defaults'

export default function ResumesPage() {
  const { data: resumes, isLoading } = useListResumePreviews()
  const create = useCreateResume()
  const del = useDeleteResume()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          New Resume
        </Button>
      </div>
      {isLoading && <PageLoader />}
      {!isLoading && !resumes?.length && (
        <p className="text-muted-foreground">
          No resumes yet. Create your first one.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes?.map((r) => (
          <div key={r.id} className="flex flex-col gap-3">
            <PreviewFrame pageFormat={r.doc.customization?.regional?.pageFormat}>
              <ResumeRenderer
                personalDetails={r.doc.personalDetails ?? EMPTY_PERSONAL_DETAILS}
                sections={r.doc.sections}
                customization={r.doc.customization ?? DEFAULT_CUSTOMIZATION}
              />
            </PreviewFrame>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(r.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" render={<Link href={`/app/resumes/${r.id}`} />}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => del.mutate(r.id)}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
