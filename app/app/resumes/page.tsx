'use client'

import Link from 'next/link'
import { useListResumes, useCreateResume, useDeleteResume } from '@/features/resume/hooks/resume.hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ResumesPage() {
  const { data: resumes, isLoading } = useListResumes()
  const create = useCreateResume()
  const del = useDeleteResume()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumes</h1>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          New Resume
        </Button>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && !resumes?.length && (
        <p className="text-muted-foreground">
          No resumes yet. Create your first one.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resumes?.map((r) => (
          <Card key={r.id} className="group relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{r.title}</CardTitle>
              <CardDescription>
                Updated {new Date(r.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href={`/app/resumes/${r.id}`}>
                <Button size="sm">Edit</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => del.mutate(r.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {resumes?.length ? (
          <Card>
            <CardContent className="flex h-full items-center justify-center py-8">
              <Button variant="outline" onClick={() => create.mutate()} disabled={create.isPending}>
                + New Resume
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}