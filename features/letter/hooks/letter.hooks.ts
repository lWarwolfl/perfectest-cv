'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  listLettersAction,
  createLetterAction,
  deleteLetterAction,
  saveLetterContentAction,
  saveLetterDesignAction,
  copyResumeDesignAction,
} from '@/server/letter/letter.actions'
import { getErrorMessage } from '@/lib/utils'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { LetterDesign } from '@/features/letter/types'

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

export function useSaveLetterContent(id: string) {
  return useMutation({
    mutationFn: (patch: LetterContentPatch) => saveLetterContentAction(id, patch),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveLetterDesign(id: string) {
  return useMutation({
    mutationFn: (design: LetterDesign) => saveLetterDesignAction(id, design),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useCopyResumeDesign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ letterId, resumeId }: { letterId: string; resumeId: string }) =>
      copyResumeDesignAction(letterId, resumeId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }); toast.success('Design copied from resume!') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}