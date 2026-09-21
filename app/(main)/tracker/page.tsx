'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getTrackerAction,
  saveCardAction,
  moveCardAction,
  deleteCardAction,
  deleteColumnAction,
  saveColumnsAction,
} from '@/server/tracker/tracker.actions'
import { cn, getErrorMessage, uid } from '@/lib/utils'
import { QUERY_KEYS } from '@/features/queries/keys'
import { useListResumes } from '@/features/resume/hooks/resume.hooks'
import { useListLetters } from '@/features/letter/hooks/letter.hooks'
import type { TTrackerCard } from '@/drizzle/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { LabeledInput, LabeledTextarea } from '@/components/ui/labeled'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Plus, Search, Trash2, ExternalLink, X } from 'lucide-react'
import { ColorPicker } from '@/components/ui/color-picker'
import { CreateCard } from '@/components/common/create-card'

type TrackerData = Awaited<ReturnType<typeof getTrackerAction>>

function CardEditor({
  card,
  colId,
  trackerId,
  open,
  onOpenChange,
  resumes,
  letters,
}: {
  card: Partial<TTrackerCard> | null
  colId: string
  trackerId: string
  open: boolean
  onOpenChange: (v: boolean) => void
  resumes: { id: string; title: string }[]
  letters: { id: string; title: string }[]
}) {
  const qc = useQueryClient()
  const save = useMutation({
    mutationFn: (data: Partial<TTrackerCard>) => saveCardAction(data, colId, trackerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] })
      toast.success('Saved')
      onOpenChange(false)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const [form, setForm] = useState<Partial<TTrackerCard>>({
    company: '',
    jobTitle: '',
    location: '',
    salary: '',
    link: '',
    tags: [],
    jobDescription: '',
    notes: '',
    todos: [],
    resumeVersionId: null,
    coverLetterVersionId: null,
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
        <div className="-mr-4 max-h-[60vh] space-y-3 overflow-y-auto pr-4">
          <LabeledInput
            label="Company"
            placeholder="Company"
            value={(form.company as string) || ''}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <LabeledInput
            label="Job title"
            placeholder="Job Title"
            value={(form.jobTitle as string) || ''}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          <div className="flex gap-2">
            <LabeledInput
              label="Location"
              placeholder="Location"
              value={(form.location as string) || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="flex-1"
            />
            <LabeledInput
              label="Salary"
              placeholder="Salary"
              value={(form.salary as string) || ''}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              className="w-28"
            />
          </div>
          <LabeledInput
            label="Job URL"
            type="url"
            placeholder="Job URL"
            value={(form.link as string) || ''}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <LabeledInput
            label="Tags"
            placeholder="Tags (comma-separated)"
            value={((form.tags as string[]) || []).join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
          />
          <LabeledTextarea
            label="Job description"
            placeholder="Job Description"
            value={(form.jobDescription as string) || ''}
            onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            className="min-h-[80px]"
          />
          <LabeledTextarea
            label="Notes"
            placeholder="Notes"
            value={(form.notes as string) || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="min-h-[60px]"
          />
          <div className="bg-border h-px" />
          <p className="text-muted-foreground text-xs font-medium">What I sent</p>
          <div>
            <p className="mb-1 text-xs" id="card-resume-version">
              Resume version
            </p>
            <Select
              value={(form.resumeVersionId as string) || ''}
              onValueChange={(v) => setForm({ ...form, resumeVersionId: v || null })}
            >
              <SelectTrigger aria-labelledby="card-resume-version">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1 text-xs" id="card-letter-version">
              Cover letter version
            </p>
            <Select
              value={(form.coverLetterVersionId as string) || ''}
              onValueChange={(v) => setForm({ ...form, coverLetterVersionId: v || null })}
            >
              <SelectTrigger aria-labelledby="card-letter-version">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {letters.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-border h-px" />
          <p className="text-muted-foreground text-xs font-medium">To-Dos</p>
          {((form.todos as { id: string; todo: string; done: boolean }[]) || []).map((todo, i) => (
            <div key={todo.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => {
                  const todos = [...(form.todos as { id: string; todo: string; done: boolean }[])]
                  todos[i] = { ...todo, done: !todo.done }
                  setForm({ ...form, todos })
                }}
                aria-label={`Todo ${i + 1} done`}
              />
              <LabeledInput
                label={`Todo ${i + 1}`}
                hideLabel
                value={todo.todo}
                onChange={(e) => {
                  const todos = [...(form.todos as { id: string; todo: string; done: boolean }[])]
                  todos[i] = { ...todo, todo: e.target.value }
                  setForm({ ...form, todos })
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete todo ${i + 1}`}
                onClick={() =>
                  setForm({ ...form, todos: (form.todos || []).filter((_, j) => j !== i) })
                }
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setForm({
                ...form,
                todos: [...(form.todos || []), { id: uid(), todo: '', done: false }],
              })
            }
          >
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

  const moveCard = useMutation({
    mutationFn: ({
      trackerId,
      cardId,
      toColId,
      toIndex,
    }: {
      trackerId: string
      cardId: string
      toColId: string
      toIndex: number
    }) => moveCardAction(trackerId, cardId, toColId, toIndex),
    onMutate: async ({ cardId, toColId, toIndex }) => {
      await qc.cancelQueries({ queryKey: [QUERY_KEYS.TRACKERS] })
      const prev = qc.getQueryData<TrackerData>([QUERY_KEYS.TRACKERS])
      qc.setQueryData<TrackerData>([QUERY_KEYS.TRACKERS], (old) =>
        old
          ? {
              ...old,
              columns: old.columns.map((c) => {
                if (c.id === toColId) {
                  const ids = c.cardIds.filter((id) => id !== cardId)
                  ids.splice(toIndex, 0, cardId)
                  return { ...c, cardIds: ids }
                }
                return c.cardIds.includes(cardId)
                  ? { ...c, cardIds: c.cardIds.filter((id) => id !== cardId) }
                  : c
              }),
            }
          : old
      )
      return { prev }
    },
    onError: (e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData([QUERY_KEYS.TRACKERS], ctx.prev)
      toast.error(getErrorMessage(e))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }),
  })

  const deleteCard = useMutation({
    mutationFn: ({ cardId, trackerId }: { cardId: string; trackerId: string }) =>
      deleteCardAction(cardId, trackerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] })
      toast.success('Deleted')
    },
  })

  const deleteCol = useMutation({
    mutationFn: ({ columnId, trackerId }: { columnId: string; trackerId: string }) =>
      deleteColumnAction(columnId, trackerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] })
      toast.success('Column deleted')
    },
  })

  const addColMutation = useMutation({
    mutationFn: (name: string) => {
      const cols = [
        ...(tracker?.columns || []),
        { id: uid(), name: name || 'New Column', cardIds: [] as string[] },
      ]
      return saveColumnsAction(tracker!.id, cols)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] }),
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const allTags = [...new Set(allCards.flatMap((c) => (c.tags as string[]) || []))].sort()
  const hasFilter = !!search.trim() || statusFilter !== 'all' || tagFilter !== 'all'
  const matchesSearch = (card: TTrackerCard) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return [card.company, card.jobTitle, card.location]
      .filter(Boolean)
      .some((v) => (v as string).toLowerCase().includes(q))
  }
  const matchesTag = (card: TTrackerCard) =>
    tagFilter === 'all' || ((card.tags as string[]) || []).includes(tagFilter)
  const columnOf = (cardId: string) => columns.find((c) => c.cardIds?.includes(cardId))
  const visibleCards = allCards.filter(
    (card) =>
      matchesSearch(card) &&
      matchesTag(card) &&
      (statusFilter === 'all' || columnOf(card.id)?.id === statusFilter)
  )
  const shownColumns =
    statusFilter === 'all' ? columns : columns.filter((c) => c.id === statusFilter)
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTagFilter('all')
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Job Tracker</h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('board')}
          >
            Board
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            Table
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCard({})
                    setEditingCol(columns[0]?.id)
                    setCardOpen(true)
                  }}
                >
                  <Plus className="mr-1 size-3" /> Add Job
                </Button>
              }
            />
          </Dialog>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, title, location..."
            aria-label="Search jobs"
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger aria-label="Status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {columns.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={(v) => setTagFilter(v ?? 'all')}>
          <SelectTrigger aria-label="Tag" className="w-36">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-3" /> Clear
          </Button>
        )}
        {hasFilter && (
          <span className="text-muted-foreground text-xs">
            {visibleCards.length} of {allCards.length} jobs
          </span>
        )}
      </div>

      {view === 'board' ? (
        <div className="-mx-3 flex min-h-0 flex-1 gap-4 overflow-x-auto px-3 pb-2">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="w-72 shrink-0 rounded-lg" />
              ))
            : shownColumns.map((col) => (
                <div
                  key={col.id}
                  className={cn(
                    'bg-muted ring-1 ring-transparent transition-colors ring-inset',
                    'flex w-72 shrink-0 flex-col rounded-lg',
                    dragOver === col.id && 'bg-accent ring-primary/40'
                  )}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(col.id)
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null)
                  }}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div
                    className="flex items-center justify-between px-3 py-2"
                    style={col.color ? { borderBottom: `3px solid ${col.color}` } : undefined}
                  >
                    <span className="text-sm font-medium">
                      {col.name}{' '}
                      <span className="text-muted-foreground">
                        ({(col.cardIds || []).filter((id) => visibleCards.some((c) => c.id === id)).length}
                        {hasFilter ? `/${col.cardIds?.length || 0}` : ''})
                      </span>
                    </span>
                    <div className="flex gap-1">
                      <ColorPicker
                        value={col.color || '#6366f1'}
                        onChange={(hex) => {
                          const cols = columns.map((c) =>
                            c.id === col.id ? { ...c, color: hex } : c
                          )
                          saveColumnsAction(tracker!.id, cols).then(() =>
                            qc.invalidateQueries({ queryKey: [QUERY_KEYS.TRACKERS] })
                          )
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingCard({})
                          setEditingCol(col.id)
                          setCardOpen(true)
                        }}
                      >
                        <Plus className="size-3" />
                      </Button>
                      {columns.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            deleteCol.mutate({ columnId: col.id, trackerId: tracker!.id })
                          }
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="flex-1 px-2 py-2">
                    <div className="space-y-2">
                      {(col.cardIds || []).map((cardId: string) => {
                        const card = visibleCards.find((c) => c.id === cardId)
                        if (!card) return null
                        const resume = resumes?.find((r) => r.id === card.resumeVersionId)
                        const letter = letters?.find((l) => l.id === card.coverLetterVersionId)
                        return (
                          <Card
                            key={card.id}
                            className="bg-card border-border hover:border-primary/60 cursor-pointer gap-0 border py-0 shadow-xs ring-0 transition duration-150 hover:shadow-md"
                            draggable
                            onDragStart={(e) => handleDragStart(e, card.id, col.id)}
                            onClick={() => openCardEditor(card, col.id)}
                          >
                            <CardHeader className="px-3 pt-3 pb-1">
                              <CardTitle className="text-sm">
                                {card.jobTitle || 'Untitled'}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {card.company || 'No company'}
                              </CardDescription>
                              {(card.location || card.salary) && (
                                <CardDescription className="text-xs">
                                  {[card.location, card.salary].filter(Boolean).join(' • ')}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-1 px-3 pt-1 pb-3">
                              {((card.tags as string[]) || []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {(card.tags as string[]).slice(0, 3).map((t, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px]">
                                      {t}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {(resume || letter) && (
                                <div className="text-muted-foreground text-[10px]">
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
          <CreateCard
            label="Column name"
            buttonLabel="Add Column"
            className="w-72 shrink-0 justify-center"
            pending={addColMutation.isPending}
            onCreate={(name) => addColMutation.mutate(name)}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
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
              {visibleCards.map((card) => {
                const col = columns.find((c) => c.cardIds?.includes(card.id))
                const resume = resumes?.find((r) => r.id === card.resumeVersionId)
                const letter = letters?.find((l) => l.id === card.coverLetterVersionId)
                return (
                  <tr key={card.id} className="hover:bg-muted/30 border-b">
                    <td className="p-2 font-medium">{card.company}</td>
                    <td className="p-2">{card.jobTitle}</td>
                    <td className="p-2">
                      <Badge variant="outline">{col?.name || '-'}</Badge>
                    </td>
                    <td className="text-muted-foreground p-2">{card.location}</td>
                    <td className="text-muted-foreground p-2">
                      {card.dateApplied ? new Date(card.dateApplied).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2 text-xs">{resume ? resume.title : '-'}</td>
                    <td className="p-2 text-xs">{letter ? letter.title : '-'}</td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openCardEditor(card, col?.id || '')}
                        >
                          <ExternalLink className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            deleteCard.mutate({ cardId: card.id, trackerId: tracker!.id })
                          }
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visibleCards.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted-foreground p-6 text-center text-sm">
                    {hasFilter ? 'No jobs match the current filters.' : 'No jobs yet — add your first one.'}
                  </td>
                </tr>
              )}
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
