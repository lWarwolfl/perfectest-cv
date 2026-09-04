'use server'

import { db } from '@/drizzle'
import { Tracker, TrackerCard } from '@/drizzle/schema'
import { getCurrentUser } from '@/lib/auth/server'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { uid } from '@/lib/utils'

type TrackerColumn = { id: string; name: string; cardIds: string[]; color?: string }
type TrackerCardRow = typeof TrackerCard.$inferSelect

export async function getTrackerAction() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  let tracker = await db.query.Tracker.findFirst({ where: eq(Tracker.userId, user.id) })
  if (!tracker) {
    const defaultColumns: TrackerColumn[] = [
      { id: uid(), name: 'Wishlist', cardIds: [] },
      { id: uid(), name: 'Applied', cardIds: [] },
      { id: uid(), name: 'Interview', cardIds: [] },
      { id: uid(), name: 'Offer', cardIds: [] },
      { id: uid(), name: 'Rejected', cardIds: [] },
    ]
    ;[tracker] = await db
      .insert(Tracker)
      .values({ userId: user.id, columns: defaultColumns })
      .returning()
  }
  const cards = await db.query.TrackerCard.findMany({
    where: eq(TrackerCard.trackerId, tracker.id),
    orderBy: (t, { desc }) => desc(t.createdAt),
  })
  return { ...tracker, cards }
}

export async function saveCardAction(card: Partial<TrackerCardRow>, colId: string, trackerId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const { id: cardId, ...rest } = card
  const fields: Partial<TrackerCardRow> = {
    company: rest.company ?? '',
    jobTitle: rest.jobTitle ?? '',
    location: rest.location ?? '',
    salary: rest.salary ?? '',
    link: rest.link ?? '',
    tags: rest.tags ?? [],
    dateApplied: rest.dateApplied ?? '',
    jobDescription: rest.jobDescription ?? '',
    notes: rest.notes ?? '',
    todos: rest.todos ?? [],
    files: rest.files ?? [],
    statusUpdates: rest.statusUpdates ?? [],
    resumeVersionId: rest.resumeVersionId ?? null,
    coverLetterVersionId: rest.coverLetterVersionId ?? null,
  }
  if (cardId) {
    await db.update(TrackerCard).set(fields).where(eq(TrackerCard.id, cardId))
  } else {
    const [created] = await db.insert(TrackerCard).values({ trackerId, ...fields }).returning()
    const tracker = await db.query.Tracker.findFirst({ where: eq(Tracker.id, trackerId) })
    if (tracker) {
      const cols = tracker.columns.map((c) =>
        c.id === colId ? { ...c, cardIds: [...c.cardIds, created.id] } : c
      )
      await db.update(Tracker).set({ columns: cols }).where(eq(Tracker.id, trackerId))
    }
  }
}

export async function moveCardAction(trackerId: string, cardId: string, toColId: string, toIndex: number) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const tracker = await db.query.Tracker.findFirst({ where: eq(Tracker.id, trackerId) })
  if (!tracker) return
  const fromCol = tracker.columns.find((c) => c.cardIds.includes(cardId))
  const toCol = tracker.columns.find((c) => c.id === toColId)
  const cols = tracker.columns.map((c) => {
    if (c.id === fromCol?.id) return { ...c, cardIds: c.cardIds.filter((id: string) => id !== cardId) }
    if (c.id === toColId) {
      const ids = [...c.cardIds]
      ids.splice(toIndex, 0, cardId)
      return { ...c, cardIds: ids }
    }
    return c
  })
  await db.update(Tracker).set({ columns: cols }).where(eq(Tracker.id, trackerId))
  const card = await db.query.TrackerCard.findFirst({ where: eq(TrackerCard.id, cardId) })
  if (card) {
    const update: Partial<TrackerCardRow> = {}
    if (toCol?.name === 'Applied' && !card.dateApplied) {
      update.dateApplied = new Date().toISOString().split('T')[0]
    }
    const statusUpdate = {
      id: uid(),
      fromColumnId: fromCol?.id || null,
      fromColumnName: fromCol?.name || null,
      toColumnId: toColId,
      toColumnName: toCol?.name || '',
      changedAt: new Date().toISOString(),
    }
    update.statusUpdates = [...(card.statusUpdates || []), statusUpdate]
    await db.update(TrackerCard).set(update).where(eq(TrackerCard.id, cardId))
  }
}

export async function deleteCardAction(cardId: string, trackerId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.delete(TrackerCard).where(eq(TrackerCard.id, cardId))
  const tracker = await db.query.Tracker.findFirst({ where: eq(Tracker.id, trackerId) })
  if (tracker) {
    const cols = tracker.columns.map((c) => ({ ...c, cardIds: c.cardIds.filter((id: string) => id !== cardId) }))
    await db.update(Tracker).set({ columns: cols }).where(eq(Tracker.id, trackerId))
  }
}

export async function deleteColumnAction(columnId: string, trackerId: string) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  const tracker = await db.query.Tracker.findFirst({ where: eq(Tracker.id, trackerId) })
  if (!tracker) return
  const col = tracker.columns.find((c) => c.id === columnId)
  if (col?.cardIds.length) {
    await db.delete(TrackerCard).where(eq(TrackerCard.trackerId, trackerId))
  }
  const cols = tracker.columns.filter((c) => c.id !== columnId)
  await db.update(Tracker).set({ columns: cols }).where(eq(Tracker.id, trackerId))
}

export async function saveColumnsAction(trackerId: string, columns: TrackerColumn[]) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/signin')
  await db.update(Tracker).set({ columns }).where(eq(Tracker.id, trackerId))
}