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
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <Icon className="size-5 text-muted-foreground" />
          {title}
        </div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function CustomizeTabLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-xl space-y-6 overflow-y-auto p-6">{children}</div>
}
