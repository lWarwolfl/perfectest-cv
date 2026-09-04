'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { useListLetterPreviews, useCreateLetter, useDeleteLetter, useDuplicateLetter } from '@/features/letter/hooks/letter.hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/common/page-loader'
import { PreviewFrame } from '@/components/common/preview-frame'
import { LetterRenderer } from '@/components/cover-letter/letter-renderer'
import { EMPTY_LETTER_DESIGN } from '@/features/letter/types'

export default function LettersPage() {
  const { data: letters, isLoading } = useListLetterPreviews()
  const create = useCreateLetter()
  const del = useDeleteLetter()
  const dup = useDuplicateLetter()
  const [newName, setNewName] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Letter name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9 w-44" />
          <Button onClick={() => { create.mutate(newName.trim() || undefined); setNewName('') }} disabled={create.isPending}>
            <Plus className="size-4" /> New Letter
          </Button>
        </div>
      </div>
      {isLoading && <PageLoader />}
      {!isLoading && !letters?.length && (
        <p className="text-muted-foreground">No cover letters yet. Create your first one.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {letters?.map((l) => (
          <div key={l.id} className="flex flex-col gap-3">
            <PreviewFrame>
              <LetterRenderer form={l} design={{ ...EMPTY_LETTER_DESIGN, ...(l.design || {}) }} showPlaceholder />
            </PreviewFrame>
            <div className="flex flex-col gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <p className="text-xs text-muted-foreground">Updated {new Date(l.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" render={<Link href={`/app/letters/${l.id}`} />}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => dup.mutate(l.id)} disabled={dup.isPending}>
                  <Copy className="size-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={() => del.mutate(l.id)}>
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
