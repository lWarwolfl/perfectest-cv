'use client'

import { useState } from 'react'
import {
  AlignLeft,
  AlignCenter,
  ExternalLink,
  Mail,
  ChevronDown,
  UserRound,
  Link2,
  BriefcaseBusiness,
} from 'lucide-react'
import { CustomizeCard } from './customize-tab-layout'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Customization } from '@/features/resume/types'

interface HeaderControlsProps {
  customization: Customization
  onHeaderPatch: (patch: Partial<Customization['header']>) => void
  onPhotoPositionPatch: (patch: Partial<Customization['photoPosition']>) => void
}

interface LinkStylingProps {
  customization: Customization
  onLinksPatch: (patch: Partial<Customization['links']>) => void
}

interface WorkExperienceSettingsProps {
  customization: Customization
  onWorkDisplayPatch: (patch: Partial<Customization['workDisplay']>) => void
}

function OptionButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-xl border px-2 py-2 text-xs transition-colors',
        active
          ? 'border-primary bg-primary/10 font-semibold text-primary'
          : 'border-border bg-card text-foreground hover:bg-muted',
        className
      )}
    >
      {children}
    </button>
  )
}

const ICON_STYLES = ['outline', 'filled-circle', 'soft-badge', 'neutral-gray', 'primary-accent'] as const

function iconFrameCls(style: Customization['header']['iconStyle']) {
  switch (style) {
    case 'filled-circle':
      return 'rounded-full bg-primary text-primary-foreground p-1'
    case 'soft-badge':
      return 'rounded-md bg-primary/15 text-primary p-1'
    case 'neutral-gray':
      return 'text-muted-foreground'
    case 'primary-accent':
      return 'text-primary'
    default:
      return 'text-foreground'
  }
}

function IconSwatch({ style }: { style: Customization['header']['iconStyle'] }) {
  return (
    <span className={cn('inline-flex items-center justify-center', iconFrameCls(style))}>
      <Mail className="size-3.5" />
    </span>
  )
}

const SHAPE_CLS = {
  circle: 'rounded-full',
  square: 'rounded-none',
  'rounded-sm': 'rounded-sm',
  'rounded-md': 'rounded-md',
  'rounded-lg': 'rounded-lg',
} as const

function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial)
  return { open, toggle: () => setOpen((o) => !o) }
}

export function LinkStylingSettings({ customization, onLinksPatch }: LinkStylingProps) {
  const links = customization.links
  const advanced = useDisclosure()
  return (
    <CustomizeCard title="Links" icon={Link2} description="Underline, color and icons for all links in the resume.">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="link-underline" checked={links.underline} onCheckedChange={(v) => onLinksPatch({ underline: v === true })} />
          <Label htmlFor="link-underline" className="cursor-pointer text-sm">Underline</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="link-blue" checked={links.blueColor} onCheckedChange={(v) => onLinksPatch({ blueColor: v === true })} />
          <Label htmlFor="link-blue" className="cursor-pointer text-sm">Blue color</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="link-icon" checked={links.icon} onCheckedChange={(v) => onLinksPatch({ icon: v === true })} />
          <Label htmlFor="link-icon" className="cursor-pointer text-sm">Link icon</Label>
        </div>
      </div>
      {links.icon && (
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={links.iconType === 'link'} onClick={() => onLinksPatch({ iconType: 'link' })}>
            <Link2 className="mx-auto block size-4" />
          </OptionButton>
          <OptionButton active={links.iconType === 'external'} onClick={() => onLinksPatch({ iconType: 'external' })}>
            <ExternalLink className="mx-auto block size-4" />
          </OptionButton>
        </div>
      )}
      <div className="rounded-xl border border-border/60">
        <button
          type="button"
          className="flex w-full items-center justify-between p-3 text-left"
          onClick={advanced.toggle}
        >
          <span className="text-sm font-semibold">Advanced Settings</span>
          <ChevronDown className={cn('size-4 transition-transform', advanced.open && 'rotate-180')} />
        </button>
        {advanced.open && (
          <div className="space-y-3 border-t border-border/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Apply underline and blue color to header
            </div>
            {(['email', 'phone', 'website', 'linkedIn', 'github'] as const).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <Checkbox
                  id={`link-ovr-${k}`}
                  checked={links.headerOverrides[k]}
                  onCheckedChange={(v) => onLinksPatch({ headerOverrides: { ...links.headerOverrides, [k]: v === true } })}
                />
                <Label htmlFor={`link-ovr-${k}`} className="cursor-pointer text-sm capitalize">
                  {k === 'linkedIn' ? 'LinkedIn' : k}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomizeCard>
  )
}

export function WorkExperienceSettings({ customization, onWorkDisplayPatch }: WorkExperienceSettingsProps) {
  return (
    <CustomizeCard title="Work Experience" icon={BriefcaseBusiness} description="How job entries are displayed.">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Title / subtitle order</Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={customization.workDisplay.jobTitleBeforeEmployer} onClick={() => onWorkDisplayPatch({ jobTitleBeforeEmployer: true })}>
            <span className="block text-center">Job Title - Employer</span>
          </OptionButton>
          <OptionButton active={!customization.workDisplay.jobTitleBeforeEmployer} onClick={() => onWorkDisplayPatch({ jobTitleBeforeEmployer: false })}>
            <span className="block text-center">Employer - Job Title</span>
          </OptionButton>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="work-group-promotions"
          checked={customization.workDisplay.groupPromotions}
          onCheckedChange={(v) => onWorkDisplayPatch({ groupPromotions: v === true })}
        />
        <Label htmlFor="work-group-promotions" className="cursor-pointer text-sm">Group promotions</Label>
      </div>
    </CustomizeCard>
  )
}

export default function HeaderControls({ customization, onHeaderPatch, onPhotoPositionPatch }: HeaderControlsProps) {
  const header = customization.header
  const photo = customization.photoPosition

  return (
    <CustomizeCard title="Header" icon={UserRound} description="Name, contact details, icons and photo.">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Text alignment</Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={header.alignText === 'start'} onClick={() => onHeaderPatch({ alignText: 'start' })}>
            <AlignLeft className="mx-auto block size-4" />
            <span className="block text-center">Left</span>
          </OptionButton>
          <OptionButton active={header.alignText === 'center'} onClick={() => onHeaderPatch({ alignText: 'center' })}>
            <AlignCenter className="mx-auto block size-4" />
            <span className="block text-center">Center</span>
          </OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Details arrangement</Label>
        <div className="grid grid-cols-3 gap-2">
          <OptionButton active={header.detailsArrangement === 'column'} onClick={() => onHeaderPatch({ detailsArrangement: 'column' })}>
            <span className="mx-auto mb-1 flex flex-col items-center gap-0.5">
              <span className="h-0.5 w-8 bg-current" />
              <span className="h-0.5 w-8 bg-current" />
              <span className="h-0.5 w-8 bg-current" />
            </span>
            <span className="block text-center">Stacked</span>
          </OptionButton>
          <OptionButton active={header.detailsArrangement === 'grid'} onClick={() => onHeaderPatch({ detailsArrangement: 'grid' })}>
            <span className="mx-auto mb-1 grid w-fit grid-cols-2 gap-0.5">
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
            </span>
            <span className="block text-center">Grid</span>
          </OptionButton>
          <OptionButton active={header.detailsArrangement === 'wrap'} onClick={() => onHeaderPatch({ detailsArrangement: 'wrap' })}>
            <span className="mx-auto mb-1 flex gap-2">
              <span className="flex flex-col gap-0.5">
                <span className="h-0.5 w-3 bg-current" />
                <span className="h-0.5 w-3 bg-current" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="h-0.5 w-3 bg-current" />
                <span className="h-0.5 w-3 bg-current" />
              </span>
            </span>
            <span className="block text-center">Two Column</span>
          </OptionButton>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['icon', 'bullet', 'bar'] as const).map((s) => (
            <OptionButton key={s} active={header.detailsSeparator === s} onClick={() => onHeaderPatch({ detailsSeparator: s })}>
              <span className="block text-center capitalize">
                {s === 'icon' ? 'Icon' : s === 'bullet' ? '• Bullet' : '| Bar'}
              </span>
            </OptionButton>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Icon style</Label>
        <div className="flex gap-2">
          {ICON_STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onHeaderPatch({ iconStyle: s })}
              className={cn(
                'flex h-11 flex-1 items-center justify-center rounded-xl border transition-colors',
                header.iconStyle === s ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted'
              )}
            >
              <IconSwatch style={s} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Name style</Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={header.nameStyle === 'regular'} onClick={() => onHeaderPatch({ nameStyle: 'regular' })}>
            <span className="block text-center font-normal">Aa</span>
          </OptionButton>
          <OptionButton active={header.nameStyle === 'bold'} onClick={() => onHeaderPatch({ nameStyle: 'bold' })}>
            <span className="block text-center font-bold">Aa</span>
          </OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Professional title style</Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={header.jobTitleStyle === 'normal'} onClick={() => onHeaderPatch({ jobTitleStyle: 'normal' })}>
            <span className="block text-center">Aa</span>
          </OptionButton>
          <OptionButton active={header.jobTitleStyle === 'italic'} onClick={() => onHeaderPatch({ jobTitleStyle: 'italic' })}>
            <span className="block text-center italic">Aa</span>
          </OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Professional title position</Label>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton active={header.jobTitlePosition === 'sameLine'} onClick={() => onHeaderPatch({ jobTitlePosition: 'sameLine' })}>
            <span className="block text-center">Try Same Line</span>
          </OptionButton>
          <OptionButton active={header.jobTitlePosition === 'below'} onClick={() => onHeaderPatch({ jobTitlePosition: 'below' })}>
            <span className="block text-center">Below</span>
          </OptionButton>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-foreground">Photo</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="hdr-photo-show" checked={photo.show} onCheckedChange={(v) => onPhotoPositionPatch({ show: v === true })} />
            <Label htmlFor="hdr-photo-show" className="cursor-pointer text-sm">Show</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="hdr-photo-gray" checked={photo.grayscale} onCheckedChange={(v) => onPhotoPositionPatch({ grayscale: v === true })} />
            <Label htmlFor="hdr-photo-gray" className="cursor-pointer text-sm">Grayscale</Label>
          </div>
        </div>
        {photo.show && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <OptionButton active={photo.position === 'left'} onClick={() => onPhotoPositionPatch({ position: 'left' })}>
                <span className="mx-auto mb-1 flex items-center gap-1">
                  <span className="size-3 rounded-full bg-current" />
                  <span className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-5 bg-current" />
                    <span className="h-0.5 w-5 bg-current" />
                  </span>
                </span>
                <span className="block text-center">Left</span>
              </OptionButton>
              <OptionButton active={photo.position === 'top'} onClick={() => onPhotoPositionPatch({ position: 'top' })}>
                <span className="mx-auto mb-1 flex flex-col items-center gap-0.5">
                  <span className="size-3 rounded-full bg-current" />
                  <span className="h-0.5 w-8 bg-current" />
                  <span className="h-0.5 w-8 bg-current" />
                </span>
                <span className="block text-center">Top</span>
              </OptionButton>
              <OptionButton active={photo.position === 'right'} onClick={() => onPhotoPositionPatch({ position: 'right' })}>
                <span className="mx-auto mb-1 flex items-center gap-1">
                  <span className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-5 bg-current" />
                    <span className="h-0.5 w-5 bg-current" />
                  </span>
                  <span className="size-3 rounded-full bg-current" />
                </span>
                <span className="block text-center">Right</span>
              </OptionButton>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['xs', 's', 'm', 'l', 'xl'] as const).map((s) => (
                <OptionButton key={s} active={photo.size === s} onClick={() => onPhotoPositionPatch({ size: s })}>
                  <span className="block text-center uppercase">{s}</span>
                </OptionButton>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(['circle', 'square', 'rounded-sm', 'rounded-md', 'rounded-lg'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onPhotoPositionPatch({ shape: s })}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-xl border transition-colors',
                    photo.shape === s ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted'
                  )}
                >
                  <span className={cn('size-6 bg-current', SHAPE_CLS[s])} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </CustomizeCard>
  )
}
