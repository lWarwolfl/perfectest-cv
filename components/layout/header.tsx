'use client'

import { ThemeToggle } from '@/components/common/theme-toggle'
import logo from '@public/logo.svg'
import { SignOutButton } from '@/features/auth/components/sign-out-button'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/app/dashboard', name: 'Dashboard' },
  { href: '/app/resumes', name: 'Resumes' },
  { href: '/app/letters', name: 'Cover Letters' },
  { href: '/app/tracker', name: 'Job Tracker' },
]

export default function Header({ email }: { email?: string | null }) {
  const pathname = usePathname()
  return (
    <header className="flex w-full items-center justify-between gap-4 md:gap-6">
      <div className="flex items-center gap-6">
        <Link href="/app/dashboard" className="text-foreground flex items-center">
          <Image alt="logo" src={logo} className="me-1 h-11 w-auto" />
          <span className="first-letter:text-primary text-xl font-semibold">Perfectest CV</span>
        </Link>

        <div className="flex items-center gap-3 max-md:hidden">
          {NAV.map((item) => (
            <Button
              key={item.name}
              variant={pathname.startsWith(item.href) ? 'default' : 'secondary'}
              className={cn({ 'pointer-events-none': pathname.startsWith(item.href) })}
              render={<Link href={item.href} />}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {email && <span className="text-xs text-muted-foreground max-lg:hidden">{email}</span>}
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  )
}