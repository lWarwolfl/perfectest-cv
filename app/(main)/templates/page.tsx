'use client'

import { FilePlus2 } from 'lucide-react'
import { RESUME_TEMPLATES } from '@/features/resume/templates'
import { useCreateResumeFromTemplate } from '@/features/resume/hooks/resume.hooks'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { PreviewFrame } from '@/components/common/preview-frame'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function TemplatesPage() {
  const create = useCreateResumeFromTemplate()
  const pendingId = create.isPending
    ? (create.variables as string | undefined) ?? null
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Resume Templates</h1>
          <p className="text-muted-foreground text-sm">
            Start from a professionally designed one-page resume — your copy comes prefilled with
            placeholder content you can edit.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {RESUME_TEMPLATES.map((t) => (
          <div key={t.id} className="group relative flex flex-col gap-3">
            <div className="relative">
              <PreviewFrame pageFormat={t.customization.regional?.pageFormat}>
                <ResumeRenderer
                  personalDetails={t.personalDetails}
                  sections={templateSections(t)}
                  customization={t.customization}
                />
              </PreviewFrame>
            </div>
            <div className="flex items-start justify-between gap-2">
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
                disabled={create.isPending}
                onClick={() => create.mutate(t.id)}
                aria-label={`Create a resume from the ${t.name} template`}
              >
                {pendingId === t.id ? <Spinner className="size-4" /> : <FilePlus2 className="size-4" />}
                Use
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function templateSections(t: (typeof RESUME_TEMPLATES)[number]) {
  return t.sections.map((s, i) => ({
    id: `tpl-${t.id}-${i}`,
    resumeId: 'template',
    createdAt: new Date(),
    updatedAt: new Date(),
    order: i,
    sectionType: s.sectionType,
    displayName: s.displayName,
    iconKey: s.iconKey,
    hidden: false,
    entries: s.entries.map((e, j) => ({
      id: `tpl-${t.id}-${i}-${j}`,
      sectionId: `tpl-${t.id}-${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: j,
      hidden: false,
      data: e,
    })),
  }))
}
