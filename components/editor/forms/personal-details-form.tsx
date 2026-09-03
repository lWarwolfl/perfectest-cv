'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Lightbulb, Link as LinkIcon } from 'lucide-react'
import { uploadImageAction } from '@/server/image/uploadImage.action'
import LinkPopover from '@/components/editor/link-popover'
import type { PersonalDetails } from '@/features/resume/types'

interface PersonalDetailsFormValues {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  address: string
  website: string
  linkedIn: string
  github: string
  nationality: string
  dateOfBirth: string
  visa: string
  passportId: string
  availability: string
}

interface PersonalDetailsFormProps {
  personalDetails: PersonalDetails
  onUpdate: (details: PersonalDetails) => void
}

const EXTRA_FIELDS = [
  { key: 'nationality', label: 'Nationality', sample: 'Your Nationality' },
  { key: 'dateOfBirth', label: 'Date of Birth', sample: '2000-01-01' },
  { key: 'visa', label: 'Visa', sample: 'Visa Type' },
  { key: 'passportId', label: 'Passport or Id', sample: 'Passport ID' },
  { key: 'availability', label: 'Availability', sample: 'Available Now' },
] as const

type ExtraFieldKey = (typeof EXTRA_FIELDS)[number]['key']

export default function PersonalDetailsForm({
  personalDetails,
  onUpdate,
}: PersonalDetailsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<PersonalDetailsFormValues>({
    defaultValues: {
      fullName: personalDetails.fullName,
      jobTitle: personalDetails.jobTitle,
      email: personalDetails.displayEmail,
      phone: personalDetails.phone,
      address: personalDetails.address,
      website: personalDetails.website,
      linkedIn: personalDetails.social?.linkedIn?.link || '',
      github: personalDetails.social?.github?.link || '',
      nationality: personalDetails.nationality || '',
      dateOfBirth: personalDetails.dateOfBirth || '',
      visa: personalDetails.visa || '',
      passportId: personalDetails.passportId || '',
      availability: personalDetails.availability || '',
    },
  })

  function sync() {
    const v = getValues()
    onUpdate({
      ...personalDetails,
      fullName: v.fullName || '',
      jobTitle: v.jobTitle || '',
      displayEmail: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      website: v.website || '',
      social: {
        github: { link: v.github || '', display: v.github || '' },
        linkedIn: { link: v.linkedIn || '', display: v.linkedIn || '' },
      },
      photo: personalDetails.photo,
      nationality: v.nationality || '',
      dateOfBirth: v.dateOfBirth || '',
      visa: v.visa || '',
      passportId: v.passportId || '',
      availability: v.availability || '',
    })
  }

  const reg = (name: keyof PersonalDetailsFormValues) => register(name, { onChange: sync })

  useEffect(() => {
    onUpdate({
      ...personalDetails,
      social: {
        github: { link: personalDetails.social?.github?.link || '', display: personalDetails.social?.github?.display || '' },
        linkedIn: { link: personalDetails.social?.linkedIn?.link || '', display: personalDetails.social?.linkedIn?.display || '' },
      },
    })
  }, [onUpdate, personalDetails])

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImageAction({ name: 'avatar', image: file }),
    onSuccess: (data) => {
      const [img] = data
      if (!img) return
      setAvatarUrl(img.url)
      toast.success('Avatar uploaded')
      onUpdate({
        ...personalDetails,
        photo: { ...personalDetails.photo, imageId: img.url },
      })
    },
    onError: () => {
      toast.error('Failed to upload avatar')
    },
  })

  const [avatarUrl, setAvatarUrl] = useState<string | null>(personalDetails.photo?.imageId || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
    uploadMutation.mutate(file)
  }

  const [activeExtras, setActiveExtras] = useState<ExtraFieldKey[]>(() =>
    EXTRA_FIELDS.filter((f) => personalDetails[f.key]).map((f) => f.key),
  )

  const toggleExtra = (key: ExtraFieldKey, sample: string) => {
    setActiveExtras((prev) => {
      if (prev.includes(key)) {
        setValue(key, '')
        return prev.filter((k) => k !== key)
      }
      setValue(key, sample)
      return [...prev, key]
    })
  }

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onUpdate({
      ...personalDetails,
      fullName: data.fullName,
      jobTitle: data.jobTitle || '',
      displayEmail: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      website: data.website || '',
      social: {
        github: { link: data.github || '', display: data.github || '' },
        linkedIn: { link: data.linkedIn || '', display: data.linkedIn || '' },
      },
      photo: {
        ...personalDetails.photo,
        imageId: avatarUrl || personalDetails.photo.imageId,
      },
      nationality: data.nationality || '',
      dateOfBirth: data.dateOfBirth || '',
      visa: data.visa || '',
      passportId: data.passportId || '',
      availability: data.availability || '',
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-12">
        <div className="flex items-center justify-between md:col-span-12 md:items-start">
          <h2 className="text-xl font-bold text-foreground">Edit Personal Details</h2>
          <Button variant="ghost" size="sm" type="button">
            <Lightbulb className="mr-2 size-4" /> Get Tips
          </Button>
        </div>

        <div className="order-1 flex flex-col items-center justify-center md:order-2 md:col-span-4">
          <div className="group relative">
            <Avatar className="size-24 overflow-hidden rounded-full border-2 border-border shadow-inner">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={personalDetails.fullName} />
              ) : (
                <AvatarFallback>{personalDetails.fullName.charAt(0) || '?'}</AvatarFallback>
              )}
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="avatarUpload"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatarUpload" className="mt-2 cursor-pointer text-xs text-muted-foreground">
            Change Photo
          </label>
          {avatarFile && <span className="mt-1 text-[10px] text-muted-foreground">{avatarFile.name}</span>}
        </div>

        <div className="order-2 space-y-4 md:order-1 md:col-span-8">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Full Name" required {...reg('fullName')} />
          </div>
          <div>
            <Label htmlFor="jobTitle">Professional Title</Label>
            <Input id="jobTitle" placeholder="Professional Title" {...reg('jobTitle')} />
          </div>
        </div>

        <div className="space-y-2 md:col-span-12">
          <div className="flex items-center gap-3">
            <Label htmlFor="email">Email</Label>
            <div className="flex-1">
              <Input id="email" type="email" placeholder="Email" {...reg('email')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex-1">
              <Input id="phone" type="tel" placeholder="Phone" {...reg('phone')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="address">Address</Label>
            <div className="flex-1">
              <Textarea id="address" placeholder="Address" {...reg('address')} className="min-h-[80px]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="website">Website</Label>
            <div className="flex-1">
              <Input id="website" type="url" placeholder="Website" {...reg('website')} />
            </div>
            <LinkPopover
              trigger={
                <Button variant="outline" size="icon" type="button">
                  <LinkIcon className="size-3" />
                </Button>
              }
              onLinkSet={(url) => setValue('website', url)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="linkedIn">LinkedIn</Label>
            <div className="flex-1">
              <Input id="linkedIn" type="url" placeholder="LinkedIn" {...reg('linkedIn')} />
            </div>
            <LinkPopover
              trigger={
                <Button variant="outline" size="icon" type="button">
                  <LinkIcon className="size-3" />
                </Button>
              }
              onLinkSet={(url) => setValue('linkedIn', url)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="github">GitHub</Label>
            <div className="flex-1">
              <Input id="github" type="url" placeholder="GitHub" {...reg('github')} />
            </div>
            <LinkPopover
              trigger={
                <Button variant="outline" size="icon" type="button">
                  <LinkIcon className="size-3" />
                </Button>
              }
              onLinkSet={(url) => setValue('github', url)}
            />
          </div>
        </div>

        <div className="md:col-span-12">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add details</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXTRA_FIELDS.map((field) => (
              <Button
                key={field.key}
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toggleExtra(field.key, field.sample)}
                className={activeExtras.includes(field.key) ? 'bg-muted/80' : ''}
              >
                + {field.label}
              </Button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {EXTRA_FIELDS.map((field) =>
              activeExtras.includes(field.key) ? (
                <div key={field.key} className="flex items-center gap-3">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input id={field.key} placeholder={field.label} {...reg(field.key)} />
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={() => reset()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
