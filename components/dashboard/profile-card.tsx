'use client'

import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfileAction } from '@/server/user/profile.actions'
import { getErrorMessage } from '@/lib/utils'

export function ProfileCard({
  name,
  image,
  email,
}: {
  name: string
  image: string | null
  email: string
}) {
  const [editName, setEditName] = useState(name)
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: async (img: Blob | undefined) =>
      updateProfileAction({ name: editName, ...(img ? { image: img } : {}) }),
    onSuccess: () => {
      toast.success('Profile updated')
      setPreview(null)
      window.location.reload()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const dirty = editName.trim() !== name || preview

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        <Avatar className="size-16">
          {preview || image ? (
            <AvatarImage src={preview || image!} alt={name} />
          ) : (
            <AvatarFallback>{name.charAt(0) || '?'}</AvatarFallback>
          )}
        </Avatar>
        <button
          type="button"
          aria-label="Change photo"
          className="border-border bg-background text-muted-foreground hover:text-foreground absolute -right-1 -bottom-1 rounded-full border p-1.5"
          onClick={() => fileRef.current?.click()}
        >
          <Camera className="size-3.5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setPreview(URL.createObjectURL(f))
          }}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-muted-foreground truncate text-xs">{email}</p>
        <div className="flex items-center gap-2">
          <Input
            aria-label="Display name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-9 max-w-60"
            maxLength={80}
          />
          <Button
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate(fileRef.current?.files?.[0])}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
