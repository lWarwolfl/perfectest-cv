'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  getAiSettingsAction,
  saveAiSettingsAction,
  aiTransformAction,
  checkGrammarAction,
  translateResumeAction,
} from '@/server/ai/ai.actions'
import { getErrorMessage } from '@/lib/utils'

export function useAiSettings() {
  return useQuery({ queryKey: [QUERY_KEYS.AI_SETTINGS], queryFn: getAiSettingsAction })
}

export function useSaveAiSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveAiSettingsAction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.AI_SETTINGS] })
      toast.success('AI settings saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useGrammarCheck() {
  return useMutation({
    mutationFn: checkGrammarAction,
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useAiTransform() {
  return useMutation({
    mutationFn: aiTransformAction,
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useTranslateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ resumeId, language }: { resumeId: string; language: string }) =>
      translateResumeAction(resumeId, language),
    onSuccess: (resume) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
      toast.success(`"${resume.title}" created`)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
