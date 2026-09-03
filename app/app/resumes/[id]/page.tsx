'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useResume, useSaveResumeContent, useSaveResumePersonalDetails, useSaveResumeCustomization, useApplyResumeTemplate, useRenameResume } from '@/features/resume/hooks/resume.hooks'
import { ResumeRenderer } from '@/features/resume/components/resume-renderer'
import { RESUME_TEMPLATES } from '@/features/resume/templates'
import { defaultEntry, SECTION_LABELS, EMPTY_PERSONAL_DETAILS, DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Content, Customization, PersonalDetails, SectionType, AnyEntry, WorkEntry, EducationEntry, SkillEntry, LanguageEntry, InterestEntry, ProjectEntry, CertificateEntry, ProfileEntry, CustomEntry } from '@/features/resume/types'
import { uid } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Plus, Trash2, Download } from 'lucide-react'

const SECTION_TYPES: SectionType[] = ['profile', 'work', 'education', 'skill', 'language', 'interest', 'project', 'certificate', 'custom']

function EntryForm({ entry, sectionType, onChange, onDelete }: {
  entry: AnyEntry
  sectionType: SectionType
  onChange: (updates: Partial<AnyEntry>) => void
  onDelete: () => void
}) {
  if (sectionType === 'work') {
    const e = entry as WorkEntry
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Role</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Job Title" value={e.jobTitle || ''} onChange={(v) => onChange({ jobTitle: v.target.value })} />
        <Input placeholder="Employer" value={e.employer || ''} onChange={(v) => onChange({ employer: v.target.value })} />
        <Input placeholder="Location" value={e.location || ''} onChange={(v) => onChange({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start (MM/YYYY)" value={e.startDate?.month && e.startDate?.year ? `${e.startDate.month}/${e.startDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            onChange({ startDate: { hide: false, year: y || '', month: m || '', ongoing: false, onlyYear: false, customOngoingWord: 'present' } } as Partial<AnyEntry>)
          }} />
          <Input placeholder="End (MM/YYYY)" value={e.endDate?.month && e.endDate?.year ? `${e.endDate.month}/${e.endDate.year}` : ''} onChange={(v) => {
            const [m, y] = v.target.value.split('/')
            onChange({ endDate: { hide: false, year: y || '', month: m || '', ongoing: !y && !m, onlyYear: false, customOngoingWord: 'present' } } as Partial<AnyEntry>)
          }} />
        </div>
        <Textarea placeholder="Description" value={e.description || ''} onChange={(v) => onChange({ description: v.target.value })} className="min-h-[60px]" />
      </div>
    )
  }
  if (sectionType === 'education') {
    const e = entry as EducationEntry
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Education</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Degree" value={e.degree || ''} onChange={(v) => onChange({ degree: v.target.value })} />
        <Input placeholder="School" value={e.school || ''} onChange={(v) => onChange({ school: v.target.value })} />
        <Input placeholder="Location" value={e.location || ''} onChange={(v) => onChange({ location: v.target.value })} />
        <div className="flex gap-2">
          <Input placeholder="Start" value={e.startDate?.year || ''} onChange={(v) => onChange({ startDate: { hide: false, year: v.target.value, month: '', ongoing: false, onlyYear: true, customOngoingWord: 'present' } } as Partial<AnyEntry>)} />
          <Input placeholder="End" value={e.endDate?.year || ''} onChange={(v) => onChange({ endDate: { hide: false, year: v.target.value, month: '', ongoing: !v.target.value, onlyYear: true, customOngoingWord: 'present' } } as Partial<AnyEntry>)} />
        </div>
      </div>
    )
  }
  if (sectionType === 'skill' || sectionType === 'language') {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input
          placeholder={sectionType === 'skill' ? 'Skill' : 'Language'}
          value={sectionType === 'skill' ? (entry as SkillEntry).skill : (entry as LanguageEntry).language}
          onChange={(v) => onChange({ [sectionType === 'skill' ? 'skill' : 'language']: v.target.value } as Partial<AnyEntry>)}
          className="flex-1"
        />
        <Input placeholder="Level" value={'level' in entry ? entry.level : ''} onChange={(v) => onChange({ level: v.target.value })} className="w-24" />
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
    )
  }
  if (sectionType === 'interest') {
    const e = entry as InterestEntry
    return (
      <div className="flex items-center gap-2 rounded-lg border p-2">
        <Input placeholder="Interest" value={e.interest || ''} onChange={(v) => onChange({ interest: v.target.value })} className="flex-1" />
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
    )
  }
  if (sectionType === 'project') {
    const e = entry as ProjectEntry
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Project</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Title" value={e.projectTitle || ''} onChange={(v) => onChange({ projectTitle: v.target.value })} />
        <Input placeholder="Subtitle" value={e.subTitle || ''} onChange={(v) => onChange({ subTitle: v.target.value })} />
        <Textarea placeholder="Description" value={e.description || ''} onChange={(v) => onChange({ description: v.target.value })} className="min-h-[60px]" />
      </div>
    )
  }
  if (sectionType === 'certificate') {
    const e = entry as CertificateEntry
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Certificate</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Input placeholder="Title" value={e.title || ''} onChange={(v) => onChange({ title: v.target.value })} />
        <Input placeholder="Issuer" value={e.issuer || ''} onChange={(v) => onChange({ issuer: v.target.value })} />
        <Input placeholder="Date" value={e.date || ''} onChange={(v) => onChange({ date: v.target.value })} />
      </div>
    )
  }
  if (sectionType === 'profile') {
    const e = entry as ProfileEntry
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Profile</span>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
        </div>
        <Textarea placeholder="Write a professional summary..." value={e.text || ''} onChange={(v) => onChange({ text: v.target.value })} className="min-h-[80px]" />
      </div>
    )
  }
  const e = entry as CustomEntry
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Entry</span>
        <Button variant="ghost" size="icon-sm" onClick={onDelete}><Trash2 className="size-3" /></Button>
      </div>
      <Input placeholder="Title" value={e.title || ''} onChange={(v) => onChange({ title: v.target.value })} />
      <Input placeholder="Subtitle" value={e.subTitle || ''} onChange={(v) => onChange({ subTitle: v.target.value })} />
      <Textarea placeholder="Description" value={e.description || ''} onChange={(v) => onChange({ description: v.target.value })} className="min-h-[60px]" />
    </div>
  )
}

export default function ResumeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: resume, isLoading } = useResume(id)
  const saveContent = useSaveResumeContent()
  const savePersonal = useSaveResumePersonalDetails()
  const saveCustom = useSaveResumeCustomization()
  const applyTemplate = useApplyResumeTemplate()
  const rename = useRenameResume()
  const [content, setContent] = useState<Content>({})
  const [personal, setPersonal] = useState<PersonalDetails>(EMPTY_PERSONAL_DETAILS)
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOMIZATION)
  const [title, setTitle] = useState('')
  const [tab, setTab] = useState('content')
  const [templateOpen, setTemplateOpen] = useState(false)
  const dirty = useRef(false)

  useEffect(() => {
    if (resume) {
      setContent(resume.content)
      setPersonal({ ...EMPTY_PERSONAL_DETAILS, ...resume.personalDetails })
      setCustom({ ...DEFAULT_CUSTOMIZATION, ...resume.customization })
      setTitle(resume.title)
    }
  }, [resume])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => {
      if (Object.keys(content).length) saveContent.mutate({ id, content })
      savePersonal.mutate({ id, personalDetails: personal })
      saveCustom.mutate({ id, customization: custom })
    }, 1500)
    return () => clearTimeout(t)
  }, [content, personal, custom])

  function markDirty() { dirty.current = true }

  function addSection(type: SectionType) {
    const sectionId = uid()
    setContent((c) => ({
      ...c,
      [sectionId]: {
        id: sectionId,
        sectionType: type,
        displayName: SECTION_LABELS[type] || type,
        iconKey: '',
        entries: [defaultEntry(type)],
      },
    }))
    markDirty()
  }

  function removeSection(sectionId: string) {
    setContent((c) => {
      const next = { ...c }
      delete next[sectionId]
      return next
    })
    markDirty()
  }

  function updateEntry(sectionId: string, entryId: string, updates: Partial<AnyEntry>) {
    setContent((c) => ({
      ...c,
      [sectionId]: {
        ...c[sectionId],
        entries: (c[sectionId]?.entries || []).map((e: AnyEntry) =>
          e.id === entryId ? { ...e, ...updates } : e
        ),
      },
    }))
    markDirty()
  }

  function addEntry(sectionId: string) {
    const section = content[sectionId]
    if (!section) return
    setContent((c) => ({
      ...c,
      [sectionId]: {
        ...section,
        entries: [...section.entries, defaultEntry(section.sectionType)],
      },
    }))
    markDirty()
  }

  function deleteEntry(sectionId: string, entryId: string) {
    setContent((c) => ({
      ...c,
      [sectionId]: {
        ...c[sectionId],
        entries: (c[sectionId]?.entries || []).filter((e: AnyEntry) => e.id !== entryId),
      },
    }))
    markDirty()
  }

  function updatePersonal(key: keyof PersonalDetails, value: string) {
    setPersonal((p) => ({ ...p, [key]: value }))
    markDirty()
  }

  function updateCustom(patch: Partial<Customization>) {
    setCustom((c) => ({ ...c, ...patch }))
    markDirty()
  }

  function handlePrint() {
    window.print()
  }

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading...</p>
  if (!resume) return <p className="p-8 text-muted-foreground">Resume not found</p>

  const sections = Object.values(content)

  return (
    <div className="fixed inset-0 top-0 left-56 flex print:static print:inset-auto print:left-auto">
      <div className="flex w-96 shrink-0 flex-col border-r bg-card print:hidden">
        <div className="flex items-center gap-2 border-b p-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push('/app/resumes')}><ChevronLeft className="size-4" /></Button>
          <Input value={title} onChange={(e) => { setTitle(e.target.value); rename.mutate({ id, title: e.target.value }) }} className="h-8 text-sm font-medium" />
        </div>
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="mx-3 mt-2 grid grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="flex-1 overflow-auto p-3">
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
                <DialogTrigger render={<Button variant="outline" size="sm">Templates</Button>} />
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Choose a template</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {RESUME_TEMPLATES.map((t) => (
                      <Card key={t.id} className="cursor-pointer hover:border-primary" onClick={() => {
                        applyTemplate.mutate({ id, templateId: t.id })
                        setCustom(t.customization)
                        setContent(t.content)
                        setTemplateOpen(false)
                      }}>
                        <CardHeader><CardTitle className="text-sm">{t.name}</CardTitle></CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">{t.description}</p></CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handlePrint}><Download className="mr-1 size-3" /> PDF</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SECTION_TYPES.filter((st) => !sections.find((s) => s.sectionType === st)).map((st) => (
                <Button key={st} variant="outline" size="sm" onClick={() => addSection(st)}>
                  <Plus className="mr-1 size-3" />{SECTION_LABELS[st]}
                </Button>
              ))}
            </div>
            <ScrollArea className="h-[calc(100vh-240px)]">
              {sections.map((section) => (
                <div key={section.id} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{section.displayName}</span>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeSection(section.id)}><Trash2 className="size-3" /></Button>
                  </div>
                  <div className="space-y-2">
                    {(section.entries || []).map((entry: AnyEntry) => (
                      <EntryForm
                        key={entry.id}
                        entry={entry}
                        sectionType={section.sectionType}
                        onChange={(u) => updateEntry(section.id, entry.id, u)}
                        onDelete={() => deleteEntry(section.id, entry.id)}
                      />
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addEntry(section.id)}>
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
                <Input value={personal[key] as string || ''} onChange={(e) => updatePersonal(key, e.target.value)} />
              </div>
            ))}
            <div>
              <Label className="text-xs">LinkedIn</Label>
              <Input value={personal?.social?.linkedIn?.display || ''} onChange={(e) => setPersonal((p) => ({ ...p, social: { ...p.social, linkedIn: { ...p.social?.linkedIn, display: e.target.value, link: e.target.value } } }))} />
            </div>
            <div>
              <Label className="text-xs">GitHub</Label>
              <Input value={personal?.social?.github?.display || ''} onChange={(e) => setPersonal((p) => ({ ...p, social: { ...p.social, github: { ...p.social?.github, display: e.target.value, link: e.target.value } } }))} />
            </div>
          </TabsContent>
          <TabsContent value="style" className="flex-1 overflow-auto p-3 space-y-3">
            <div>
              <Label className="text-xs">Font</Label>
              <Select value={custom.font.selected || 'sans'} onValueChange={(v: string | null) => {
                const map: Record<string, string> = { sans: 'Inter', serif: 'Source Sans Pro', mono: 'JetBrains Mono', modern: 'Nunito', elegant: 'Crimson Pro', display: 'Zilla Slab' }
                const val = ((v || 'sans') as keyof typeof map)
                updateCustom({ font: { selected: val, fontFamily: map[val] || 'Inter' } as Customization['font'] })
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans (Inter)</SelectItem>
                  <SelectItem value="serif">Serif (Source Sans Pro)</SelectItem>
                  <SelectItem value="modern">Modern (Nunito)</SelectItem>
                  <SelectItem value="elegant">Elegant (Crimson Pro)</SelectItem>
                  <SelectItem value="display">Display (Zilla Slab)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Accent Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#044cb5', '#0891b2', '#ea580c', '#4a7c59', '#b91c1c', '#475569', '#1e293b', '#7c3aed'].map((c) => (
                  <button key={c} className="size-7 rounded-full border-2" style={{ backgroundColor: c, borderColor: custom.colors.basic.single === c ? 'var(--primary)' : 'transparent' }} onClick={() => {
                    setCustom((prev) => ({
                      ...prev,
                      colors: { ...prev.colors, mode: 'basic', basic: { ...prev.colors.basic, single: c, selected: 'single' } },
                    }))
                    markDirty()
                  }} />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Layout</Label>
              <Select value={custom.layout.selected || 'one'} onValueChange={(v: string | null) => updateCustom({ layout: { ...custom.layout, selected: (v || 'one') as Customization['layout']['selected'] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Single Column</SelectItem>
                  <SelectItem value="two">Two Column</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Heading Style</Label>
              <Select value={custom.heading.style || 'line'} onValueChange={(v: string | null) => updateCustom({ heading: { ...custom.heading, style: (v || 'line') as Customization['heading']['style'] } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                  <SelectItem value="thickShortUnderline">Thick Short</SelectItem>
                  <SelectItem value="topBottomLine">Top & Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Spacing</Label>
              <Select value={custom.spacing.fontSize || '3'} onValueChange={(v: string | null) => updateCustom({ spacing: { ...custom.spacing, fontSize: v || '3' } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n === 3 ? 'Medium' : n < 3 ? 'Compact' : 'Large'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto bg-muted/30 p-4 print:overflow-visible print:bg-white print:p-0" id="resume-preview">
        <ResumeRenderer
          personalDetails={personal}
          content={content}
          customization={custom}
        />
      </div>
    </div>
  )
}