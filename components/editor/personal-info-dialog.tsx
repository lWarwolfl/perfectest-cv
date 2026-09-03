'use client'

import { useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload } from 'lucide-react'
import { uploadImageAction } from '@/server/image/uploadImage.action'
import type { PersonalDetails } from '@/features/resume/types'

interface PersonalDetailsFormValues {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  address: string
}

interface PersonalInfoEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personalDetails: PersonalDetails
  onUpdate: (details: PersonalDetails) => void
}

export default function PersonalInfoEditDialog({
  open,
  onOpenChange,
  personalDetails,
  onUpdate,
}: PersonalInfoEditDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalDetailsFormValues>({
    defaultValues: {
      fullName: personalDetails.fullName,
      jobTitle: personalDetails.jobTitle,
      email: personalDetails.displayEmail,
      phone: personalDetails.phone,
      address: personalDetails.address,
    },
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(personalDetails.photo?.imageId || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImageAction({ name: 'avatar', image: file }),
    onSuccess: (data) => {
      const [img] = data
      if (!img) return
      setAvatarUrl(img.url)
      toast.success('Avatar uploaded')
    },
    onError: () => {
      toast.error('Failed to upload avatar')
    },
  })

  const onSubmit = (data: PersonalDetailsFormValues) => {
    onUpdate({
      ...personalDetails,
      fullName: data.fullName,
      jobTitle: data.jobTitle || '',
      displayEmail: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      photo: {
        ...personalDetails.photo,
        imageId: avatarUrl || personalDetails.photo.imageId,
      },
    })
    onOpenChange(false)
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
    uploadMutation.mutate(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Personal Details</DialogTitle>
          <DialogDescription>Update your personal information and avatar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Full Name" {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" placeholder="Job Title" {...register('jobTitle')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Phone" {...register('phone')} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Address"
              {...register('address')}
              className="min-h-[80px]"
            />
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="avatarUpload" className="flex cursor-pointer items-center gap-3">
                <Upload className="size-4" />
                <span>Upload Avatar</span>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {avatarFile && <span className="text-xs text-muted-foreground">{avatarFile.name}</span>}
              </Label>
              {avatarUrl && (
                <div className="shrink-0">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="size-16 rounded-full border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
