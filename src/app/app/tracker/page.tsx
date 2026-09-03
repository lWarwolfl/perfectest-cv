'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getTrackerAction, saveCardAction, moveCardAction, deleteCardAction, deleteColumnAction, saveColumnsAction } from '@/server/tracker/tracker.actions'
import { getErrorMessage, uid } from '@/lib/utils'
import { QUERY_KEYS } from '@/features/queries/keys'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { useListLetters } from '@/features/letter/hooks/letter.hooks'
import type { TTrackerCard, TResume, TLetter } from '@/drizzle/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, ExternalLink } from 'lucide-react'

function CardEditor({ card, colId, trackerId, open, onOpenChange, resumes, letters }: {
  card: Partial<TTrackerCard> | null
  colId: string
  trackerId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  resumes: TResume[]
  letters: TLetter[]
}) {
  const qc = useQueryClient()
  const save = useMutation({
    mutationFn: (data: Partial<TTrackerCard>) => saveCardAction(data, colId, trackerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }); toast.success('Saved'); onOpenChange(false) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const [form, setForm] = useState<Partial<TTrackerCard>>({
    company: '', jobTitle: '', location: '', salary: '', link: '', tags: [],
    jobDescription: '', notes: '', todos: [], resumeVersionId: null, coverLetterVersionId: null,
  })

  useEffect(() => {
    if (card) setForm({ ...card })
  }, [card])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{card?.id ? 'Edit Job' : 'Add Job'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-auto">
          <Input placeholder="Company" value={(form.company as string) || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Input placeholder="Job Title" value={(form.jobTitle as string) || ''} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          <div className="flex gap-2">
            <Input placeholder="Location" value={(form.location as string) || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="flex-1" />
            <Input placeholder="Salary" value={(form.salary as string) || ''} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="w-28" />
          </div>
          <Input placeholder="Job URL" value={(form.link as string) || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <Input placeholder="Tags (comma-separated)" value={((form.tags as string[]) || []).join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
          <Textarea placeholder="Job Description" value={(form.jobDescription as string) || ''} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} className="min-h-[80px]" />
          <Textarea placeholder="Notes" value={(form.notes as string) || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[60px]" />
          <div className="h-px bg-border" />
          <p className="text-xs font-medium text-muted-foreground">What I sent</p>
          <div>
            <p className="text-xs mb-1">Resume version</p>
            <Select value={(form.resumeVersionId as string) || ''} onValueChange={(v) => setForm({ ...form, resumeVersionId: v || null })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs mb-1">Cover letter version</p>
            <Select value={(form.coverLetterVersionId as string) || ''} onValueChange={(v) => setForm({ ...form, coverLetterVersionId: v || null })}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {letters.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="h-px bg-border" />
          <p className="text-xs font-medium text-muted-foreground">To-Dos</p>
          {((form.todos as { id: string; todo: string; done: boolean }[]) || []).map((todo, i) => (
            <div key={todo.id} className="flex items-center gap-2">
              <input type="checkbox" checked={todo.done} onChange={() => {
                const todos = [...(form.todos as { id: string; todo: string; done: boolean }[])]
                todos[i] = { ...todo, done: !todo.done }
                setForm({ ...form, todos })
              }} />
              <Input value={todo.todo} onChange={(e) => {
                const todos = [...(form.todos as { id: string; todo: string; done: boolean }[])]
                todos[i] = { ...todo, todo: e.target.value }
                setForm({ ...form, todos })
              }} className="flex-1" />
              <Button variant="ghost" size="icon-sm" onClick={() => setForm({ ...form, todos: (form.todos || []).filter((_, j) => j !== i) })}><Trash2 className="size-3" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setForm({ ...form, todos: [...(form.todos || []), { id: uid(), todo: '', done: false }] })}>
            <Plus className="mr-1 size-3" /> Add to-do
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => save.mutate({ ...form, id: card?.id })} disabled={save.isPending}>
            {save.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TrackerPage() {
  const qc = useQueryClient()
  const { data: tracker, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.TRACKERS],
    queryFn: getTrackerAction,
  })
  const { data: resumes } = useListResumes()
  const { data: letters } = useListLetters()
  const [editingCard, setEditingCard] = useState<Partial<TTrackerCard> | null>(null)
  const [editingCol, setEditingCol] = useState('')
  const [cardOpen, setCardOpen] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [view, setView] = useState<'board' | 'table'>('board')
  const [newColName, setNewColName] = useState('')

  const moveCard = useMutation({
    mutationFn: ({ trackerId, cardId, toColId, toIndex }: { trackerId: string; cardId: string; toColId: string; toIndex: number }) =>
      moveCardAction(trackerId, cardId, toColId, toIndex),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }),
  })

  const deleteCard = useMutation({
    mutationFn: ({ cardId, trackerId }: { cardId: string; trackerId: string }) => deleteCardAction(cardId, trackerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }); toast.success('Deleted') },
  })

  const deleteCol = useMutation({
    mutationFn: ({ columnId, trackerId }: { columnId: string; trackerId: string }) => deleteColumnAction(columnId, trackerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }); toast.success('Column deleted') },
  })

  const addColMutation = useMutation({
    mutationFn: () => {
      const cols = [...(tracker?.columns || []), { id: uid(), name: newColName || 'New Column', cardIds: [] as string[] }]
      return saveColumnsAction(tracker!.id, cols)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }); setNewColName('') },
  })

  function handleDragStart(e: React.DragEvent, cardId: string, _colId: string) {
    e.dataTransfer.setData('cardId', cardId)
    e.dataTransfer.setData('fromColId', _colId)
  }

  function handleDrop(e: React.DragEvent, toColId: string) {
    e.preventDefault()
    setDragOver(null)
    const cardId = e.dataTransfer.getData('cardId')
    const fromColId = e.dataTransfer.getData('fromColId')
    if (fromColId !== toColId && tracker) {
      moveCard.mutate({ trackerId: tracker.id, cardId, toColId, toIndex: 0 })
    }
  }

  function openCardEditor(card: Partial<TTrackerCard>, colId: string) {
    setEditingCard(card)
    setEditingCol(colId)
    setCardOpen(true)
  }

  const allCards = tracker?.cards || []
  const columns = tracker?.columns || []

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job Tracker</h1>
        <div className="flex gap-2">
          <Button variant={view === 'board' ? 'default' : 'outline'} size="sm" onClick={() => setView('board')}>Board</Button>
          <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>Table</Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button size="sm" onClick={() => { setEditingCard({}); setEditingCol(columns[0]?.id); setCardOpen(true) }}>
                  <Plus className="mr-1 size-3" /> Add Job
                </Button>
              }
            />
          </Dialog>
        </div>
      </div>

      {view === 'board' ? (
        <div className="flex gap-4 overflow-auto pb-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50"
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ background: dragOver === col.id ? 'oklch(0.9 0.01 100)' : undefined }}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium">{col.name} <span className="text-muted-foreground">({col.cardIds?.length || 0})</span></span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => {
                    setEditingCard({}); setEditingCol(col.id); setCardOpen(true)
                  }}><Plus className="size-3" /></Button>
                  {columns.length > 1 && <Button variant="ghost" size="icon-sm" onClick={() => deleteCol.mutate({ columnId: col.id, trackerId: tracker!.id })}><Trash2 className="size-3" /></Button>}
                </div>
              </div>
              <ScrollArea className="flex-1 px-2 pb-2">
                <div className="space-y-2">
                  {(col.cardIds || []).map((cardId: string) => {
                    const card = allCards.find((c) => c.id === cardId)
                    if (!card) return null
                    const resume = resumes?.find((r) => r.id === card.resumeVersionId)
                    const letter = letters?.find((l) => l.id === card.coverLetterVersionId)
                    return (
                      <Card
                        key={card.id}
                        className="cursor-pointer hover:border-primary"
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                        onClick={() => openCardEditor(card, col.id)}
                      >
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm">{card.jobTitle || 'Untitled'}</CardTitle>
                          <CardDescription className="text-xs">{card.company || 'No company'}</CardDescription>
                          {card.location && <CardDescription className="text-xs">{card.location}</CardDescription>}
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          {((card.tags as string[]) || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(card.tags as string[]).slice(0, 3).map((t, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>
                              ))}
                            </div>
                          )}
                          {(resume || letter) && (
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {resume && <span>📄 {resume.title}</span>}
                              {letter && <span> ✉️ {letter.title}</span>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          ))}
          <div className="flex w-72 shrink-0 flex-col gap-2 rounded-lg border-2 border-dashed p-3">
            <Input placeholder="Column name" value={newColName} onChange={(e) => setNewColName(e.target.value)} className="h-8 text-sm" />
            <Button variant="outline" size="sm" onClick={() => addColMutation.mutate()} disabled={addColMutation.isPending}>
              <Plus className="mr-1 size-3" /> Add Column
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Company</th>
                <th className="p-2 text-left font-medium">Job Title</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Location</th>
                <th className="p-2 text-left font-medium">Date Applied</th>
                <th className="p-2 text-left font-medium">Resume</th>
                <th className="p-2 text-left font-medium">Letter</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {allCards.map((card) => {
                const col = columns.find((c) => c.cardIds?.includes(card.id))
                const resume = resumes?.find((r) => r.id === card.resumeVersionId)
                const letter = letters?.find((l) => l.id === card.coverLetterVersionId)
                return (
                  <tr key={card.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{card.company}</td>
                    <td className="p-2">{card.jobTitle}</td>
                    <td className="p-2"><Badge variant="outline">{col?.name || '-'}</Badge></td>
                    <td className="p-2 text-muted-foreground">{card.location}</td>
                    <td className="p-2 text-muted-foreground">{card.dateApplied ? new Date(card.dateApplied).toLocaleDateString() : '-'}</td>
                    <td className="p-2 text-xs">{resume ? resume.title : '-'}</td>
                    <td className="p-2 text-xs">{letter ? letter.title : '-'}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openCardEditor(card, col?.id || '')}><ExternalLink className="size-3" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => deleteCard.mutate({ cardId: card.id, trackerId: tracker!.id })}><Trash2 className="size-3" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CardEditor
        card={editingCard}
        colId={editingCol}
        trackerId={tracker?.id || ''}
        open={cardOpen}
        onOpenChange={setCardOpen}
        resumes={resumes || []}
        letters={letters || []}
      />
    </div>
  )
}