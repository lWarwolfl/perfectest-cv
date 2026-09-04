'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useShareResume } from '@/features/share/share.hooks'
import { ShareButton } from '@/components/common/share-button'
import {
  useResumeDocument,
  useSaveResumePersonalDetails,
  useSaveResumeCustomization,
  useRenameResume,
  useAddSection,
  useDeleteSection,
  useAddEntry,
  useDeleteEntry,
  useUpdateEntryData,
  useSaveSectionMeta,
  useReorderSections,
} from '@/features/resume/hooks/resume.hooks'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { SECTION_LABELS, EMPTY_PERSONAL_DETAILS, DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { TSection, PersonalDetails, Customization, SectionType, EntryData, SkillEntry, LanguageEntry, HeadingStyle } from '@/features/resume/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { replaceImageAction, deleteImageAction } from '@/server/image/uploadImage.action'
import { Eye, EyeOff, ArrowLeftRight, ChevronDown, Plus, Trash2, Pencil, GripVertical, UserRound } from 'lucide-react'
import EditorHeader, { EditorShell } from '@/components/editor/editor-header'
import { ScreenGate } from '@/components/editor/screen-gate'
import { PageLoader } from '@/components/common/page-loader'
import AddSectionModal from '@/components/editor/add-section-modal'
import RichTextEditor from '@/components/editor/rich-text-editor'
import LinkDialog from '@/components/editor/link-dialog'
import { useResumeStyleStore } from '@/stores/use-resume-style-store'
import StyleSettings from '@/components/editor/customize/style-settings'

const HEADING_STYLE_OPTIONS: { value: HeadingStyle; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'box', label: 'Box' },
  { value: 'underline', label: 'Underline' },
  { value: 'simple', label: 'Simple' },
  { value: 'topBottomLine', label: 'Top & Bottom' },
  { value: 'thickShortUnderline', label: 'Thick Short' },
  { value: 'thinLine', label: 'Thin Line' },
  { value: 'zigZagLine', label: 'Zigzag' },
  { value: 'dottedLine', label: 'Dotted' },
  { value: 'plain', label: 'Plain' },
]

function printWithFileName(name: string) {
  const prev = document.title
  document.title = name
  window.print()
  document.title = prev
}

function mergeCustomization(base: Customization, saved: Customization | null | undefined): Customization {
  const out = { ...base } as unknown as Record<string, unknown>
  for (const key of Object.keys(base) as (keyof Customization)[]) {
    const value = saved?.[key] as unknown
    const b = base[key] as unknown
    if (b && typeof b === 'object' && !Array.isArray(b) && value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = { ...(b as Record<string, unknown>), ...(value as Record<string, unknown>) }
    } else if (value !== undefined && value !== null) {
      out[key] = value
    }
  }
  return out as unknown as Customization
}

function TitleInput({ label, value, link, placeholder, onChange, onLinkChange }: {
  label: string
  value: string
  link?: string
  placeholder?: string
  onChange: (v: string) => void
  onLinkChange?: (url: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="w-24 shrink-0">{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {onLinkChange && <LinkDialog value={link || ''} onConfirm={onLinkChange} />}
    </div>
  )
}

function EntryForm({ entry, sectionType, onChange, onDelete }: {
  entry: TSection['entries'][number]
  sectionType: SectionType
  onChange: (updates: Partial<EntryData>) => void
  onDelete: () => void
}) {
  const up = (patch: Partial<EntryData>) => onChange({ ...entry.data, ...patch } as EntryData)
  if (sectionType === 'work') {
    const e = entry.data as Extract<EntryData, { type: 'work' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Role</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <TitleInput label="Job title" value={e.jobTitle} onChange={(v) => up({ jobTitle: v })} />
        <TitleInput label="Employer" value={e.employer} link={e.employerLink} placeholder="Employer" onChange={(v) => up({ employer: v })} onLinkChange={(url) => up({ employerLink: url })} />
        <Input placeholder="Location" value={e.location} onChange={(v) => up({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (MM/YYYY)" value={e.startDate?.month && e.startDate?.year ? `${e.startDate.month}/${e.startDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            up({ startDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
          }} />
          <Input placeholder="End (MM/YYYY)" value={e.endDate?.month && e.endDate?.year ? `${e.endDate.month}/${e.endDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            up({ endDate: { hide: false, year: y || '', month: m || '', ongoing: !y && !m, onlyYear: false, customOngoingWord: 'present' } })
          }} />
        </div>
        <RichTextEditor compact value={e.description} onUpdate={(html) => up({ description: html })} />
      </div>
    )
  }
  if (sectionType === 'education') {
    const e = entry.data as Extract<EntryData, { type: 'education' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Education</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <TitleInput label="Degree" value={e.degree} onChange={(v) => up({ degree: v })} />
        <TitleInput label="School" value={e.school} link={e.schoolLink} placeholder="e.g. University of Tehran" onChange={(v) => up({ school: v })} onLinkChange={(url) => up({ schoolLink: url })} />
        <Input placeholder="Location" value={e.location} onChange={(v) => up({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (YYYY)" value={e.startDate?.year || ''} onChange={(v) => up({ startDate: { hide: false, year: v.target.value, month: '', ongoing: false, onlyYear: true, customOngoingWord: 'present' } })} />
          <Input placeholder="End (YYYY)" value={e.endDate?.year || ''} onChange={(v) => up({ endDate: { hide: false, year: v.target.value, month: '', ongoing: !v.target.value, onlyYear: true, customOngoingWord: 'present' } })} />
        </div>
        <RichTextEditor compact value={e.description} onUpdate={(html) => up({ description: html })} />
      </div>
    )
  }
  if (sectionType === 'skill' || sectionType === 'language') {
    const e = entry.data as SkillEntry
    const nameKey = sectionType === 'skill' ? 'skill' : 'language'
    const nameValue = sectionType === 'skill' ? e.skill : (entry.data as LanguageEntry).language
    return (
      <div className="space-y-2 rounded-lg border p-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder={sectionType === 'skill' ? 'Skill' : 'Language'}
            value={nameValue}
            onChange={(v) => up({ [nameKey]: v.target.value } as Partial<EntryData>)}
            className="flex-1"
          />
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Textarea
          placeholder="Subinfo"
          value={stripHtml(e.infoHtml)}
          onChange={(v) => up({ infoHtml: v.target.value.replace(/\s{2,}/g, ' ').replace(/\n/g, ' ') } as Partial<EntryData>)}
        />
      </div>
    )
  }
  if (sectionType === 'interest') {
    const e = entry.data as Extract<EntryData, { type: 'interest' }>
    return (
      <div className="space-y-2 rounded-lg border p-2">
        <div className="flex items-center gap-2">
          <Input placeholder="Interest" value={e.interest} onChange={(v) => up({ interest: v.target.value })} className="flex-1" />
          <LinkDialog value={e.interestLink} onConfirm={(url) => up({ interestLink: url })} />
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <RichTextEditor compact value={e.infoHtml} onUpdate={(html) => up({ infoHtml: html } as Partial<EntryData>)} />
      </div>
    )
  }
  if (sectionType === 'project') {
    const e = entry.data as Extract<EntryData, { type: 'project' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Project</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <TitleInput label="Title" value={e.projectTitle} link={e.projectTitleLink} placeholder="e.g. Perfectest CV" onChange={(v) => up({ projectTitle: v })} onLinkChange={(url) => up({ projectTitleLink: url })} />
        <Input placeholder="Subtitle" value={e.subTitle} onChange={(v) => up({ subTitle: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (MM/YYYY)" value={`${e.startDate.month}/${e.startDate.year}`.replace(/^\/|\/$/g, '')} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            up({ startDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
          }} />
          <Input placeholder="End (MM/YYYY)" value={e.endDate.ongoing ? 'Present' : `${e.endDate.month}/${e.endDate.year}`.replace(/^\/|\/$/g, '')} onChange={(v) => {
            if (v.target.value.toLowerCase() === 'present') {
              up({ endDate: { hide: false, year: '', month: '', ongoing: true, onlyYear: false, customOngoingWord: 'present' } })
              return
            }
            const [m, y] = v.target.value.split('/')
            up({ endDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
          }} />
        </div>
        <RichTextEditor compact value={e.description} onUpdate={(html) => up({ description: html })} />
      </div>
    )
  }
  if (sectionType === 'certificate') {
    const e = entry.data as Extract<EntryData, { type: 'certificate' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Certificate</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <TitleInput label="Title" value={e.title} link={e.link} placeholder="Title" onChange={(v) => up({ title: v })} onLinkChange={(url) => up({ link: url })} />
        <Input placeholder="Issuer" value={e.issuer} onChange={(v) => up({ issuer: v.target.value })} />
        <Input placeholder="Date" value={e.date} onChange={(v) => up({ date: v.target.value })} />
      </div>
    )
  }
  if (sectionType === 'profile') {
    const e = entry.data as Extract<EntryData, { type: 'profile' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Summary</span>
        </div>
        <RichTextEditor value={e.text} onUpdate={(html) => up({ text: html })} />
      </div>
    )
  }
  const e = entry.data as Extract<EntryData, { type: 'custom' | 'publication' | 'organisation' | 'course' | 'award' | 'reference' | 'declaration' }>
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Entry</span>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
      {'title' in e && <TitleInput label="Title" value={e.title} link={'link' in e ? e.link : undefined} placeholder="Title" onChange={(v) => up({ title: v })} onLinkChange={'link' in e ? (url) => up({ link: url } as Partial<EntryData>) : undefined} />}
      {'subTitle' in e && <Input placeholder="Subtitle" value={e.subTitle} onChange={(v) => up({ subTitle: v.target.value })} />}
      {'issuer' in e && <Input placeholder="Issuer" value={e.issuer} onChange={(v) => up({ issuer: v.target.value })} />}
      {'date' in e && <Input placeholder="Date" value={e.date} onChange={(v) => up({ date: v.target.value })} />}
      {'contact' in e && <Input placeholder="Contact" value={e.contact} onChange={(v) => up({ contact: v.target.value })} />}
      {'name' in e && <Input placeholder="Name" value={e.name} onChange={(v) => up({ name: v.target.value })} />}
      {'text' in e && <RichTextEditor compact value={e.text} onUpdate={(html) => up({ text: html } as Partial<EntryData>)} />}
      {'description' in e && <RichTextEditor compact value={e.description} onUpdate={(html) => up({ description: html } as Partial<EntryData>)} />}
    </div>
  )
}

function stripHtml(s?: string) {
  return (s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function entryTitleAndPreview(data: EntryData): { title: string; preview: string } {
  switch (data.type) {
    case 'work':
      return { title: data.jobTitle || data.employer, preview: stripHtml(data.description) }
    case 'education':
      return { title: data.degree || data.school, preview: stripHtml(data.description) }
    case 'skill':
      return { title: data.skill, preview: stripHtml(data.infoHtml) }
    case 'language':
      return { title: data.language, preview: stripHtml(data.infoHtml) }
    case 'interest':
      return { title: data.interest, preview: stripHtml(data.infoHtml) }
    case 'profile':
      return { title: 'Summary', preview: stripHtml(data.text) }
    case 'project':
      return { title: data.projectTitle, preview: stripHtml(data.description) }
    case 'certificate':
    case 'publication':
    case 'organisation':
    case 'course':
    case 'award':
      return { title: data.title, preview: stripHtml('description' in data ? data.description : data.issuer) }
    case 'reference':
      return { title: data.name, preview: data.contact }
    case 'declaration':
      return { title: 'Declaration', preview: stripHtml(data.text) }
    default:
      return { title: data.title, preview: stripHtml(data.description) }
  }
}

function SectionCard({ section, onToggle, onDelete, onAddEntry, onEntryClick, saveMeta, onSectionHeadingPatch, headingStyle, showTitle, canDelete }: {
  section: TSection
  onToggle: (hidden: boolean) => void
  onDelete: () => void
  onAddEntry: () => void
  onEntryClick: (entryId: string) => void
  saveMeta: (sectionId: string, patch: { hidden?: boolean; displayName?: string }) => void
  onSectionHeadingPatch: (sectionId: string, patch: { style?: HeadingStyle; showTitle?: boolean }) => void
  headingStyle: HeadingStyle
  showTitle: boolean
  canDelete: boolean
}) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function commitEdit() {
    const title = draft.trim()
    setEditing(false)
    if (title && title !== section.displayName) {
      saveMeta(section.id, { displayName: title })
    }
  }

  const isProfile = section.sectionType === 'profile'

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 p-3">
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
        {editing ? (
          <Input
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="h-7"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{section.displayName}</span>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Rename section" onClick={() => { setDraft(section.displayName); setEditing(true) }}>
          <Pencil className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={section.hidden ? 'Show section' : 'Hide section'} onClick={() => onToggle(!section.hidden)}>
          {section.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
        </Button>
        {canDelete && (
          <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Delete section" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" aria-label="Toggle section" onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border/60 p-3">
          {!isProfile && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-2">
              <span className="text-xs font-medium text-muted-foreground">Title style</span>
              <Select value={headingStyle} onValueChange={(v) => onSectionHeadingPatch(section.id, { style: v as HeadingStyle })}>
                <SelectTrigger className="h-7 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_STYLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionHeadingPatch(section.id, { showTitle: !showTitle })}
              >
                {showTitle ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {showTitle ? 'Title shown' : 'Title hidden'}
              </Button>
            </div>
          )}
          {isProfile ? (
            section.entries.slice(0, 1).map((entry) => {
              const { title, preview } = entryTitleAndPreview(entry.data)
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onEntryClick(entry.id)}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="block truncate text-sm font-medium">{title || 'Summary'}</span>
                  {preview && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{preview}</span>}
                </button>
              )
            })
          ) : (
            <>
              {section.entries.map((entry) => {
                const { title, preview } = entryTitleAndPreview(entry.data)
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onEntryClick(entry.id)}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="block truncate text-sm font-medium">{title || SECTION_LABELS[section.sectionType]}</span>
                    {preview && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{preview}</span>}
                  </button>
                )
              })}
              <Button variant="outline" size="sm" onClick={onAddEntry}>
                <Plus className="size-3" /> Add entry
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AvatarControls({ personal, onChange }: {
  personal: PersonalDetails
  onChange: (patch: Partial<PersonalDetails>) => void
}) {
  const fileId = personal.photo?.fileId || ''
  const imageUrl = personal.photo?.imageId || ''
  const upload = useMutation({
    mutationFn: (file: File) => replaceImageAction({ name: 'avatar', image: file, oldFileId: fileId || undefined }),
    onSuccess: (data) => {
      const [img] = data
      if (!img) return
      onChange({ photo: { ...personal.photo, imageId: img.url, fileId: img.fileId } })
      toast.success('Photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })
  const remove = useMutation({
    mutationFn: () => deleteImageAction(fileId),
    onSuccess: () => {
      onChange({ photo: { ...personal.photo, imageId: '', fileId: '' } })
      toast.success('Photo removed')
    },
    onError: () => toast.error('Failed to remove photo'),
  })
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-16 overflow-hidden rounded-full border border-border">
        {imageUrl ? <AvatarImage src={imageUrl} alt={personal.fullName} /> : <AvatarFallback>{personal.fullName.charAt(0) || '?'}</AvatarFallback>}
      </Avatar>
      <div className="flex flex-col gap-1">
        <label htmlFor="avatar-upload" className="cursor-pointer text-xs font-medium text-primary hover:underline">
          {imageUrl ? 'Change photo' : 'Upload photo'}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload.mutate(file)
            e.target.value = ''
          }}
        />
        {imageUrl && (
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="cursor-pointer text-xs text-destructive hover:underline"
          >
            Delete photo
          </button>
        )}
      </div>
      {(upload.isPending || remove.isPending) && <Spinner className="size-4 text-muted-foreground" />}
    </div>
  )
}

function DetailsForm({ personal, onChange }: {
  personal: PersonalDetails
  onChange: (patch: Partial<PersonalDetails>) => void
}) {
  return (
    <div className="space-y-3">
      <AvatarControls personal={personal} onChange={onChange} />
      {(['fullName', 'jobTitle', 'displayEmail', 'phone', 'address', 'website'] as (keyof PersonalDetails)[]).map((key) => (
        <div key={key}>
          <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
          <Input value={personal[key] as string || ''} onChange={(e) => onChange({ [key]: e.target.value } as Partial<PersonalDetails>)} />
        </div>
      ))}
      <div>
        <Label className="text-xs">LinkedIn</Label>
        <Input value={personal.social?.linkedIn?.display || ''} onChange={(e) => onChange({ social: { ...personal.social, linkedIn: { ...personal.social?.linkedIn, display: e.target.value, link: e.target.value } } })} />
      </div>
      <div>
        <Label className="text-xs">GitHub</Label>
        <Input value={personal.social?.github?.display || ''} onChange={(e) => onChange({ social: { ...personal.social, github: { ...personal.social?.github, display: e.target.value, link: e.target.value } } })} />
      </div>
    </div>
  )
}

export default function ResumeEditorPage() {
  const params = useParams()
  const id = params.id as string
  const { data: doc, isLoading } = useResumeDocument(id)
  const savePersonal = useSaveResumePersonalDetails()
  const saveCustom = useSaveResumeCustomization()
  const rename = useRenameResume()
  const addSection = useAddSection(id)
  const deleteSection = useDeleteSection(id)
  const addEntry = useAddEntry(id)
  const deleteEntry = useDeleteEntry(id)
  const updateData = useUpdateEntryData(id)
  const saveSectionMeta = useSaveSectionMeta(id)
  const reorderSections = useReorderSections(id)
  const share = useShareResume()

  const [sections, setSections] = useState<TSection[]>([])
  const [personal, setPersonal] = useState<PersonalDetails>(EMPTY_PERSONAL_DETAILS)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOMIZATION)
  const [editing, setEditing] = useState<{ sectionId: string; entryId: string } | null>(null)
  const hydrateStyle = useResumeStyleStore((s) => s.hydrate)
  const [tab, setTab] = useState<'content' | 'design'>('content')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const dirty = useRef(false)

  useEffect(() => {
    if (doc) {
      const next = [...(doc.sections || [])].sort((a, b) => a.order - b.order)
      setSections(next)
      setPersonal({ ...EMPTY_PERSONAL_DETAILS, ...doc.resume.personalDetails })
      const merged = mergeCustomization(DEFAULT_CUSTOMIZATION, doc.resume.customization)
      setCustom(merged)
      hydrateStyle(merged)
      setTitleDraft(doc.resume.title)
      // Profile section is mandatory: auto-create it if missing, and keep exactly one entry.
      if (!next.some((s) => s.sectionType === 'profile')) {
        addSection.mutate('profile')
      }
    }
  }, [doc])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      savePersonal.mutate({ id, personalDetails: personal })
      saveCustom.mutate({ id, customization: custom })
    }, 1500)
    return () => clearTimeout(t)
  }, [personal, custom])

  useEffect(() => {
    if (!dirty.current || editing) return
    const t = setTimeout(() => {
      for (const s of sections) {
        for (const e of s.entries) {
          if (e._dirty) updateData.mutate({ entryId: e.id, data: e.data })
        }
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [sections, editing])

  function markDirty() { dirty.current = true }

  function mutateData(sectionId: string, entryId: string, patch: Partial<EntryData>) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sectionId) return s
      return { ...s, entries: s.entries.map((e) => {
        if (e.id !== entryId) return e
        return { ...e, _dirty: true, data: { ...e.data, ...patch } as EntryData }
      }) }
    }))
    markDirty()
  }

  function patchPersonal(patch: Partial<PersonalDetails>) {
    setPersonal((p) => ({ ...p, ...patch }))
    markDirty()
  }

  function patchSectionHeading(sectionId: string, patch: { style?: HeadingStyle; showTitle?: boolean }) {
    setCustom((c) => ({ ...c, sectionHeadings: { ...c.sectionHeadings, [sectionId]: { ...c.sectionHeadings?.[sectionId], ...patch } } }))
    markDirty()
  }

  function openEntryEdit(sectionId: string, entryId: string) {
    setEditing({ sectionId, entryId })
  }

  function closeEntryEdit(save: boolean) {
    if (save) {
      dirty.current = true
      const editingEntry = sections
        .find((s) => s.id === editing?.sectionId)
        ?.entries.find((e) => e.id === editing?.entryId)
      if (editingEntry?._dirty) {
        updateData.mutate({ entryId: editingEntry.id, data: editingEntry.data })
      }
    } else if (doc) {
      const snapshot = [...(doc.sections || [])].sort((a, b) => a.order - b.order)
      setSections((prev) =>
        snapshot.map((s) => {
          const local = prev.find((p) => p.id === s.id)
          return local ? { ...s, hidden: local.hidden } : s
        })
      )
    }
    setEditing(null)
  }

  function handlePrint() {
    const name = (custom.fileName || resume?.title || 'resume').replace(/\.pdf$/i, '').trim() || 'resume'
    printWithFileName(name)
  }

  const resume = doc?.resume

  if (isLoading) {
    return (
      <EditorShell
        header={<EditorHeader overviewHref="/app/resumes" activeTab={tab} onTabChange={setTab} onDownload={() => {}} />}
        sidebar={<div />}
        preview={<PageLoader />}
      />
    )
  }

  return (
    <>
      <ScreenGate overviewHref="/app/resumes" onDownload={handlePrint} />
      <EditorShell
        header={
          <EditorHeader
            overviewHref="/app/resumes"
            activeTab={tab}
            onTabChange={setTab}
            onDownload={handlePrint}
            share={
              <ShareButton
                live={resume?.webResumeLive ?? false}
                kind="resume"
                pending={share.isPending}
                onToggle={(live) => share.mutateAsync({ id, live })}
              />
            }
          />
        }
        sidebar={
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
              <Button variant="ghost" size="icon-sm" onClick={() => setTab(tab === 'content' ? 'design' : 'content')} aria-label="Swap content/design">
                <ArrowLeftRight className="size-4" />
              </Button>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="h-8 text-sm font-medium"
                placeholder="Resume title"
              />
              <Button size="sm" disabled={!titleDraft.trim() || titleDraft === (resume?.title || '')} onClick={() => { if (titleDraft.trim()) rename.mutate({ id, title: titleDraft.trim() }) }}>
                Save
              </Button>
            </div>
            {tab === 'content' ? (
              editing ? (() => {
                const section = sections.find((s) => s.id === editing.sectionId)
                const entry = section?.entries.find((e) => e.id === editing.entryId)
                if (!section || !entry) return null
                const { title } = entryTitleAndPreview(entry.data)
                return (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex items-center gap-2 border-b p-3">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title || section.displayName}</span>
                      <Button size="sm" onClick={() => closeEntryEdit(true)}>Save</Button>
                      <Button variant="outline" size="sm" onClick={() => closeEntryEdit(false)}>Cancel</Button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-3">
                      <EntryForm
                        entry={entry}
                        sectionType={section.sectionType}
                        onChange={(u) => mutateData(section.id, entry.id, u)}
                        onDelete={() => {
                          deleteEntry.mutate(entry.id)
                          setEditing(null)
                        }}
                      />
                    </div>
                  </div>
                )
              })() : (
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <div className="mb-3 rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 p-3 text-left"
                    onClick={() => setDetailsOpen((o) => !o)}
                  >
                    <UserRound className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">Personal details</span>
                    {detailsOpen ? (
                      <ChevronDown className="size-4 rotate-180 transition-transform" />
                    ) : (
                      <ChevronDown className="size-4 transition-transform" />
                    )}
                  </button>
                  {detailsOpen && (
                    <div className="border-t border-border/60 p-3">
                      <DetailsForm personal={personal} onChange={patchPersonal} />
                    </div>
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[...Object.keys(SECTION_LABELS)].filter((st) => st !== 'profile' && !sections.find((s) => s.sectionType === st as SectionType)).map((st) => (
                    <Button
                      key={st}
                      variant="outline"
                      size="sm"
                      onClick={() => addSection.mutate(st as SectionType)}
                    >
                      <Plus className="size-3" />{SECTION_LABELS[st as keyof typeof SECTION_LABELS]}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {sections
                    .map((section) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        canDelete={section.sectionType !== 'profile'}
                        onToggle={(hidden) => {
                          saveSectionMeta.mutate({ sectionId: section.id, hidden })
                          setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, hidden } : s)))
                        }}
                        onDelete={() => deleteSection.mutate(section.id)}
                        onAddEntry={() => addEntry.mutate(section.id)}
                        onEntryClick={(entryId) => openEntryEdit(section.id, entryId)}
                        saveMeta={(sectionId, patch) => saveSectionMeta.mutate({ sectionId, ...patch })}
                        onSectionHeadingPatch={patchSectionHeading}
                        headingStyle={custom.sectionHeadings?.[section.id]?.style || custom.heading.style}
                        showTitle={custom.sectionHeadings?.[section.id]?.showTitle !== false}
                      />
                    ))}
                </div>
                <div className="py-4">
                  <Button variant="outline" className="w-full" onClick={() => setAddSectionModalOpen(true)}>
                    <Plus className="size-4" /> Add section
                  </Button>
                </div>
              </div>
              )
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <StyleSettings
                  sections={sections}
                  onChange={(next: Customization) => {
                    setCustom(next)
                    hydrateStyle(next)
                    markDirty()
                  }}
                  onReorderSections={(ids) => {
                    const byId = new Map(sections.map((s) => [s.id, s]))
                    const next = ids.map((sid, i) => {
                      const s = byId.get(sid)
                      return s ? { ...s, order: i } : null
                    }).filter(Boolean) as TSection[]
                    setSections(next)
                    reorderSections.mutate(ids)
                  }}
                  onToggleSection={(sectionId, hidden) => {
                    saveSectionMeta.mutate({ sectionId, hidden })
                    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, hidden } : s)))
                  }}
                />
              </div>
            )}
          </div>
        }
        preview={
          <div className="preview-light">
            <ResumeRenderer
              personalDetails={personal}
              sections={sections}
              customization={custom}
            />
          </div>
        }
      />
      <AddSectionModal
        open={addSectionModalOpen}
        onOpenChange={setAddSectionModalOpen}
        onAddSection={(type: SectionType) => addSection.mutate(type)}
      />
    </>
  )
}
