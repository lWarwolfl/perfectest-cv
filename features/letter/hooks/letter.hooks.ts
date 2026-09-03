'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import { listLettersAction, createLetterAction, deleteLetterAction, saveLetterContentAction, saveLetterDesignAction } from '@/server/letter/letter.actions'
import { getErrorMessage } from '@/lib/utils'
import type { LetterContent, LetterDesign } from '@/features/letter/types'

export function useListLetters() {
  return useQuery({ queryKey: [QUERY_KEYS.LETTERS], queryFn: listLettersAction })
}

export function useCreateLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createLetterAction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }); toast.success('Letter created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLetterAction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }); toast.success('Deleted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveLetterContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: LetterContent }) => saveLetterContentAction(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveLetterDesign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, design }: { id: string; design: LetterDesign }) => saveLetterDesignAction(id, design),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}