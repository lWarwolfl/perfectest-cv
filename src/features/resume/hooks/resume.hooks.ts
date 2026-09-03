'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  listResumesAction,
  getResumeAction,
  createResumeAction,
  duplicateResumeAction,
  deleteResumeAction,
  renameResumeAction,
  saveResumePersonalDetailsAction,
  saveResumeContentAction,
  saveResumeCustomizationAction,
  applyResumeTemplateAction,
} from '@/server/resume/resume.actions'
import { getErrorMessage } from '@/lib/utils'
import type { Content, Customization, PersonalDetails } from '@/features/resume/types'

export function useListResumes() {
  return useQuery({ queryKey: [QUERY_KEYS.RESUMES], queryFn: listResumesAction })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.RESUMES, id],
    queryFn: () => getResumeAction(id),
    enabled: !!id,
  })
}

export function useCreateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createResumeAction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }); toast.success('Resume created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDuplicateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateResumeAction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }); toast.success('Duplicated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResumeAction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }); toast.success('Deleted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useRenameResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameResumeAction(id, title),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveResumePersonalDetails() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, personalDetails }: { id: string; personalDetails: PersonalDetails }) =>
      saveResumePersonalDetailsAction(id, personalDetails),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveResumeContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: Content }) =>
      saveResumeContentAction(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveResumeCustomization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, customization }: { id: string; customization: Customization }) =>
      saveResumeCustomizationAction(id, customization),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useApplyResumeTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, templateId }: { id: string; templateId: string }) => applyResumeTemplateAction(id, templateId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] }); toast.success('Template applied') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}