'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  listLettersAction,
  listLetterPreviewsAction,
  createLetterAction,
  duplicateLetterAction,
  deleteLetterAction,
  saveLetterContentAction,
  saveLetterDesignAction,
  copyResumeDesignAction,
  copyResumeDetailsAction,
  renameLetterAction,
} from '@/server/letter/letter.actions'
import { getErrorMessage } from '@/lib/utils'
import type { LetterContentPatch } from '@/server/letter/letter.actions'
import type { LetterDesign } from '@/features/letter/types'

export function useListLetters() {
  return useQuery({ queryKey: [QUERY_KEYS.LETTERS], queryFn: listLettersAction })
}

export function useListLetterPreviews() {
  return useQuery({ queryKey: [QUERY_KEYS.LETTERS, 'previews'], queryFn: listLetterPreviewsAction })
}

export function useCreateLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => createLetterAction(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] })
      toast.success('Letter created')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDuplicateLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateLetterAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] })
      toast.success('Duplicated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLetterAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] })
      toast.success('Deleted')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useRenameLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameLetterAction(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] })
      toast.success('Renamed')
    },
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] })
      toast.success('Design copied from resume!')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useCopyResumeDetails(id: string) {
  return useMutation({
    mutationFn: (resumeId: string) => copyResumeDetailsAction(id, resumeId),
    onSuccess: () => toast.success('Sender details copied from resume!'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
