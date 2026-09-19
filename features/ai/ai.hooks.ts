'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  getAiSettingsAction,
  saveAiSettingsAction,
  aiTransformAction,
  checkGrammarAction,
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
