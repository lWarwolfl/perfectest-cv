'use client'

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
import { PhotoControls } from '@/components/editor/photo-controls'
import LinkDialog from '@/components/editor/link-dialog'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import type { LetterContentPatch } from '@/server/letter/letter.actions'

interface FormProps {
  value: LetterContentPatch
  onChange: (patch: Partial<LetterContentPatch>) => void
}

function fieldId(label: string) {
  return `lf-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function SenderDetailsForm({
  value,
  onChange,
  hiddenDetails,
  onHiddenToggle,
}: {
  value: LetterContentPatch
  onChange: (patch: Partial<LetterContentPatch>) => void
  hiddenDetails?: string[]
  onHiddenToggle?: (key: string, hidden: boolean) => void
}) {
  return (
    <div className="space-y-3">
      <Field>
        <FieldLabel>Photo</FieldLabel>
        <PhotoControls
          imageUrl={value.senderPhotoImageId || ''}
          fileId={value.senderPhotoFileId || ''}
          fullName={value.senderName || '?'}
          inputId="letter-photo-upload"
          onChange={(photo) =>
            onChange({ senderPhotoImageId: photo.imageId, senderPhotoFileId: photo.fileId })
          }
        />
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
        <div className="flex items-center gap-2">
          <Input
            id={fieldId('Email')}
            type="email"
            value={value.senderEmail || ''}
            onChange={(e) => onChange({ senderEmail: e.target.value })}
          />
          {onHiddenToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={(hiddenDetails || []).includes('displayEmail') ? 'Show in document' : 'Hide from document'}
              title={(hiddenDetails || []).includes('displayEmail') ? 'Hidden — click to show' : 'Shown — click to hide'}
              onClick={() => onHiddenToggle('displayEmail', !(hiddenDetails || []).includes('displayEmail'))}
            >
              {(hiddenDetails || []).includes('displayEmail') ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          )}
          <LinkDialog
            value={value.senderEmailLink || ''}
            onConfirm={(url) => onChange({ senderEmailLink: url })}
          />
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('Phone')}>Phone</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id={fieldId('Phone')}
            value={value.senderPhone || ''}
            onChange={(e) => onChange({ senderPhone: e.target.value })}
          />
          {onHiddenToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={(hiddenDetails || []).includes('phone') ? 'Show in document' : 'Hide from document'}
              title={(hiddenDetails || []).includes('phone') ? 'Hidden — click to show' : 'Shown — click to hide'}
              onClick={() => onHiddenToggle('phone', !(hiddenDetails || []).includes('phone'))}
            >
              {(hiddenDetails || []).includes('phone') ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          )}
          <LinkDialog
            value={value.senderPhoneLink || ''}
            onConfirm={(url) => onChange({ senderPhoneLink: url })}
          />
        </div>
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
        <div className="flex items-center gap-2">
          <Input
            id={fieldId('Website')}
            value={value.senderWebsite || ''}
            onChange={(e) => onChange({ senderWebsite: e.target.value })}
          />
          {onHiddenToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={(hiddenDetails || []).includes('website') ? 'Show in document' : 'Hide from document'}
              title={(hiddenDetails || []).includes('website') ? 'Hidden — click to show' : 'Shown — click to hide'}
              onClick={() => onHiddenToggle('website', !(hiddenDetails || []).includes('website'))}
            >
              {(hiddenDetails || []).includes('website') ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          )}
          <LinkDialog
            value={value.senderWebsiteLink || ''}
            onConfirm={(url) => onChange({ senderWebsiteLink: url })}
          />
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('LinkedIn')}>LinkedIn</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id={fieldId('LinkedIn')}
            value={value.senderLinkedIn || ''}
            onChange={(e) => onChange({ senderLinkedIn: e.target.value })}
          />
          {onHiddenToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={(hiddenDetails || []).includes('linkedIn') ? 'Show in document' : 'Hide from document'}
              title={(hiddenDetails || []).includes('linkedIn') ? 'Hidden — click to show' : 'Shown — click to hide'}
              onClick={() => onHiddenToggle('linkedIn', !(hiddenDetails || []).includes('linkedIn'))}
            >
              {(hiddenDetails || []).includes('linkedIn') ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          )}
          <LinkDialog
            value={value.senderLinkedInLink || ''}
            onConfirm={(url) => onChange({ senderLinkedInLink: url })}
          />
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor={fieldId('GitHub')}>GitHub</FieldLabel>
        <div className="flex items-center gap-2">
          <Input
            id={fieldId('GitHub')}
            value={value.senderGitHub || ''}
            onChange={(e) => onChange({ senderGitHub: e.target.value })}
          />
          {onHiddenToggle && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={(hiddenDetails || []).includes('github') ? 'Show in document' : 'Hide from document'}
              title={(hiddenDetails || []).includes('github') ? 'Hidden — click to show' : 'Shown — click to hide'}
              onClick={() => onHiddenToggle('github', !(hiddenDetails || []).includes('github'))}
            >
              {(hiddenDetails || []).includes('github') ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          )}
          <LinkDialog
            value={value.senderGitHubLink || ''}
            onConfirm={(url) => onChange({ senderGitHubLink: url })}
          />
        </div>
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
