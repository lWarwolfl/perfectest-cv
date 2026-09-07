'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabeledInput } from '@/components/ui/labeled'
import { Field, FieldLabel } from '@/components/ui/field'
import RichTextEditor from '@/components/editor/rich-text-editor'
import LinkDialog from '@/components/editor/link-dialog'
import { PhotoControls } from '@/components/editor/photo-controls'
import MonthYearPicker from '@/components/editor/month-year-picker'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import type {
  TSection,
  PersonalDetails,
  SectionType,
  EntryData,
  SkillEntry,
  LanguageEntry,
} from '@/features/resume/types'

export function TitleInput({
  label,
  value,
  link,
  placeholder,
  onChange,
  onLinkChange,
  hidden,
  onHiddenChange,
}: {
  label: string
  value: string
  link?: string
  placeholder?: string
  onChange: (v: string) => void
  onLinkChange?: (url: string) => void
  hidden?: boolean
  onHiddenChange?: (v: boolean) => void
}) {
  const id = `ti-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {onHiddenChange && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={hidden ? 'Show in document' : 'Hide from document'}
            title={hidden ? 'Hidden — click to show' : 'Shown — click to hide'}
            onClick={() => onHiddenChange(!hidden)}
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        )}
        {onLinkChange && <LinkDialog value={link || ''} onConfirm={onLinkChange} />}
      </div>
    </Field>
  )
}

function AvatarControls({
  personal,
  onChange,
}: {
  personal: PersonalDetails
  onChange: (patch: Partial<PersonalDetails>) => void
}) {
  return (
    <PhotoControls
      imageUrl={personal.photo?.imageId || ''}
      fileId={personal.photo?.fileId || ''}
      fullName={personal.fullName}
      inputId="avatar-upload"
      onChange={(photo) =>
        onChange({ photo: { ...personal.photo, ...photo } as PersonalDetails['photo'] })
      }
    />
  )
}

/** Plain non-link text fields of the personal details form. */
const PERSONAL_FIELDS = [
  ['fullName', 'Full name'],
  ['jobTitle', 'Job title'],
  ['address', 'Address'],
] as const

export function PersonalDetailsForm({
  personal,
  onChange,
}: {
  personal: PersonalDetails
  onChange: (patch: Partial<PersonalDetails>) => void
}) {
  const social = personal.social || { linkedIn: { link: '', display: '' }, github: { link: '', display: '' } }
  const hidden = personal.hiddenDetails || []
  const toggleHidden = (key: string, v: boolean) =>
    onChange({
      hiddenDetails: v ? [...hidden, key] : hidden.filter((k) => k !== key),
    })
  return (
    <div className="space-y-3">
      <AvatarControls personal={personal} onChange={onChange} />
      {(
        [
          ['Full name', 'fullName'],
          ['Job title', 'jobTitle'],
          ['Address', 'address'],
        ] as const
      ).map(([label, key]) => (
        <LabeledInput
          key={key}
          label={label}
          id={`pd-${key}`}
          value={(personal[key] as string) || ''}
          onChange={(e) => onChange({ [key]: e.target.value } as Partial<PersonalDetails>)}
        />
      ))}
      <TitleInput
        label="Email"
        value={personal.displayEmail || ''}
        link={personal.emailLink || ''}
        hidden={hidden.includes('displayEmail')}
        onHiddenChange={(v) => toggleHidden('displayEmail', v)}
        onChange={(v) => onChange({ displayEmail: v })}
        onLinkChange={(url) => onChange({ emailLink: url })}
      />
      <TitleInput
        label="Phone"
        value={personal.phone || ''}
        link={personal.phoneLink || ''}
        hidden={hidden.includes('phone')}
        onHiddenChange={(v) => toggleHidden('phone', v)}
        onChange={(v) => onChange({ phone: v })}
        onLinkChange={(url) => onChange({ phoneLink: url })}
      />
      <TitleInput
        label="Website"
        value={personal.website || ''}
        link={personal.websiteLink || ''}
        hidden={hidden.includes('website')}
        onHiddenChange={(v) => toggleHidden('website', v)}
        onChange={(v) => onChange({ website: v })}
        onLinkChange={(url) => onChange({ websiteLink: url })}
      />
      <TitleInput
        label="LinkedIn"
        value={social.linkedIn?.display || ''}
        link={social.linkedIn?.link || ''}
        hidden={hidden.includes('linkedIn')}
        onHiddenChange={(v) => toggleHidden('linkedIn', v)}
        onChange={(v) => onChange({ social: { ...social, linkedIn: { ...social.linkedIn, display: v } } })}
        onLinkChange={(url) => onChange({ social: { ...social, linkedIn: { ...social.linkedIn, link: url } } })}
      />
      <TitleInput
        label="GitHub"
        value={social.github?.display || ''}
        link={social.github?.link || ''}
        hidden={hidden.includes('github')}
        onHiddenChange={(v) => toggleHidden('github', v)}
        onChange={(v) => onChange({ social: { ...social, github: { ...social.github, display: v } } })}
        onLinkChange={(url) => onChange({ social: { ...social, github: { ...social.github, link: url } } })}
      />
    </div>
  )
}

export function EntryForm({
  entry,
  sectionType,
  onChange,
  onDelete,
}: {
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
          <span className="text-muted-foreground text-xs font-medium">Role</span>
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <TitleInput label="Job title" value={e.jobTitle} onChange={(v) => up({ jobTitle: v })} />
        <TitleInput
          label="Employer"
          value={e.employer}
          link={e.employerLink}
          placeholder="Employer"
          onChange={(v) => up({ employer: v })}
          onLinkChange={(url) => up({ employerLink: url })}
        />
        <LabeledInput
          label="Location"
          placeholder="Location"
          value={e.location}
          onChange={(v) => up({ location: v.target.value })}
        />
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium">Start</span>
            <MonthYearPicker
              value={
                e.startDate?.month && e.startDate?.year
                  ? `${e.startDate.month}/${e.startDate.year}`
                  : e.startDate?.year || ''
              }
              onChange={(v) => {
                const [m, y] = v.split('/')
                up({
                  startDate: {
                    hide: false,
                    year: y || '',
                    month: m || '',
                    ongoing: false,
                    onlyYear: false,
                    customOngoingWord: 'present',
                  },
                })
              }}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium">End</span>
            <MonthYearPicker
              value={
                e.endDate?.month && e.endDate?.year
                  ? `${e.endDate.month}/${e.endDate.year}`
                  : e.endDate?.year || ''
              }
              onChange={(v) => {
                const [m, y] = v.split('/')
                up({
                  endDate: {
                    hide: false,
                    year: y || '',
                    month: m || '',
                    ongoing: !v,
                    onlyYear: false,
                    customOngoingWord: 'present',
                  },
                })
              }}
            />
          </div>
        </div>
        <RichTextEditor
          compact
          value={e.description}
          onUpdate={(html) => up({ description: html })}
        />
      </div>
    )
  }
  if (sectionType === 'education') {
    const e = entry.data as Extract<EntryData, { type: 'education' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Education</span>
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <TitleInput label="Degree" value={e.degree} onChange={(v) => up({ degree: v })} />
        <TitleInput
          label="School"
          value={e.school}
          link={e.schoolLink}
          placeholder="e.g. University of Tehran"
          onChange={(v) => up({ school: v })}
          onLinkChange={(url) => up({ schoolLink: url })}
        />
        <LabeledInput
          label="Location"
          placeholder="Location"
          value={e.location}
          onChange={(v) => up({ location: v.target.value })}
        />
        <div className="flex gap-2">
          <LabeledInput
            label="Start"
            placeholder="YYYY"
            value={e.startDate?.year || ''}
            onChange={(v) =>
              up({
                startDate: {
                  hide: false,
                  year: v.target.value,
                  month: '',
                  ongoing: false,
                  onlyYear: true,
                  customOngoingWord: 'present',
                },
              })
            }
          />
          <LabeledInput
            label="End"
            placeholder="YYYY"
            value={e.endDate?.year || ''}
            onChange={(v) =>
              up({
                endDate: {
                  hide: false,
                  year: v.target.value,
                  month: '',
                  ongoing: !v.target.value,
                  onlyYear: true,
                  customOngoingWord: 'present',
                },
              })
            }
          />
        </div>
        <RichTextEditor
          compact
          value={e.description}
          onUpdate={(html) => up({ description: html })}
        />
      </div>
    )
  }
  if (sectionType === 'skill' || sectionType === 'language') {
    const e = entry.data as SkillEntry
    const nameKey = sectionType === 'skill' ? 'skill' : 'language'
    const nameValue = sectionType === 'skill' ? e.skill : (entry.data as LanguageEntry).language
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <Input
            aria-label={sectionType === 'skill' ? 'Skill name' : 'Language name'}
            placeholder={sectionType === 'skill' ? 'Skill name' : 'Language name'}
            value={nameValue}
            onChange={(v) => up({ [nameKey]: v.target.value } as Partial<EntryData>)}
          />
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <RichTextEditor
          compact
          value={e.infoHtml}
          onUpdate={(html) => up({ infoHtml: html } as Partial<EntryData>)}
        />
      </div>
    )
  }
  if (sectionType === 'interest') {
    const e = entry.data as Extract<EntryData, { type: 'interest' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Interest</span>
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <TitleInput
          label="Interest"
          value={e.interest}
          link={e.interestLink}
          onChange={(v) => up({ interest: v })}
          onLinkChange={(url) => up({ interestLink: url })}
        />
        <RichTextEditor
          compact
          value={e.infoHtml}
          onUpdate={(html) => up({ infoHtml: html } as Partial<EntryData>)}
        />
      </div>
    )
  }
  if (sectionType === 'project') {
    const e = entry.data as Extract<EntryData, { type: 'project' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Project</span>
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <TitleInput
          label="Title"
          value={e.projectTitle}
          link={e.projectTitleLink}
          placeholder="e.g. Perfectest CV"
          onChange={(v) => up({ projectTitle: v })}
          onLinkChange={(url) => up({ projectTitleLink: url })}
        />
        <LabeledInput
          label="Subtitle"
          placeholder="Subtitle"
          value={e.subTitle}
          onChange={(v) => up({ subTitle: v.target.value })}
        />
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium">Start</span>
            <MonthYearPicker
              value={`${e.startDate.month}/${e.startDate.year}`.replace(/^\/|\/$/g, '')}
              onChange={(v) => {
                const [m, y] = v.split('/')
                up({
                  startDate: {
                    hide: false,
                    year: y || '',
                    month: m || '',
                    ongoing: false,
                    onlyYear: false,
                    customOngoingWord: 'present',
                  },
                })
              }}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <span className="text-muted-foreground text-xs font-medium">End</span>
            <MonthYearPicker
              value={
                e.endDate.ongoing
                  ? ''
                  : `${e.endDate.month}/${e.endDate.year}`.replace(/^\/|\/$/g, '')
              }
              onChange={(v) => {
                const [m, y] = v.split('/')
                up({
                  endDate: {
                    hide: false,
                    year: y || '',
                    month: m || '',
                    ongoing: !v,
                    onlyYear: false,
                    customOngoingWord: 'present',
                  },
                })
              }}
            />
          </div>
        </div>
        <RichTextEditor
          compact
          value={e.description}
          onUpdate={(html) => up({ description: html })}
        />
      </div>
    )
  }
  if (sectionType === 'certificate') {
    const e = entry.data as Extract<EntryData, { type: 'certificate' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">Certificate</span>
          <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
            <Trash2 className="size-3" />
          </Button>
        </div>
        <TitleInput
          label="Title"
          value={e.title}
          link={e.link}
          placeholder="Title"
          onChange={(v) => up({ title: v })}
          onLinkChange={(url) => up({ link: url })}
        />
        <LabeledInput
          label="Issuer"
          placeholder="Issuer"
          value={e.issuer}
          onChange={(v) => up({ issuer: v.target.value })}
        />
        <LabeledInput
          label="Date"
          placeholder="Date"
          value={e.date}
          onChange={(v) => up({ date: v.target.value })}
        />
      </div>
    )
  }
  if (sectionType === 'profile') {
    const e = entry.data as Extract<EntryData, { type: 'profile' }>
    return <RichTextEditor value={e.text} onUpdate={(html) => up({ text: html })} />
  }
  const e = entry.data as Extract<
    EntryData,
    {
      type:
        'custom' | 'publication' | 'organisation' | 'course' | 'award' | 'reference' | 'declaration'
    }
  >
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">Entry</span>
        <Button variant="ghost" size="icon-sm" aria-label="Delete entry" onClick={onDelete}>
          <Trash2 className="size-3" />
        </Button>
      </div>
      {'title' in e && (
        <TitleInput
          label="Title"
          value={e.title}
          link={'link' in e ? e.link : undefined}
          placeholder="Title"
          onChange={(v) => up({ title: v })}
          onLinkChange={'link' in e ? (url) => up({ link: url } as Partial<EntryData>) : undefined}
        />
      )}
      {'subTitle' in e && (
        <LabeledInput
          label="Subtitle"
          placeholder="Subtitle"
          value={e.subTitle}
          onChange={(v) => up({ subTitle: v.target.value })}
        />
      )}
      {'issuer' in e && (
        <LabeledInput
          label="Issuer"
          placeholder="Issuer"
          value={e.issuer}
          onChange={(v) => up({ issuer: v.target.value })}
        />
      )}
      {'date' in e && (
        <LabeledInput
          label="Date"
          placeholder="Date"
          value={e.date}
          onChange={(v) => up({ date: v.target.value })}
        />
      )}
      {'contact' in e && (
        <LabeledInput
          label="Contact"
          placeholder="Contact"
          value={e.contact}
          onChange={(v) => up({ contact: v.target.value })}
        />
      )}
      {'name' in e && (
        <LabeledInput
          label="Name"
          placeholder="Name"
          value={e.name}
          onChange={(v) => up({ name: v.target.value })}
        />
      )}
      {'text' in e && (
        <RichTextEditor
          compact
          value={e.text}
          onUpdate={(html) => up({ text: html } as Partial<EntryData>)}
        />
      )}
      {'description' in e && (
        <RichTextEditor
          compact
          value={e.description}
          onUpdate={(html) => up({ description: html } as Partial<EntryData>)}
        />
      )}
    </div>
  )
}
