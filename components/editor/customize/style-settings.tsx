'use client'

import CustomizeTabLayout from './customize-tab-layout'
import TemplateLayoutSettings from './template-layout-settings'
import TypographySettings from './typography-settings'
import ColorThemeSettings from './color-theme-settings'
import HeaderTitleSettings from './header-title-settings'
import PageSpacingSettings from './page-spacing-settings'
import EntryFormattingSettings from './entry-formatting-settings'
import SkillsStyleSettings from './skills/skills-style-settings'
import { useResumeStyleStore } from '@/stores/use-resume-style-store'
import { DEFAULT_CUSTOMIZATION } from '@/features/resume/defaults'
import type { Customization, TSection } from '@/features/resume/types'

interface StyleSettingsProps {
  sections: TSection[]
  onChange: (next: Customization) => void
  onReorderSections: (sectionIds: string[]) => void
  onToggleSection: (sectionId: string, hidden: boolean) => void
}

export default function StyleSettings({
  sections,
  onChange,
  onReorderSections,
  onToggleSection,
}: StyleSettingsProps) {
  const store = useResumeStyleStore()
  function emit(patch: Partial<Customization>) {
    onChange({ ...store.customization, ...patch } as Customization)
  }

  return (
    <CustomizeTabLayout>
      <TemplateLayoutSettings
        customization={store.customization}
        sections={sections}
        onPatch={(patch) => {
          store.patchLayout(patch)
          emit({ layout: { ...store.customization.layout, ...patch } })
        }}
        onReorderSections={onReorderSections}
        onToggleSection={onToggleSection}
      />
      <TypographySettings
        customization={store.customization}
        onPatch={(patch) => {
          store.patchSpacing(patch)
          emit({ spacing: { ...store.customization.spacing, ...patch } })
        }}
        onFontChange={(patch) => {
          store.patchFont(patch)
          emit({ font: { ...store.customization.font, ...patch } })
        }}
      />
      <ColorThemeSettings
        customization={store.customization}
        onPatch={(patch) => {
          store.patchColors(patch)
          emit({ colors: { ...store.customization.colors, ...patch } })
        }}
        onApplyAccentPatch={(patch) => {
          store.patchApplyAccentColor(patch)
          emit({ applyAccentColor: { ...store.customization.applyAccentColor, ...patch } })
        }}
      />
      <HeaderTitleSettings
        customization={store.customization}
        onHeaderPatch={(patch) => {
          store.patchHeader(patch)
          emit({ header: { ...store.customization.header, ...patch } })
        }}
        onHeadingPatch={(patch) => {
          store.patchHeading(patch)
          emit({ heading: { ...store.customization.heading, ...patch } })
        }}
      />
      <PageSpacingSettings
        customization={store.customization}
        onPatch={(patch) => {
          store.patchSpacing(patch)
          emit({ spacing: { ...store.customization.spacing, ...patch } })
        }}
        onRegionalPatch={(patch) => {
          store.patchRegional(patch)
          emit({ regional: { ...store.customization.regional, ...patch } })
        }}
      />
      <SkillsStyleSettings
        customization={store.customization}
        onSectionDisplayPatch={(section, patch) => {
          store.patchSectionDisplay(section, patch)
          emit({ [section]: { ...store.customization[section], ...patch } } as Partial<Customization>)
        }}
      />
      <EntryFormattingSettings
        customization={store.customization}
        onSectionDisplayPatch={(section, patch) => {
          store.patchSectionDisplay(section, patch)
          emit({ [section]: { ...store.customization[section], ...patch } } as Partial<Customization>)
        }}
        onEntryLayoutPatch={(patch) => {
          store.patchEntryLayout(patch)
          emit({ entryLayout: { ...store.customization.entryLayout, ...patch } })
        }}
        onRegionalPatch={(patch) => {
          store.patchRegional(patch)
          emit({ regional: { ...store.customization.regional, ...patch } })
        }}
        onReset={() => {
          store.reset()
          onChange({ ...DEFAULT_CUSTOMIZATION })
        }}
      />
    </CustomizeTabLayout>
  )
}
