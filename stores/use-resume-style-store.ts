'use client'

import { create } from 'zustand'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization, SectionDisplay } from '@/features/resume/types'

export type StyleSection = 'skill' | 'language' | 'interest' | 'certificate'

interface ResumeStyleState {
  customization: Customization
  revision: number
  hydrate: (customization: Customization) => void
  reset: () => void
  patchFont: (patch: Partial<Customization['font']>) => void
  patchColors: (patch: Partial<Customization['colors']>) => void
  patchBorder: (patch: Partial<Customization['border']>) => void
  patchHeader: (patch: Partial<Customization['header']>) => void
  patchLinks: (patch: Partial<Customization['links']>) => void
  patchPhotoPosition: (patch: Partial<Customization['photoPosition']>) => void
  patchWorkDisplay: (patch: Partial<Customization['workDisplay']>) => void
  patchLayout: (patch: Partial<Customization['layout']>) => void
  patchHeading: (patch: Partial<Customization['heading']>) => void
  patchSpacing: (patch: Partial<Customization['spacing']>) => void
  patchSectionDisplay: (section: StyleSection, patch: Partial<SectionDisplay>) => void
  patchEntryLayout: (patch: Partial<Customization['entryLayout']>) => void
  patchRegional: (patch: Partial<Customization['regional']>) => void
  patchApplyAccentColor: (patch: Partial<Customization['applyAccentColor']>) => void
  patchExpert: (patch: Partial<Customization['expert']>) => void
  patchAdvanced: (patch: Partial<Customization['advanced']>) => void
}

export const useResumeStyleStore = create<ResumeStyleState>((set) => ({
  customization: DEFAULT_CUSTOMIZATION,
  revision: 0,
  hydrate: (customization) => set({ customization }),
  reset: () => set((s) => ({ customization: DEFAULT_CUSTOMIZATION, revision: s.revision + 1 })),
  patchFont: (patch) =>
    set((s) => ({
      customization: { ...s.customization, font: { ...s.customization.font, ...patch } },
      revision: s.revision + 1,
    })),
  patchColors: (patch) =>
    set((s) => ({
      customization: { ...s.customization, colors: { ...s.customization.colors, ...patch } },
      revision: s.revision + 1,
    })),
  patchBorder: (patch) =>
    set((s) => ({
      customization: { ...s.customization, border: { ...s.customization.border, ...patch } },
      revision: s.revision + 1,
    })),
  patchHeader: (patch) =>
    set((s) => ({
      customization: { ...s.customization, header: { ...s.customization.header, ...patch } },
      revision: s.revision + 1,
    })),
  patchLinks: (patch) =>
    set((s) => ({
      customization: { ...s.customization, links: { ...s.customization.links, ...patch } },
      revision: s.revision + 1,
    })),
  patchPhotoPosition: (patch) =>
    set((s) => ({
      customization: { ...s.customization, photoPosition: { ...s.customization.photoPosition, ...patch } },
      revision: s.revision + 1,
    })),
  patchWorkDisplay: (patch) =>
    set((s) => ({
      customization: { ...s.customization, workDisplay: { ...s.customization.workDisplay, ...patch } },
      revision: s.revision + 1,
    })),
  patchLayout: (patch) =>
    set((s) => ({
      customization: { ...s.customization, layout: { ...s.customization.layout, ...patch } },
      revision: s.revision + 1,
    })),
  patchHeading: (patch) =>
    set((s) => ({
      customization: { ...s.customization, heading: { ...s.customization.heading, ...patch } },
      revision: s.revision + 1,
    })),
  patchSpacing: (patch) =>
    set((s) => ({
      customization: { ...s.customization, spacing: { ...s.customization.spacing, ...patch } },
      revision: s.revision + 1,
    })),
  patchSectionDisplay: (section, patch) =>
    set((s) => ({
      customization: {
        ...s.customization,
        [section]: { ...s.customization[section], ...patch },
      },
      revision: s.revision + 1,
    })),
  patchEntryLayout: (patch) =>
    set((s) => ({
      customization: { ...s.customization, entryLayout: { ...s.customization.entryLayout, ...patch } },
      revision: s.revision + 1,
    })),
  patchRegional: (patch) =>
    set((s) => ({
      customization: { ...s.customization, regional: { ...s.customization.regional, ...patch } },
      revision: s.revision + 1,
    })),
  patchApplyAccentColor: (patch) =>
    set((s) => ({
      customization: {
        ...s.customization,
        applyAccentColor: { ...s.customization.applyAccentColor, ...patch },
      },
      revision: s.revision + 1,
    })),
  patchExpert: (patch) =>
    set((s) => ({
      customization: { ...s.customization, expert: { ...s.customization.expert, ...patch } },
      revision: s.revision + 1,
    })),
  patchAdvanced: (patch) =>
    set((s) => ({
      customization: { ...s.customization, advanced: { ...s.customization.advanced, ...patch } },
      revision: s.revision + 1,
    })),
}))
