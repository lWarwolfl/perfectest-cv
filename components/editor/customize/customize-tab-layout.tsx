'use client'

import type { LucideIcon } from 'lucide-react'

export function CustomizeCard({
  title,
  icon: Icon,
  description,
  children,
}: {
  title: string
  icon: LucideIcon
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-border bg-card space-y-4 rounded-2xl border p-5 shadow-sm">
      <div>
        <div className="text-foreground flex items-center gap-2.5 text-lg font-bold">
          <Icon className="text-muted-foreground size-5" />
          {title}
        </div>
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function CustomizeTabLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-xl space-y-6 p-6">{children}</div>
}
