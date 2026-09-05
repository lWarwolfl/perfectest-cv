'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { useCopyResumeDesign, useCopyResumeDetails } from '@/features/letter/hooks/letter.hooks'
import { QUERY_KEYS } from '@/features/queries/keys'
import type { LetterDesign } from '@/features/letter/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TypographySettings from '@/components/editor/customize/typography-settings'
import ColorThemeSettings from '@/components/editor/customize/color-theme-settings'
import HeaderControls, { LinkStylingSettings } from '@/components/editor/customize/header-controls'
import PageSpacingSettings from '@/components/editor/customize/page-spacing-settings'
import CustomizeTabLayout, { CustomizeCard } from '@/components/editor/customize/customize-tab-layout'
import type { Customization } from '@/features/resume/types'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { TListResumesAction } from '@/server/resume/resume.actions'
import { listResumesAction } from '@/server/resume/resume.actions'

interface LetterDesignSidebarProps {
  letterId: string
  design: LetterDesign
  patchCustomization: (patch: Partial<Customization>) => void
  onCopyDetails: (patch: Partial<LetterContentPatch>) => void
}

export default function LetterDesignSidebar({ letterId, design, patchCustomization, onCopyDetails }: LetterDesignSidebarProps) {
  const qc = useQueryClient()
  const { data: resumes } = useQuery<TListResumesAction>({
    queryKey: [QUERY_KEYS.RESUMES],
    queryFn: listResumesAction,
  })
  const copyDesign = useCopyResumeDesign()
  const copyDetails = useCopyResumeDetails(letterId)
  const [syncResumeId, setSyncResumeId] = useState('')

  useEffect(() => {
    if (!syncResumeId && resumes?.length) setSyncResumeId(resumes[0].id)
  }, [resumes, syncResumeId])

  function handleCopyResumeDesign() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDesign.mutate({ letterId, resumeId: target.id })
    qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS, letterId] })
  }

  function handleCopyResumeDetails() {
    const target = resumes?.find((r) => r.id === syncResumeId) || resumes?.[0]
    if (!target) { toast.error('Create a resume first'); return }
    copyDetails.mutate(target.id, {
      onSuccess: (patch) => onCopyDetails(patch),
    })
  }

  const c = design.customization

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <CustomizeTabLayout>
        <CustomizeCard title="Sync Styles" icon={Copy} description="Match your cover letter design to one of your resumes.">
          <div className="space-y-2">
            <Label>Resume</Label>
            <Select value={syncResumeId} onValueChange={(v) => setSyncResumeId(v || '')}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Pick a resume" /></SelectTrigger>
              <SelectContent>
                {resumes?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyResumeDesign} disabled={!syncResumeId}>
              <Copy className="size-3.5" /> Copy design
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyResumeDetails} disabled={!syncResumeId}>
              <Copy className="size-3.5" /> Copy sender details
            </Button>
          </div>
        </CustomizeCard>
        <TypographySettings
          customization={c}
          onPatch={(patch) => patchCustomization({ spacing: { ...c.spacing, ...patch } })}
          onFontChange={(patch) => patchCustomization({ font: { ...c.font, ...patch } })}
        />
        <ColorThemeSettings
          customization={c}
          onPatch={(patch) => patchCustomization({ colors: { ...c.colors, ...patch } })}
          onApplyAccentPatch={(patch) => patchCustomization({ applyAccentColor: { ...c.applyAccentColor, ...patch } })}
        />
        <HeaderControls
          customization={c}
          onHeaderPatch={(patch) => patchCustomization({ header: { ...c.header, ...patch } })}
          onPhotoPositionPatch={(patch) => patchCustomization({ photoPosition: { ...c.photoPosition, ...patch } })}
        />
        <LinkStylingSettings
          customization={c}
          onLinksPatch={(patch) => patchCustomization({ links: { ...c.links, ...patch } })}
        />
        <PageSpacingSettings
          customization={c}
          onPatch={(patch) => patchCustomization({ spacing: { ...c.spacing, ...patch } })}
          onRegionalPatch={(patch) => patchCustomization({ regional: { ...c.regional, ...patch } })}
        />
      </CustomizeTabLayout>
    </div>
  )
}
