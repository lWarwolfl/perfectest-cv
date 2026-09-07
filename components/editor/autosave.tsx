'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAutosaveStore } from '@/stores/use-autosave-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const INTERVAL_MS = 5000

/**
 * Registers the page's saveAll with the store (so the retry dialog can call it)
 * and flushes it on an interval and on `online`. saveAll itself must no-op when
 * nothing is dirty, gate on `status === 'saving'`, and call start/success/failure.
 */
export function useAutosave(save: () => Promise<void>) {
  const saveRef = useRef(save)
  const setSaveFn = useAutosaveStore((s) => s.setSaveFn)
  useEffect(() => {
    saveRef.current = save
  }, [save])
  useEffect(() => {
    setSaveFn(() => saveRef.current())
    return () => {
      setSaveFn(null)
      // leaving the editor: clear stale "Saved …" timestamp/status
      useAutosaveStore.setState({ status: 'idle', lastSavedAt: null })
    }
  }, [setSaveFn])
  useEffect(() => {
    const run = () => void saveRef.current()
    const t = setInterval(run, INTERVAL_MS)
    window.addEventListener('online', run)
    return () => {
      clearInterval(t)
      window.removeEventListener('online', run)
    }
  }, [])
}

export function AutosaveStatus() {
  const status = useAutosaveStore((s) => s.status)
  const lastSavedAt = useAutosaveStore((s) => s.lastSavedAt)
  if (status === 'error') return null // the dialog owns the failure state
  if (status === 'saving')
    return <Loader2 className="text-muted-foreground size-4 animate-spin" aria-label="Saving…" />
  if (!lastSavedAt) return null
  return (
    <span className="text-muted-foreground hidden text-xs md:inline">
      Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

export function AutosaveDialog() {
  const status = useAutosaveStore((s) => s.status)
  const saveFn = useAutosaveStore((s) => s.saveFn)
  const [pending, setPending] = useState(false)
  async function retry() {
    setPending(true)
    try {
      await saveFn?.()
    } finally {
      setPending(false)
    }
  }
  return (
    <Dialog open={status === 'error'}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Couldn&apos;t save changes</DialogTitle>
          <DialogDescription>
            We lost the connection to the server, so your latest changes aren&apos;t saved yet.
            We&apos;ll keep retrying automatically — you can also try saving now.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={retry} disabled={pending || !saveFn}>
            {pending ? 'Saving…' : 'Try saving now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
