import { getCurrentUser } from '@/lib/auth/server'
import { listResumesAction } from '@/server/resume/resume.actions'
import { listLettersAction } from '@/server/letter/letter.actions'
import { getTrackerAction } from '@/server/tracker/tracker.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { ProfileCard } from '@/components/dashboard/profile-card'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const [resumes, letters, tracker] = await Promise.all([
    listResumesAction(),
    listLettersAction(),
    getTrackerAction(),
  ])

  const jobStatus = (tracker?.columns ?? []).map((col) => ({
    name: col.name,
    count: col.cardIds?.length ?? 0,
    color: col.color,
  }))

  const docBuckets = new Map<string, { label: string; resumes: number; letters: number }>()
  const bump = (createdAt: Date, kind: 'resumes' | 'letters') => {
    const key = format(createdAt, 'yyyy-MM-dd')
    const bucket = docBuckets.get(key) || {
      label: format(createdAt, 'd MMM'),
      resumes: 0,
      letters: 0,
    }
    bucket[kind]++
    docBuckets.set(key, bucket)
  }
  resumes.forEach((r) => bump(r.createdAt, 'resumes'))
  letters.forEach((l) => bump(l.createdAt, 'letters'))
  const docsByDay = [...docBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, v]) => ({ day: v.label, resumes: v.resumes, letters: v.letters }))

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <ProfileCard
            name={user?.name ?? ''}
            image={user?.image ?? null}
            email={user?.email ?? ''}
          />
        </CardContent>
      </Card>
      <h1 className="text-2xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{resumes.length} Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/resumes">
              <Button>Manage</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{letters.length} Cover Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/letters">
              <Button>Manage</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tracker?.cards?.length ?? 0} Tracked Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/app/tracker">
              <Button>Open Board</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <DashboardCharts docsByDay={docsByDay} jobStatus={jobStatus} />
    </div>
  )
}
