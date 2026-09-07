'use client'

import { create } from 'zustand'

export type AutosaveStatus = 'idle' | 'saving' | 'error'

interface AutosaveState {
  status: AutosaveStatus
  lastSavedAt: number | null
  /** Page-level saveAll, registered by useAutosave — the retry dialog calls it. */
  saveFn: (() => Promise<void>) | null
  setSaveFn: (fn: (() => Promise<void>) | null) => void
  start: () => void
  success: () => void
  failure: () => void
}

export const useAutosaveStore = create<AutosaveState>((set) => ({
  status: 'idle',
  lastSavedAt: null,
  saveFn: null,
  setSaveFn: (saveFn) => set({ saveFn }),
  start: () => set({ status: 'saving' }),
  success: () => set({ status: 'idle', lastSavedAt: Date.now() }),
  failure: () => set({ status: 'error' }),
}))
