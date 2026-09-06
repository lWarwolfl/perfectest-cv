'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/features/queries/keys'
import {
  listResumesAction,
  listResumePreviewsAction,
  getResumeAction,
  getResumeDocumentAction,
  createResumeAction,
  duplicateResumeAction,
  deleteResumeAction,
  renameResumeAction,
  saveResumePersonalDetailsAction,
  saveResumeCustomizationAction,
  addSectionAction,
  deleteSectionAction,
  saveSectionMetaAction,
  reorderSectionsAction,
  addEntryAction,
  updateEntryDataAction,
  updateEntryMetaAction,
  reorderEntriesAction,
  deleteEntryAction,
  applyResumeTemplateAction,
  syncFlowcvResumeAction,
} from '@/server/resume/resume.actions'
import { getErrorMessage } from '@/lib/utils'
import type {
  Customization,
  PersonalDetails,
  EntryData,
  SectionType,
} from '@/features/resume/types'

export function useListResumes() {
  return useQuery({ queryKey: [QUERY_KEYS.RESUMES], queryFn: listResumesAction })
}

export function useListResumePreviews() {
  return useQuery({ queryKey: [QUERY_KEYS.RESUMES, 'previews'], queryFn: listResumePreviewsAction })
}

export function useResume(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.RESUMES, id],
    queryFn: () => getResumeAction(id),
    enabled: !!id,
  })
}

export function useResumeDocument(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.RESUMES, id, 'document'],
    queryFn: () => getResumeDocumentAction(id),
    enabled: !!id,
  })
}

export function useCreateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title?: string) => createResumeAction(title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
      toast.success('Resume created')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDuplicateResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => duplicateResumeAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
      toast.success('Duplicated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteResumeAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
      toast.success('Deleted')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useRenameResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameResumeAction(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveResumePersonalDetails() {
  return useMutation({
    mutationFn: ({ id, personalDetails }: { id: string; personalDetails: PersonalDetails }) =>
      saveResumePersonalDetailsAction(id, personalDetails),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveResumeCustomization() {
  return useMutation({
    mutationFn: ({ id, customization }: { id: string; customization: Customization }) =>
      saveResumeCustomizationAction(id, customization),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useAddSection(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sectionType: SectionType) => addSectionAction(id, sectionType),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteSection(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sectionId: string) => deleteSectionAction(sectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSaveSectionMeta(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      sectionId,
      ...patch
    }: { sectionId: string } & Parameters<typeof saveSectionMetaAction>[1]) =>
      saveSectionMetaAction(sectionId, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useReorderSections(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sectionIds: string[]) => reorderSectionsAction(id, sectionIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useAddEntry(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sectionId: string) => addEntryAction(sectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useUpdateEntryData(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: EntryData }) =>
      updateEntryDataAction(entryId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useUpdateEntryMeta(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      entryId,
      ...patch
    }: { entryId: string } & Parameters<typeof updateEntryMetaAction>[1]) =>
      updateEntryMetaAction(entryId, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useReorderEntries(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sectionId, entryIds }: { sectionId: string; entryIds: string[] }) =>
      reorderEntriesAction(sectionId, entryIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useDeleteEntry(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => deleteEntryAction(entryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useApplyResumeTemplate(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) => applyResumeTemplateAction(id, templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES, id, 'document'] })
      toast.success('Template applied')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}

export function useSyncFlowcv() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ resumeId, url }: { resumeId: string; url: string }) =>
      syncFlowcvResumeAction(resumeId, url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.RESUMES] })
      toast.success('FlowCV resume synced')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
}
