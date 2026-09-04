'use client'

import CustomizeTabLayout from './customize-tab-layout'
import TemplateLayoutSettings from './template-layout-settings'
import TypographySettings from './typography-settings'
import ColorThemeSettings from './color-theme-settings'
import HeaderControls, { LinkStylingSettings, WorkExperienceSettings } from './header-controls'
import PageSpacingSettings from './page-spacing-settings'
import EntryFormattingSettings from './entry-formatting-settings'
import SkillsStyleSettings from './skills/skills-style-settings'
import SectionDisplayPanel from './skills/section-display-panel'
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
      <HeaderControls
        customization={store.customization}
        onHeaderPatch={(patch) => {
          store.patchHeader(patch)
          emit({ header: { ...store.customization.header, ...patch } })
        }}
        onPhotoPositionPatch={(patch) => {
          store.patchPhotoPosition(patch)
          emit({ photoPosition: { ...store.customization.photoPosition, ...patch } })
        }}
      />
      <LinkStylingSettings
        customization={store.customization}
        onLinksPatch={(patch) => {
          store.patchLinks(patch)
          emit({ links: { ...store.customization.links, ...patch } })
        }}
      />
      <WorkExperienceSettings
        customization={store.customization}
        onWorkDisplayPatch={(patch) => {
          store.patchWorkDisplay(patch)
          emit({ workDisplay: { ...store.customization.workDisplay, ...patch } })
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
      {(['certificate', 'interest', 'language'] as const).map((section) => (
        <SectionDisplayPanel
          key={section}
          customization={store.customization}
          section={section}
          onSectionDisplayPatch={(s, patch) => {
            store.patchSectionDisplay(s, patch)
            emit({ [s]: { ...store.customization[s], ...patch } } as Partial<Customization>)
          }}
        />
      ))}
      <EntryFormattingSettings
        customization={store.customization}
        onEntryLayoutPatch={(patch) => {
          store.patchEntryLayout(patch)
          emit({ entryLayout: { ...store.customization.entryLayout, ...patch } })
        }}
        onRegionalPatch={(patch) => {
          store.patchRegional(patch)
          emit({ regional: { ...store.customization.regional, ...patch } })
        }}
        onFileNameChange={(fileName) => {
          emit({ fileName })
        }}
        onReset={() => {
          store.reset()
          onChange({ ...DEFAULT_CUSTOMIZATION })
        }}
      />
    </CustomizeTabLayout>
  )
}
