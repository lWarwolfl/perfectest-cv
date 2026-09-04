'use client'

import Link from 'next/link'
import { Download, Eye } from 'lucide-react'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { EditorLogo } from '@/components/editor/screen-gate'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface EditorHeaderProps {
  overviewHref: string
  activeTab: 'content' | 'design'
  onTabChange: (tab: 'content' | 'design') => void
  onDownload: () => void
  share?: React.ReactNode
}

export default function EditorHeader({
  overviewHref,
  activeTab,
  onTabChange,
  onDownload,
  share,
}: EditorHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-5">
      <div className="flex items-center gap-6">
        <Link href="/app/dashboard" className="flex items-center">
          <EditorLogo />
        </Link>
        <Button variant="ghost" render={<Link href={overviewHref} />}>
          <Eye className="size-4" />
          Overview
        </Button>
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as 'content' | 'design')}
        >
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {share}
        <Button onClick={onDownload}>
          <Download className="size-4" />
          Download PDF
        </Button>
      </div>
    </header>
  )
}

export function EditorShell({
  header,
  sidebar,
  preview,
  className,
}: {
  header: React.ReactNode
  sidebar: React.ReactNode
  preview: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {header}
      <div className="editor-body flex min-h-0 flex-1 max-lg:hidden">
        <div className="flex w-[30rem] shrink-0 flex-col border-r border-border print:hidden">
          {sidebar}
        </div>
        <div className="print-area flex-1 overflow-auto bg-muted/30 p-6 print:bg-white print:p-0">
          {preview}
        </div>
      </div>
    </div>
  )
}
