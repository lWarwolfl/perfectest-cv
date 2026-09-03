'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { LayoutGrid, FileText, Sliders, Wand2, MoreVertical, Download } from 'lucide-react'

interface EditorHeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  documents: { id: string; title: string }[]
  selectedDocument: string
  setSelectedDocument: (id: string) => void
  onDownload: () => void
}

const ACTIVE_TRIGGER = 'bg-rose-50 text-rose-600 font-semibold shadow-none rounded-lg px-3.5 py-1.5 text-sm flex items-center gap-2 dark:bg-rose-950/40 dark:text-rose-400'
const INACTIVE_TRIGGER = 'text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors flex items-center gap-2'

export default function EditorHeader({
  activeTab,
  setActiveTab,
  documents,
  selectedDocument,
  setSelectedDocument,
  onDownload,
}: EditorHeaderProps) {
  return (
    <div className="z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(String(v))}>
          <TabsList>
            <TabsTrigger value="overview" className={({ active }) => (active ? ACTIVE_TRIGGER : INACTIVE_TRIGGER)}>
              <LayoutGrid className="mr-2 size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className={({ active }) => (active ? ACTIVE_TRIGGER : INACTIVE_TRIGGER)}>
              <FileText className="mr-2 size-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="customize" className={({ active }) => (active ? ACTIVE_TRIGGER : INACTIVE_TRIGGER)}>
              <Sliders className="mr-2 size-4" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className={({ active }) => (active ? ACTIVE_TRIGGER : INACTIVE_TRIGGER)}>
              <Wand2 className="mr-2 size-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-36">
          <Select
            value={selectedDocument}
            onValueChange={(v) => {
              if (v) setSelectedDocument(v)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a resume" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onDownload}>
          <Download className="mr-2 size-4" />
          Download
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
