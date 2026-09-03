import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/server'
import { SignOutButton } from '@/features/auth/components/sign-out-button'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card px-3 py-4">
        <Link href="/app/dashboard" className="mb-6 px-2 text-lg font-semibold">
          Perfectest CV
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/app/dashboard" className="rounded-md px-2 py-1.5 hover:bg-accent">
            Dashboard
          </Link>
          <Link href="/app/resumes" className="rounded-md px-2 py-1.5 hover:bg-accent">
            Resumes
          </Link>
          <Link href="/app/letters" className="rounded-md px-2 py-1.5 hover:bg-accent">
            Cover Letters
          </Link>
          <Link href="/app/tracker" className="rounded-md px-2 py-1.5 hover:bg-accent">
            Job Tracker
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-sm">
          <div className="truncate px-2 text-xs text-muted-foreground">{user?.email}</div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-6">{children}</main>
    </div>
  )
}