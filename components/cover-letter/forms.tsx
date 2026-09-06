'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RichTextEditor from '@/components/editor/rich-text-editor'
import { replaceImageAction, deleteImageAction } from '@/server/image/uploadImage.action'
import type { LetterContentPatch } from '@/server/letter/letter.actions'

interface FormProps {
  value: LetterContentPatch
  onChange: (patch: Partial<LetterContentPatch>) => void
}

function fieldId(label: string) {
  return `lf-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function SenderDetailsForm({ value, onChange }: FormProps) {
  const fileId = value.senderPhotoFileId || ''
  const imageUrl = value.senderPhotoImageId || ''
  const upload = useMutation({
    mutationFn: (file: File) =>
      replaceImageAction({ name: 'avatar', image: file, oldFileId: fileId || undefined }),
    onSuccess: (data) => {
      const [img] = data
      if (!img) return
      onChange({ senderPhotoImageId: img.url, senderPhotoFileId: img.fileId })
      toast.success('Photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })
  const remove = useMutation({
    mutationFn: () => deleteImageAction(fileId),
    onSuccess: () => {
      onChange({ senderPhotoImageId: '', senderPhotoFileId: '' })
      toast.success('Photo removed')
    },
    onError: () => toast.error('Failed to remove photo'),
  })
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel>Photo</FieldLabel>
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="profile"
              className="border-border size-16 rounded-full border object-cover"
            />
          ) : (
            <div className="border-border text-muted-foreground flex size-16 items-center justify-center rounded-full border text-sm">
              ?
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="letter-photo-upload"
              className="text-primary cursor-pointer text-xs font-medium hover:underline"
            >
              {imageUrl ? 'Change photo' : 'Upload photo'}
            </label>
            <input
              id="letter-photo-upload"
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
                className="text-destructive cursor-pointer text-xs hover:underline"
              >
                Delete photo
              </button>
            )}
          </div>
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Full Name')}>Full Name</FieldLabel>
        <Input
          id={fieldId('Full Name')}
          value={value.senderName || ''}
          onChange={(e) => onChange({ senderName: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Professional Title')}>Professional Title</FieldLabel>
        <Input
          id={fieldId('Professional Title')}
          value={value.senderJobTitle || ''}
          onChange={(e) => onChange({ senderJobTitle: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Email')}>Email</FieldLabel>
        <Input
          id={fieldId('Email')}
          type="email"
          value={value.senderEmail || ''}
          onChange={(e) => onChange({ senderEmail: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Phone')}>Phone</FieldLabel>
        <Input
          id={fieldId('Phone')}
          value={value.senderPhone || ''}
          onChange={(e) => onChange({ senderPhone: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Address')}>Address</FieldLabel>
        <Input
          id={fieldId('Address')}
          value={value.senderAddress || ''}
          onChange={(e) => onChange({ senderAddress: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Website')}>Website</FieldLabel>
        <Input
          id={fieldId('Website')}
          value={value.senderWebsite || ''}
          onChange={(e) => onChange({ senderWebsite: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('LinkedIn')}>LinkedIn</FieldLabel>
        <Input
          id={fieldId('LinkedIn')}
          value={value.senderLinkedIn || ''}
          onChange={(e) => onChange({ senderLinkedIn: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('GitHub')}>GitHub</FieldLabel>
        <Input
          id={fieldId('GitHub')}
          value={value.senderGitHub || ''}
          onChange={(e) => onChange({ senderGitHub: e.target.value })}
        />
      </Field>
    </div>
  )
}

export function DateForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel htmlFor={fieldId('Date mode')}>Date mode</FieldLabel>
        <Select
          value={value.dateMode || 'current'}
          onValueChange={(v) => onChange({ dateMode: v as LetterContentPatch['dateMode'] })}
        >
          <SelectTrigger id={fieldId('Date mode')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Today</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {value.dateMode === 'custom' && (
        <Field>
          <FieldLabel htmlFor={fieldId('Custom date')}>Custom date</FieldLabel>
          <Input
            id={fieldId('Custom date')}
            value={value.dateCustom || ''}
            onChange={(e) => onChange({ dateCustom: e.target.value })}
            placeholder="February 9, 2025"
          />
        </Field>
      )}
    </div>
  )
}

export function RecipientDetailsForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel htmlFor={fieldId('Recipient Name / Role')}>Recipient Name / Role</FieldLabel>
        <Input
          id={fieldId('Recipient Name / Role')}
          value={value.recipientName || ''}
          onChange={(e) => onChange({ recipientName: e.target.value })}
          placeholder="Hr Manager"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Company Name')}>Company Name</FieldLabel>
        <Input
          id={fieldId('Company Name')}
          value={value.recipientCompany || ''}
          onChange={(e) => onChange({ recipientCompany: e.target.value })}
          placeholder="Eversports"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Location')}>Location</FieldLabel>
        <Input
          id={fieldId('Location')}
          value={value.recipientPosition || ''}
          onChange={(e) => onChange({ recipientPosition: e.target.value })}
          placeholder="Berlin, Germany"
        />
      </Field>
    </div>
  )
}

export function SubjectForm({ value, onChange }: FormProps) {
  return (
    <Field>
      <FieldLabel htmlFor={fieldId('Subject Line')}>Subject Line</FieldLabel>
      <Input
        id={fieldId('Subject Line')}
        value={value.subject || ''}
        onChange={(e) => onChange({ subject: e.target.value })}
        placeholder="Application for Mid-level Frontend Engineer position"
      />
    </Field>
  )
}

export function SignatureForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel htmlFor={fieldId('Sign-off Name')}>Sign-off Name</FieldLabel>
        <Input
          id={fieldId('Sign-off Name')}
          value={value.signatureName || ''}
          onChange={(e) => onChange({ signatureName: e.target.value })}
          placeholder={value.senderName || 'Your Name'}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Closing')}>Closing</FieldLabel>
        <Input
          id={fieldId('Closing')}
          value={value.signaturePlace || ''}
          onChange={(e) => onChange({ signaturePlace: e.target.value })}
          placeholder="Kind regards"
        />
      </Field>
    </div>
  )
}

export function BodyForm({ value, onChange }: FormProps) {
  const body = value.body || ''
  const wordCount = body.split(/\s+/).filter(Boolean).length
  return (
    <div className="space-y-3">
      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel>Body</FieldLabel>
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
            {wordCount} words
          </span>
        </div>
        <RichTextEditor value={body} onUpdate={(content) => onChange({ body: content })} />
      </Field>
    </div>
  )
}
