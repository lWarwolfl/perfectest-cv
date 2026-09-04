'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Mail,
  KanbanSquare,
} from 'lucide-react'
import logo from '@public/logo.svg'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { LogoutButton } from '@/features/auth/components/sign-out-button'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV = [
  { href: '/app/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/resumes', name: 'Resumes', icon: FileText },
  { href: '/app/letters', name: 'Cover Letters', icon: Mail },
  { href: '/app/tracker', name: 'Job Tracker', icon: KanbanSquare },
]

export default function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname()
  return (
    <aside className="m-4 flex w-60 shrink-0 flex-col rounded-2xl border border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground">
      <Link href="/app/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <Image alt="Perfectest CV logo" src={logo} className="size-9" />
        <span className="text-lg font-semibold">Perfectest CV</span>
      </Link>
      <nav className="flex flex-col gap-1 text-sm">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="size-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate px-1 text-xs text-muted-foreground">{email}</div>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  )
}

export function SidebarPage({ children, email }: { children: React.ReactNode; email?: string | null }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <main className="flex-1 overflow-x-hidden p-4 pr-6">{children}</main>
    </div>
  )
}

export function SidebarNavButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button render={<Link href={href} />}>
      {children}
    </Button>
  )
}
