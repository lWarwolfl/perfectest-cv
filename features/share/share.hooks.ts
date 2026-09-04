'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import { setResumeShareAction } from '@/server/resume/resume.actions'
import { setLetterShareAction } from '@/server/letter/letter.actions'
import { getErrorMessage } from '@/lib/utils'

export function useShareResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, live }: { id: string; live: boolean }) => setResumeShareAction(id, live),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useShareLetter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, live }: { id: string; live: boolean }) => setLetterShareAction(id, live),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.LETTERS] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
