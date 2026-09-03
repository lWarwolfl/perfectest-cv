'use client'

import { useListLetters, useCreateLetter, useDeleteLetter } from '@/features/letter/hooks/letter.hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function LettersPage() {
  const { data: letters, isLoading } = useListLetters()
  const create = useCreateLetter()
  const del = useDeleteLetter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cover Letters</h1>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          New Letter
        </Button>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && !letters?.length && (
        <p className="text-muted-foreground">No cover letters yet. Create your first one.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {letters?.map((l) => (
          <Card key={l.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{l.title}</CardTitle>
              <CardDescription>Updated {new Date(l.updatedAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href={`/app/letters/${l.id}`}>
                <Button size="sm">Edit</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => del.mutate(l.id)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}