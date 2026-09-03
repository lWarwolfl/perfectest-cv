'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RichTextEditor from '@/components/editor/rich-text-editor'
import type { LetterContentPatch } from '@/server/letter/letter.actions'

interface FormProps {
  value: LetterContentPatch
  onChange: (patch: Partial<LetterContentPatch>) => void
}

export function SenderDetailsForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Full Name</Label>
        <Input value={value.senderName || ''} onChange={(e) => onChange({ senderName: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Professional Title</Label>
        <Input value={value.senderJobTitle || ''} onChange={(e) => onChange({ senderJobTitle: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input type="email" value={value.senderEmail || ''} onChange={(e) => onChange({ senderEmail: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <Input value={value.senderPhone || ''} onChange={(e) => onChange({ senderPhone: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Address</Label>
        <Input value={value.senderAddress || ''} onChange={(e) => onChange({ senderAddress: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>Website</Label>
        <Input value={value.senderWebsite || ''} onChange={(e) => onChange({ senderWebsite: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>LinkedIn</Label>
        <Input value={value.senderLinkedIn || ''} onChange={(e) => onChange({ senderLinkedIn: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label>GitHub</Label>
        <Input value={value.senderGitHub || ''} onChange={(e) => onChange({ senderGitHub: e.target.value })} />
      </div>
    </div>
  )
}

export function DateForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Date mode</Label>
        <Select value={value.dateMode || 'current'} onValueChange={(v) => onChange({ dateMode: v as LetterContentPatch['dateMode'] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Today</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value.dateMode === 'custom' && (
        <div className="space-y-1">
          <Label>Custom date</Label>
          <Input value={value.dateCustom || ''} onChange={(e) => onChange({ dateCustom: e.target.value })} placeholder="February 9, 2025" />
        </div>
      )}
    </div>
  )
}

export function RecipientDetailsForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Recipient Name / Role</Label>
        <Input value={value.recipientName || ''} onChange={(e) => onChange({ recipientName: e.target.value })} placeholder="Hr Manager" />
      </div>
      <div className="space-y-1">
        <Label>Company Name</Label>
        <Input value={value.recipientCompany || ''} onChange={(e) => onChange({ recipientCompany: e.target.value })} placeholder="Eversports" />
      </div>
      <div className="space-y-1">
        <Label>Department</Label>
        <Input value={value.recipientPosition || ''} onChange={(e) => onChange({ recipientPosition: e.target.value })} placeholder="Engineering Team" />
      </div>
      <div className="space-y-1">
        <Label>Address & City</Label>
        <Textarea value={value.recipientAddress || ''} onChange={(e) => onChange({ recipientAddress: e.target.value })} />
      </div>
    </div>
  )
}

export function SubjectForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-1">
      <Label>Subject Line</Label>
      <Input
        value={value.subject || ''}
        onChange={(e) => onChange({ subject: e.target.value })}
        placeholder="Application for Mid-level Frontend Engineer position"
      />
    </div>
  )
}

export function SignatureForm({ value, onChange }: FormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Sign-off Name</Label>
        <Input value={value.signatureName || ''} onChange={(e) => onChange({ signatureName: e.target.value })} placeholder={value.senderName || 'Your Name'} />
      </div>
      <div className="space-y-1">
        <Label>Place</Label>
        <Input value={value.signaturePlace || ''} onChange={(e) => onChange({ signaturePlace: e.target.value })} />
      </div>
    </div>
  )
}

export function BodyForm({ value, onChange }: FormProps) {
  const body = value.body || ''
  const wordCount = body.split(/\s+/).filter(Boolean).length
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Body</Label>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{wordCount} words</span>
      </div>
      <RichTextEditor value={body} onUpdate={(content) => onChange({ body: content })} />
    </div>
  )
}
