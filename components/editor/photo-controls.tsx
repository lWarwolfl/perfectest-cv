'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { replaceImageAction, deleteImageAction } from '@/server/image/uploadImage.action'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

/**
 * Shared photo upload/remove controls for personal-details forms (resume + letter).
 * Buttons use the Button component and stay vertically centered next to the avatar.
 */
export function PhotoControls({
  imageUrl,
  fileId,
  fullName,
  inputId,
  onChange,
}: {
  imageUrl: string
  fileId: string
  fullName: string
  inputId: string
  onChange: (photo: { imageId: string; fileId: string }) => void
}) {
  const upload = useMutation({
    mutationFn: (file: File) =>
      replaceImageAction({ name: 'avatar', image: file, oldFileId: fileId || undefined }),
    onSuccess: (data) => {
      const [img] = data
      if (!img) return
      onChange({ imageId: img.url, fileId: img.fileId })
      toast.success('Photo updated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: () => deleteImageAction(fileId),
    onSuccess: () => {
      onChange({ imageId: '', fileId: '' })
      toast.success('Photo removed')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  return (
    <div className="flex items-center gap-3">
      <Avatar className="border-border size-16 shrink-0 overflow-hidden rounded-full border">
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={fullName} />
        ) : (
          <AvatarFallback>{fullName.charAt(0) || '?'}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-1 flex-col items-start gap-1.5">
        <Button
          variant="outline"
          size="xs"
          render={
            <label htmlFor={inputId} className="cursor-pointer" />
          }
        >
          {imageUrl ? 'Change photo' : 'Upload photo'}
        </Button>
        <input
          id={inputId}
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
          <Button
            variant="ghost"
            size="xs"
            className="text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            Delete photo
          </Button>
        )}
      </div>
      {(upload.isPending || remove.isPending) && (
        <Spinner className="text-muted-foreground size-4" />
      )}
    </div>
  )
}
