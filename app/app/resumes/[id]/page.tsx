'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  useResumeDocument,
  useSaveResumePersonalDetails,
  useSaveResumeCustomization,
  useRenameResume,
  useAddSection,
  useDeleteSection,
  useAddEntry,
  useDeleteEntry,
  useUpdateEntryData,
  useSaveSectionMeta,
} from '@/features/resume/hooks/resume.hooks'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { SECTION_LABELS, EMPTY_PERSONAL_DETAILS, DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { TSection, TEntry, PersonalDetails, Customization, SectionType, EntryData } from '@/features/resume/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Plus, Trash2, Download } from 'lucide-react'
import EditorHeader from '@/components/editor/editor-header'
import AddSectionModal from '@/components/editor/add-section-modal'
import { useResumeStyleStore } from '@/stores/use-resume-style-store'
import StyleSettings from '@/components/editor/customize/style-settings'

function EntryForm({ entry, sectionType, onChange, onDelete }: {
  entry: TEntry
  sectionType: SectionType
  onChange: (updates: Partial<EntryData>) => void
  onDelete: () => void
}) {
  const up = (patch: Partial<EntryData>) => onChange({ ...entry.data, ...patch } as EntryData)
  if (sectionType === 'work') {
    const e = entry.data as Extract<EntryData, { type: 'work' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Role</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Job Title" value={e.jobTitle} onChange={(v) => up({ jobTitle: v.target.value })} />
        <Input placeholder="Employer" value={e.employer} onChange={(v) => up({ employer: v.target.value })} />
        <Input placeholder="Location" value={e.location} onChange={(v) => up({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (MM/YYYY)" value={e.startDate?.month && e.startDate?.year ? `${e.startDate.month}/${e.startDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            up({ startDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } })
          }} />
          <Input placeholder="End (MM/YYYY)" value={e.endDate?.month && e.endDate?.year ? `${e.endDate.month}/${e.endDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            up({ endDate: { hide: false, year: y || '', month: m || '', ongoing: !y && !m, onlyYear: false, customOngoingWord: 'present' } })
          }} />
        </div>
        <Textarea placeholder="Description" value={e.description} onChange={(v) => up({ description: v.target.value })} className="min-h-[60px]" />
      </div>
    )
  }
  if (sectionType === 'education') {
    const e = entry.data as Extract<EntryData, { type: 'education' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Education</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Degree" value={e.degree} onChange={(v) => up({ degree: v.target.value })} />
        <Input placeholder="School" value={e.school} onChange={(v) => up({ school: v.target.value })} />
        <Input placeholder="Location" value={e.location} onChange={(v) => up({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (YYYY)" value={e.startDate?.year || ''} onChange={(v) => up({ startDate: { hide: false, year: v.target.value, month: '', ongoing: false, onlyYear: true, customOngoingWord: 'present' } })} />
          <Input placeholder="End (YYYY)" value={e.endDate?.year || ''} onChange={(v) => up({ endDate: { hide: false, year: v.target.value, month: '', ongoing: !v.target.value, onlyYear: true, customOngoingWord: 'present' } })} />
        </div>
      </div>
    )
  }
  if (sectionType === 'skill' || sectionType === 'language') {
    const e = entry.data as Extract<EntryData, { type: 'skill' | 'language' }>
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input
          placeholder={sectionType === 'skill' ? 'Skill' : 'Language'}
          value={sectionType === 'skill' ? (e as { skill: string }).skill : (e as { language: string }).language}
          onChange={(v) => up({ [sectionType === 'skill' ? 'skill' : 'language']: v.target.value } as Partial<EntryData>)}
          className="flex-1"
        />
        <Input placeholder="Level" value={(e as { level: string }).level} onChange={(v) => up({ level: v.target.value })} className="w-24" />
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
    )
  }
  if (sectionType === 'interest') {
    const e = entry.data as Extract<EntryData, { type: 'interest' }>
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input placeholder="Interest" value={e.interest} onChange={(v) => up({ interest: v.target.value })} className="flex-1" />
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
    )
  }
  if (sectionType === 'project') {
    const e = entry.data as Extract<EntryData, { type: 'project' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Project</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Title" value={e.projectTitle} onChange={(v) => up({ projectTitle: v.target.value })} />
        <Input placeholder="Subtitle" value={e.subTitle} onChange={(v) => up({ subTitle: v.target.value })} />
        <Textarea placeholder="Description" value={e.description} onChange={(v) => up({ description: v.target.value })} className="min-h-[60px]" />
      </div>
    )
  }
  if (sectionType === 'certificate') {
    const e = entry.data as Extract<EntryData, { type: 'certificate' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Certificate</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Title" value={e.title} onChange={(v) => up({ title: v.target.value })} />
        <Input placeholder="Issuer" value={e.issuer} onChange={(v) => up({ issuer: v.target.value })} />
        <Input placeholder="Date" value={e.date} onChange={(v) => up({ date: v.target.value })} />
      </div>
    )
  }
  if (sectionType === 'profile') {
    const e = entry.data as Extract<EntryData, { type: 'profile' }>
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Profile</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Textarea placeholder="Write a professional summary..." value={e.text} onChange={(v) => up({ text: v.target.value })} className="min-h-[80px]" />
      </div>
    )
  }
  const e = entry.data as Extract<EntryData, { type: 'custom' }>
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Entry</span>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
      <Input placeholder="Title" value={e.title} onChange={(v) => up({ title: v.target.value })} />
      <Input placeholder="Subtitle" value={e.subTitle} onChange={(v) => up({ subTitle: v.target.value })} />
      <Textarea placeholder="Description" value={e.description} onChange={(v) => up({ description: v.target.value })} className="min-h-[60px]" />
    </div>
  )
}

export default function ResumeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: doc, isLoading } = useResumeDocument(id)
  const { data: allResumes = [] } = useListResumes()
  const savePersonal = useSaveResumePersonalDetails()
  const saveCustom = useSaveResumeCustomization()
  const rename = useRenameResume()
  const addSection = useAddSection(id)
  const deleteSection = useDeleteSection(id)
  const addEntry = useAddEntry(id)
  const deleteEntry = useDeleteEntry(id)
  const updateData = useUpdateEntryData(id)
  const saveSectionMeta = useSaveSectionMeta(id)

  const [sections, setSections] = useState<TSection[]>([])
  const [personal, setPersonal] = useState<PersonalDetails>(EMPTY_PERSONAL_DETAILS)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOMIZATION)
  const hydrateStyle = useResumeStyleStore((s) => s.hydrate)
  const [tab, setTab] = useState('content')
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (doc) {
      setSections(doc.sections || [])
      setPersonal({ ...EMPTY_PERSONAL_DETAILS, ...doc.resume.personalDetails })
      const merged = { ...DEFAULT_CUSTOMIZATION, ...doc.resume.customization }
      setCustom(merged)
      hydrateStyle(merged)
    }
  }, [doc])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      savePersonal.mutate({ id, personalDetails: personal })
      saveCustom.mutate({ id, customization: custom })
    }, 1500)
    return () => clearTimeout(t)
  }, [personal, custom])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      for (const s of sections) {
        for (const e of s.entries) {
          if (e._dirty) updateData.mutate({ entryId: e.id, data: e.data })
        }
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [sections])

  function markDirty() { dirty.current = true }

  function mutateData(sectionId: string, entryId: string, patch: Partial<EntryData>) {
    setSections((prev) => prev.map((s) => {
      if (s.id !== sectionId) return s
      return { ...s, entries: s.entries.map((e) => {
        if (e.id !== entryId) return e
        return { ...e, _dirty: true, data: { ...e.data, ...patch } as EntryData }
      }) }
    }))
    markDirty()
  }

  function handleAddSection(type: SectionType) {
    addSection.mutate(type)
  }

  function handleDeleteSection(sectionId: string) {
    deleteSection.mutate(sectionId)
  }

  function handleAddEntry(sectionId: string) {
    addEntry.mutate(sectionId)
  }

  function handlePrint() { window.print() }

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading...</p>
  if (!doc) return <p className="p-8 text-muted-foreground">Resume not found</p>

  return (
    <>
      <div className="fixed inset-0 z-20">
        <EditorHeader
          activeTab={tab}
          setActiveTab={setTab}
          documents={allResumes.map(r => ({ id: r.id, title: r.title }))}
          selectedDocument={id}
          setSelectedDocument={(newId) => router.push(`/app/resumes/${newId}`)}
          onDownload={handlePrint}
        />
      </div>
      <div className="flex-1 overflow-hidden" style={{ marginTop: '4rem' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] bg-muted/20">
          <div className="lg:col-span-6 xl:col-span-5 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-2 border-b p-3">
              <Button variant="ghost" size="icon-sm" onClick={() => router.push('/app/resumes')}><ChevronLeft className="size-4" /></Button>
              <Input value={doc.resume.title} onChange={(e) => { rename.mutate({ id, title: e.target.value }) }} className="h-8 text-sm font-medium" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <Tabs value={tab} onValueChange={setTab} className="mx-3 mt-2 grid grid-cols-3">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="flex-1 overflow-auto p-3">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                      <Download className="mr-1 size-3" /> PDF
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[...Object.keys(SECTION_LABELS)].filter((st) => !sections.find((s) => s.sectionType === st as SectionType)).map((st) => (
                      <Button
                        key={st}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSection(st as SectionType)}
                      >
                        <Plus className="mr-1 size-3" />{SECTION_LABELS[st as keyof typeof SECTION_LABELS]}
                      </Button>
                    ))}
                  </div>
                  <ScrollArea className="h-[calc(100vh-240px)]">
                    {sections.map((section) => (
                      <div key={section.id} className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{section.displayName}</span>
                          <div className="flex gap-1">
                            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={!section.hidden}
                                onChange={(e) => saveSectionMeta.mutate({ sectionId: section.id, hidden: !e.target.checked })}
                              />
                              show
                            </label>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteSection(section.id)}><Trash2 className="size-3" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {section.entries.map((entry) => (
                            <EntryForm
                              key={entry.id}
                              entry={entry}
                              sectionType={section.sectionType}
                              onChange={(u) => mutateData(section.id, entry.id, u)}
                              onDelete={() => deleteEntry.mutate(entry.id)}
                            />
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => handleAddEntry(section.id)}>
                            <Plus className="mr-1 size-3" /> Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="details" className="flex-1 overflow-auto p-3 space-y-3">
                  {(['fullName', 'jobTitle', 'displayEmail', 'phone', 'address', 'website'] as (keyof PersonalDetails)[]).map((key) => (
                    <div key={key}>
                      <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <Input value={personal[key] as string || ''} onChange={(e) => { setPersonal((p) => ({ ...p, [key]: e.target.value })); markDirty() }} />
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs">LinkedIn</Label>
                    <Input value={personal?.social?.linkedIn?.display || ''} onChange={(e) => { setPersonal((p) => ({ ...p, social: { ...p.social, linkedIn: { ...p.social?.linkedIn, display: e.target.value, link: e.target.value } } })); markDirty() }} />
                  </div>
                  <div>
                    <Label className="text-xs">GitHub</Label>
                    <Input value={personal?.social?.github?.display || ''} onChange={(e) => { setPersonal((p) => ({ ...p, social: { ...p.social, github: { ...p.social?.github, display: e.target.value, link: e.target.value } } })); markDirty() }} />
                  </div>
                </TabsContent>
                <TabsContent value="style" className="flex-1 overflow-auto p-3">
                  <StyleSettings
                    sections={sections}
                    onChange={(next: Customization) => {
                      setCustom(next)
                      hydrateStyle(next)
                      markDirty()
                    }}
                    onReorderSections={(ids) => {
                      setSections((prev) => ids.map((sid) => prev.find((s) => s.id === sid)).filter(Boolean) as TSection[])
                    }}
                    onToggleSection={(sectionId, hidden) => {
                      saveSectionMeta.mutate({ sectionId, hidden })
                      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, hidden } : s)))
                    }}
                  />
                </TabsContent>
              </Tabs>
              <div className="py-6 flex justify-center">
                <Button
                  className="w-full max-w-sm bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:opacity-95 text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  onClick={() => setAddSectionModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 bg-muted/40 border-l border-border p-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <ResumeRenderer
              personalDetails={personal}
              sections={sections}
              customization={custom}
            />
          </div>
        </div>
      </div>
      <AddSectionModal
        open={addSectionModalOpen}
        onOpenChange={setAddSectionModalOpen}
        onAddSection={handleAddSection}
      />
    </>
  )
}