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

function useActive() {
  const pathname = usePathname()
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({ email }: { email?: string | null }) {
  const isActive = useActive()
  return (
    <aside className="m-4 hidden w-60 shrink-0 flex-col rounded-2xl border border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground md:flex">
      <Link href="/app/dashboard" className="mb-6 flex items-center gap-2 px-2">
        <Image alt="Perfectest CV logo" src={logo} className="size-9" />
        <span className="text-lg font-semibold">Perfectest CV</span>
      </Link>
      <nav className="flex flex-col gap-1 text-sm">
        {NAV.map((item) => {
          const active = isActive(item.href)
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

export function MobileNav() {
  const isActive = useActive()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur md:hidden">
      {NAV.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="size-5" />
            {item.name.split(' ')[0]}
          </Link>
        )
      })}
    </nav>
  )
}

export function SidebarPage({ children, email }: { children: React.ReactNode; email?: string | null }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <main className="min-w-0 flex-1 overflow-x-hidden p-3 pb-20 pr-4 md:p-4 md:pr-6 md:pb-4">{children}</main>
      <MobileNav />
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
