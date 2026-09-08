'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateProfileAction } from '@/server/user/profile.actions'
import { getErrorMessage } from '@/lib/utils'

export function NameEditor({ name }: { name: string }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setValue(name)
      inputRef.current?.select()
    }
  }, [editing, name])

  const save = useMutation({
    mutationFn: async (newName: string) => updateProfileAction({ name: newName }),
    onSuccess: () => {
      toast.success('Profile updated')
      setEditing(false)
      window.location.reload()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const submit = () => {
    if (value.trim() && value.trim() !== name) save.mutate(value.trim())
    else setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5">
        <h1 className="text-2xl font-semibold">
          Welcome back{name ? `, ${name}` : ''}
        </h1>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Edit name"
          title="Edit name"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        aria-label="Display name"
        value={value}
        maxLength={80}
        className="h-9 max-w-60"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setEditing(false)
        }}
        onBlur={submit}
        autoFocus
      />
      <Button
        size="icon-sm"
        aria-label="Save name"
        title="Save name"
        disabled={!value.trim() || value.trim() === name || save.isPending}
        onMouseDown={(e) => e.preventDefault()}
        onClick={submit}
      >
        <Check className="size-4" />
      </Button>
    </div>
  )
}
