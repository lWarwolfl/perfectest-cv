### Task: Implement Editor Top Bar Navigation

**UI Layout & Styling (shadcn/ui):**
- Container: Full-width sticky top header (`h-16 border-b border-border bg-background/95 backdrop-blur px-6 flex items-center justify-between z-10`).
- Left Tab Navigation (`ToggleGroup` or custom `TabsList`):
  - Segmented controls: "Overview" (LayoutGrid icon), "Content" (FileText icon), "Customize" (Sliders icon), "AI Tools" (Wand2 icon).
  - Active Tab ("Content"): `bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-semibold shadow-none rounded-lg px-3.5 py-1.5 text-sm flex items-center gap-2`.
  - Inactive Tabs: `text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors flex items-center gap-2`.
- Right Action Controls:
  - Document Selector: `Select` component (`w-36` size `sm`) showing current resume title with drop indicator.
  - Primary Action Button: `Button` component with download icon (`bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg gap-2 font-medium`).
  - Ellipsis Action Menu: `Button` variant `outline` size `icon` (`MoreVertical` icon).

**Feature Logic & State:**
- Tab state switching (`activeTab`: `'overview' | 'content' | 'customize' | 'ai-tools'`).
- Document selection state to switch between multiple user resume drafts.
- Download trigger: Triggers client-side PDF compilation/export modal.

**Hermes Action Items:**
1. Create `components/editor/editor-header.tsx`.
2. Use `shadcn/ui` `Select`, `Button`, and `DropdownMenu` components.
3. Wire active tab state to parent editor view wrapper.


### Task: Implement Personal Info Summary Card

**UI Layout & Styling (shadcn/ui):**
- Card Container: `Card` component (`bg-card border border-border rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-shadow`).
- Edit Trigger Button: Absolute positioned top-right floating circle button (`absolute top-5 right-5 size-9 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-sm transition-transform active:scale-95`).
- Left Column Layout (Text Details):
  - User Full Name: `text-xl font-bold text-foreground`.
  - Job Title: `text-sm text-muted-foreground font-medium mt-0.5`.
  - Contact Details Grid: Flex column gap-1.5 mt-4 text-xs text-muted-foreground.
    - Email with `Mail` icon.
    - Phone with `Phone` icon.
    - Address with `MapPin` icon.
- Right Column Layout (Avatar):
  - Avatar image frame: `Avatar` component (`size-20 rounded-full border-2 border-border overflow-hidden object-cover`).

**Feature Logic & State:**
- Floating edit button click opens the `PersonalInfoEditDialog` modal.
- React Hook Form integration to bind fields: `fullName`, `jobTitle`, `email`, `phone`, `address`, `avatarUrl`.
- Real-time preview updating on form input change.

**Hermes Action Items:**
1. Create `components/editor/personal-info-card.tsx` and `components/editor/personal-info-dialog.tsx`.
2. Utilize `shadcn/ui` `Avatar`, `Button`, `Dialog`, `Input`, and `Form` components.
3. Handle file upload for profile image avatar using pre-signed URL or cloud media handler.

### Task: Implement Dynamic Resume Section Accordions & Entry Items

**UI Layout & Styling (shadcn/ui):**
- Accordion Wrapper: `Accordion` component (`type="multiple"` or `type="single"` collapsible) with `gap-3 flex flex-col`.
- Accordion Item Container: `AccordionItem` (`bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-3`).
- Accordion Header Bar:
  - Icon + Section Title: Flex row with section category icon (`User`, `Briefcase`, `Code`, `GraduationCap`, `Globe`, `Folder`) and text `text-base font-bold text-foreground`.
  - Header Controls: "Edit Heading" button (`Button` variant `ghost` size `sm` with `Pencil` icon).
  - Expand/Collapse Arrow Trigger.
- Entry Item Card (Expanded State):
  - Outer item box: `bg-muted/40 border border-border/60 rounded-lg p-3 flex items-center justify-between gap-3`.
  - Left Drag Handle: `GripVertical` icon (`text-muted-foreground/60 hover:text-foreground cursor-grab`).
  - Text Preview: Truncated entry snippet (`text-xs text-muted-foreground line-clamp-1 flex-1`).
  - Right Controls: Visibility toggle (`Eye` / `EyeOff` icon `Button` variant `ghost` size `icon`), Delete item (`Trash2` icon).
- Accordion Footer Bar:
  - "+ Add Entry" button (`Button` variant `outline` size `sm` `rounded-full`).
  - Section Delete Button (`Trash2` icon `text-muted-foreground hover:text-destructive`).

**Feature Logic & State:**
- Drag-and-drop reordering for both sections and items inside sections (using `@hello-pangea/dnd` or `dnd-kit`).
- Collapse/expand state per section card (`openSections` array).
- Entry-level visibility toggle state (`hidden: boolean`).
- Inline entry editing trigger on entry click.

**Hermes Action Items:**
1. Create `components/editor/section-accordion.tsx` and `components/editor/section-entry-item.tsx`.
2. Implement drag-and-drop handles for reordering entries.
3. Integrate `shadcn/ui` `Accordion`, `Button`, and `Tooltip` components.

### Task: Implement Main Editor Layout Canvas & Section Add Button

**UI Layout & Styling (shadcn/ui):**
- Main View Container: Two-column grid/flex layout (`grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] bg-muted/20`).
- Left Column (Form Controls): `lg:col-span-6 xl:col-span-5 p-6 overflow-y-auto max-w-2xl mx-auto w-full`.
- Right Column (Live Document Preview): `hidden lg:block lg:col-span-6 xl:col-span-7 bg-muted/40 border-l border-border p-8 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`.
- Bottom Section CTA Button:
  - Container: Flex center container (`py-6 flex justify-center`).
  - Button: Dynamic action button (`bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl px-6 py-3 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2`).

**Feature Logic & State:**
- Add Content Button click: Opens `AddSectionModal` grid displaying available section templates (e.g., Certifications, Publications, Custom Section, References).
- Split-screen view responsive logic: Toggles preview drawer on smaller screens.

**Hermes Action Items:**
1. Create `app/editor/[id]/page.tsx` or `components/editor/editor-layout.tsx`.
2. Create `components/editor/add-section-modal.tsx`.
3. Wire state store (Zustand / React Context) to handle full resume document schema edits and sync with preview render canvas.



### Task: Implement Rich Text Editor with AI Toolbar & Enhancers

**UI Layout & Styling (shadcn/ui):**
- Container: Integrated input frame (`bg-muted/30 border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all`).
- Top Formatting Toolbar (`h-10 bg-muted/50 border-b border-border/60 px-3 flex items-center gap-1 overflow-x-auto`):
  - Formatting Actions: Bold (`Bold` icon), Italic (`Italic` icon), Underline (`Underline` icon).
  - List & Link Actions: Bullet list (`List` icon), Hyperlink popover trigger (`Link` icon).
  - Alignment Actions: Left (`AlignLeft`), Center (`AlignCenter`), Right (`AlignRight`), Justify (`AlignJustify`).
  - Active Tool Button: `bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium rounded-md size-7 flex items-center justify-center transition-colors`.
- Textarea Body: Content editable or rich text container (`p-3 min-h-[120px] text-sm text-foreground bg-transparent focus:outline-none`).
- Bottom AI Action Chips Bar (`p-2.5 bg-muted/20 border-t border-border/40 flex items-center gap-2 flex-wrap`):
  - AI Mascot/Icon (`Wand2` or `Bot` icon in `text-indigo-500`).
  - Action Chips (`Button` variant `secondary` size `sm` `rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300`):
    - "Improve Writing"
    - "Suggest Content"
    - "Grammar Check"
    - "Shorter"

**Feature Logic & State:**
- Integrate Tiptap (`@tiptap/react`) or Slate JS for rich text field state.
- Real-time onChange handler emitting HTML/Markdown string updates to parent resume state store (Zustand / React Context) for instant live preview updates.
- AI Action trigger: Passes current selection or full block text to LLM API route (`/api/ai/enhance`), displaying a subtle loading pulse on the clicked chip.

**Hermes Action Items:**
1. Create `components/editor/rich-text-editor.tsx` and `components/editor/ai-enhancer-chips.tsx`.
2. Configure Tiptap extensions: `StarterKit`, `Underline`, `Link`, `TextAlign`.
3. Wire AI button click events to trigger text transformation handlers.

### Task: Implement Inline Link URL Popover Modal

**UI Layout & Styling (shadcn/ui):**
- Popover Container: `PopoverContent` from `shadcn/ui` (`p-2 bg-card border border-border shadow-xl rounded-2xl w-80 space-y-2 z-50`).
- Header: Label "Link URL" styled with `text-sm font-bold text-foreground mb-1.5`.
- Form Controls Row: Flex container (`flex items-center gap-2`).
  - URL Input: `Input` component (`bg-muted/50 border-0 focus-visible:ring-1 text-sm h-10 rounded-xl flex-1 placeholder:text-muted-foreground`).
  - Submit Button: `Button` size `icon` (`bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl size-10 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95`).
  - Icon: `Check` icon (`size-5 text-white stroke-[2.5]`).

**Feature Logic & State:**
- Attach popover to `[Link]` triggers inside custom input fields or rich text selection.
- Input validation: Auto-prepends `https://` if protocol is missing.
- Keyboard shortcut: Enter key triggers link attach & closes popover.
- Clear link state: Emptying input and clicking confirm strips link annotation.

**Hermes Action Items:**
1. Create `components/editor/link-popover.tsx`.
2. Use `shadcn/ui` `Popover`, `PopoverTrigger`, `PopoverContent`, `Input`, and `Button` components.
3. Handle link validation and bind output URL string to field metadata.

### Task: Implement Personal Details Form Section

**UI Layout & Styling (shadcn/ui):**
- Layout Grid: Two-column responsive layout (`grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-card border border-border rounded-2xl shadow-sm`).
- Top Bar: Section Title "Edit Personal Details" (`text-xl font-bold text-foreground`), Top utilities: "Get Tips" button (`Lightbulb` icon).
- Photo Upload Column (`md:col-span-4 flex flex-col items-center justify-center order-1 md:order-2`):
  - Avatar Frame: `size-24 rounded-full overflow-hidden border-2 border-border shadow-inner relative group cursor-pointer`.
  - Hover overlay: Dark translucent layer with `Camera` icon to trigger avatar replacement.
- Left Input Controls (`md:col-span-8 order-2 md:order-1 space-y-4`):
  - "Full name" input field (`Input` component).
  - "Professional title" input field (`Input` component).
- Full Width Contact Fields Grid (`md:col-span-12 space-y-3`):
  - Fields: Email, Phone, Location (City, Country).
  - Social & Link Fields with Inline `[Link]` Buttons: Website, LinkedIn, GitHub (`Input` with embedded `LinkPopover` trigger button `bg-muted hover:bg-muted/80 text-xs px-2.5 py-1 rounded-lg border border-border text-foreground flex items-center gap-1`).
  - Reorder Handle: `GripVertical` icon (`text-muted-foreground/60 cursor-grab ml-2`) alongside list items.
- "Add details" Pills Section:
  - Header: "Add details" (`text-xs font-semibold text-muted-foreground uppercase tracking-wider`).
  - Quick Addition Pills: `+ Nationality`, `+ Date of Birth`, `+ Visa`, `+ Passport or Id`, `+ Availability`.
  - Button styling: `Button` variant `outline` size `sm` `rounded-full text-xs gap-1 border-dashed text-muted-foreground hover:text-foreground`.
  - "Show More" expansion link.

**Feature Logic & State:**
- React Hook Form schema (`personalDetailsSchema`) with Zod validation.
- Live updates: Form values bind to state via `useWatch` to update the canvas live on input change.
- Dynamic fields: Clicking "+ Nationality" appends the respective field into the form controls view dynamically.

**Hermes Action Items:**
1. Create `components/editor/forms/personal-details-form.tsx`.
2. Implement schema using `zod` and `react-hook-form`.
3. Add drag-and-drop handles for contact info items (`dnd-kit` or `@hello-pangea/dnd`).

### Task: Implement Form Card Container & Sticky Bottom Save Bar

**UI Layout & Styling (shadcn/ui):**
- Form Card Container: `bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col`.
- Card Header Bar (`p-6 pb-4 border-b border-border/40 flex items-center justify-between`):
  - Title: "Edit Entry" (`text-xl font-bold text-foreground`).
  - Right Utility Group:
    - "Get Tips" (`Button` variant `ghost` size `sm` `gap-1.5 text-xs text-muted-foreground hover:text-foreground`).
    - Visibility Toggle (`Button` variant `secondary` size `icon` `rounded-xl size-9 bg-muted/60 text-muted-foreground hover:text-foreground`).
    - Delete Action (`Button` variant `secondary` size `icon` `rounded-xl size-9 bg-muted/60 text-destructive/80 hover:text-destructive hover:bg-destructive/10`).
- Card Body Container: `p-6 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto`.
- Floating Bottom Sticky Bar Container (`sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex justify-center z-10`):
  - Primary "Done" Button: Vibrant pill gradient button (`w-full max-w-sm bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:opacity-95 text-white font-bold h-12 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`).

**Feature Logic & State:**
- Reusable wrapper for specific entry forms (Education, Experience, Skills, Languages, Projects, Interests).
- Handles entry visibility toggle state (`isVisible: boolean`).
- Delete confirmation popover (`AlertDialog`).
- "Done" button action: Validates form, commits active entry edits to document store, and collapses entry editor view.

**Hermes Action Items:**
1. Create `components/editor/forms/entry-form-container.tsx`.
2. Integrate `shadcn/ui` `Button`, `Tooltip`, and `AlertDialog`.
3. Pass generic form save/cancel handlers into child form implementations.

### Task: Implement Section Entry Forms (Skills, Education, Languages, Projects, Interests)

**UI Layout & Styling (shadcn/ui):**

- **Form 1: Skills Form (`components/editor/forms/skill-form.tsx`)**
  - "Skill" Title Input (`Input` component, placeholder: "e.g. Next.js").
  - "Information / Sub-skills" Rich Text Component (`RichTextEditor` component).
  - "Skill level" Select Dropdown (`Select` component with options: "Beginner", "Intermediate", "Advanced", "Expert").

- **Form 2: Education Form (`components/editor/forms/education-form.tsx`)**
  - "Degree" Title Input (`Input` component, e.g. "Bachelor's Degree, Software Engineering").
  - "School" Input with embedded `LinkPopover` trigger button.
  - Date & Location Row (`grid grid-cols-1 sm:grid-cols-3 gap-3`):
    - "Start Date" & "End Date" (`Input` with trailing 'X' clear button `size-4 text-muted-foreground hover:text-foreground cursor-pointer`).
    - "Location" (`Input` component, placeholder: "City, Country").
  - "Description" Rich Text Component with AI enhancer chips.

- **Form 3: Languages Form (`components/editor/forms/language-form.tsx`)**
  - "Language" Input (`Input` component, e.g. "English").
  - "Additional information" Rich Text Component (e.g. "Bilingual Proficiency").
  - "Language level" Select or Input field with clear 'X' button ("Native", "Fluent", "Proficient", "Intermediate", "Basic").

- **Form 4: Projects Form (`components/editor/forms/project-form.tsx`)**
  - "Project title" Input with embedded `LinkPopover` trigger button.
  - "Sub title" Input (e.g. "Next.js - TypeScript - Tailwind CSS - Drizzle").
  - "Start Date" / "End Date" Date Row inputs.
  - "Description" Rich Text Component with inline links and AI enhancer chips.

- **Form 5: Interests Form (`components/editor/forms/interest-form.tsx`)**
  - "Interest" Input with embedded `LinkPopover` trigger button (e.g. "Three.js").
  - "Additional information" Rich Text Component.

**Feature Logic & State:**
- Each section form binds to its respective Zod schema (`skillSchema`, `educationSchema`, `languageSchema`, `projectSchema`, `interestSchema`).
- Real-time form synchronization: Emits value changes on keypress/selection to update the live preview panel instantly.

**Hermes Action Items:**
1. Create individual form files under `components/editor/forms/`:
   - `skill-form.tsx`
   - `education-form.tsx`
   - `language-form.tsx`
   - `project-form.tsx`
   - `interest-form.tsx`
2. Define field schemas using Zod for each section type.
3. Connect form fields to `EntryFormContainer` and live resume preview store.

### Task: Implement Design & Customization Side Panel Shell

**UI Layout & Styling (shadcn/ui):**
- Container: Vertical scrolling panel (`w-full max-w-xl mx-auto p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]`).
- Section Cards: Stacked `Card` components (`bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4`).
- Section Headers: Flex row with icon and title (`text-lg font-bold text-foreground flex items-center gap-2.5`).
- Subtext / Hints: `text-xs text-muted-foreground`.

**Feature Logic & State:**
- Single state provider/store for all resume styling properties (`useResumeStyleStore`).
- Accordion or stacked card layout allowing quick navigation to design subsections (Template, Layout, Fonts, Spacing, Colors, Header, Titles, Page Setup).
- Live canvas updates: Modifying any control instantly updates the CSS variables or props passed to the SVG/HTML A4 preview renderer.

**Hermes Action Items:**
1. Create `components/editor/customize/customize-tab-layout.tsx`.
2. Setup Zustand store `stores/use-resume-style-store.ts` to hold design configuration state.
3. Import child customization sub-panels into a unified scrolling column view.

### Task: Implement Template Gallery & Column Layout Controls

**UI Layout & Styling (shadcn/ui):**
- **Template Card:**
  - Active Template Info: Display current template title ("Single Column", "Two Column Classic", "Sidebar Minimal") with layout thumbnail badge.
  - "Change Template" CTA: `Button` variant `outline` (`w-full border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-semibold gap-2`).
- **Layout Architecture Selector (`RadioGroup`):**
  - Columns Option Cards: Grid choice (`grid grid-cols-2 gap-3`).
  - Single Column Card vs Two-Column Card: Preview icon illustration, active state border (`border-2 border-primary bg-primary/5`).
- **Section Order List (`dnd-kit` Reorderable Stack):**
  - Section Items: Draggable rows showing section name with `GripVertical` handle and toggle switch to show/hide entire section on output document.

**Feature Logic & State:**
- Template Switcher opens `TemplateGalleryModal` showing interactive template visual cards.
- Layout toggle changes main content flow from single full-width column to dual column (main + sidebar) with configurable width ratio slider (e.g. 60/40 vs 70/30).
- Drag-and-drop handles update section arrangement order in the document renderer payload.

**Hermes Action Items:**
1. Create `components/editor/customize/template-layout-settings.tsx` and `components/editor/customize/template-gallery-modal.tsx`.
2. Integrate `shadcn/ui` `RadioGroup`, `Label`, `Switch`, and `Dialog`.
3. Implement `dnd-kit` vertical drag reordering list for section hierarchy.

### Task: Implement Font Selector, Size Sliders & Line Height Controls

**UI Layout & Styling (shadcn/ui):**
- **Font Family Selector (`Select` component):**
  - Categorized list: Sans-Serif (Inter, Roboto, Arial), Serif (Lora, Merriweather, Garamond), Monospace (Geist Mono, JetBrains Mono).
  - Preview text rendered in selected font family.
- **Font Size Sliders (`Slider` component):**
  - Overall Font Size: Range 8pt to 14pt (default 10pt) with numerical indicator (`text-sm font-semibold text-foreground`).
  - Heading Size Multiplier: Range 1.0x to 2.2x.
  - Subheading Size Multiplier: Range 0.9x to 1.5x.
- **Spacing & Line Height Controls:**
  - Line Height: Compact (1.1), Normal (1.3), Relaxed (1.5) toggle group (`ToggleGroup` / `TabsList`).
  - Paragraph / Block Gap: Incremental stepper or slider (`0px` to `24px`).

**Feature Logic & State:**
- Font loading via Next.js `next/font` dynamic CSS variable injection.
- Real-time CSS property bindings: `--resume-font-family`, `--resume-font-size-base`, `--resume-line-height`, `--resume-heading-scale`.

**Hermes Action Items:**
1. Create `components/editor/customize/typography-settings.tsx`.
2. Integrate `shadcn/ui` `Select`, `Slider`, `Label`, and `ToggleGroup`.
3. Map typography selections to global print styles applied to live A4 canvas.

### Task: Implement Color Palette Presets & Hex Picker

**UI Layout & Styling (shadcn/ui):**
- **Preset Color Swatches Grid:**
  - Palette Grid: `grid grid-cols-6 gap-2.5 my-3`.
  - Swatch Circles: `size-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer flex items-center justify-center`.
  - Active Swatch: Outer ring (`ring-2 ring-primary ring-offset-2`).
- **Custom Color Pickers (`Popover` + Color Input):**
  - Target Fields: Primary Accent, Text Color, Background Color, Muted Text.
  - Hex Input Row: Flex row with color swatch trigger box (`size-7 rounded-lg border border-border shadow-inner`) and hex code `Input` (`w-28 text-xs font-mono`).
- **Color Target Application Checkboxes (`Checkbox` group):**
  - Apply primary color to: Section Headings, Bullet Icons, Accent Divider Lines, Skill Progress Bars.

**Feature Logic & State:**
- Selecting a preset palette bulk-updates primary, accent, and contrast text variables.
- Color popover supports color wheel or raw Hex/RGB strings.
- Custom target checkboxes allow users to restrict color application strictly to specific components (e.g., headings only vs all icons).

**Hermes Action Items:**
1. Create `components/editor/customize/color-theme-settings.tsx`.
2. Integrate `shadcn/ui` `Popover`, `Input`, `Checkbox`, and `Label`.
3. Store colors as CSS HSL/Hex variables in `useResumeStyleStore`.

### Task: Implement Header Alignment, Photo Shape & Title Styling Controls

**UI Layout & Styling (shadcn/ui):**
- **Header Alignment Layout Selector:**
  - Options: Left Aligned, Centered, Two-Column Compact (`ToggleGroup` with layout icons).
- **Profile Photo Controls:**
  - Photo Shape Picker: Circle (`rounded-full`), Rounded Square (`rounded-xl`), Square (`rounded-none`).
  - Photo Size Slider: `40px` to `120px`.
  - Border Toggle & Color Selector (`Switch` + Color indicator).
- **Section Title Customizations:**
  - Title Decoration Options: Bottom Border Line, Left Vertical Accent Bar, Solid Background Fill Pill, None (`RadioGroup` with preview icons).
  - Title Case Options: UPPERCASE, Title Case, lowercase (`ToggleGroup`).
  - Font Weight Options: Regular (400), Medium (500), Bold (700), Extra Bold (800).

**Feature Logic & State:**
- Updates section title rendered DOM wrappers dynamically (e.g. applying `border-b-2 border-primary` or `bg-primary/10 px-3 py-1 rounded`).
- Header alignment updates flex alignment (`items-start text-left` vs `items-center text-center`).

**Hermes Action Items:**
1. Create `components/editor/customize/header-title-settings.tsx`.
2. Integrate `shadcn/ui` `ToggleGroup`, `RadioGroup`, `Slider`, `Switch`, and `Label`.
3. Apply styling variants to document preview header and section heading nodes.

### Task: Implement Paper Settings, Page Margins & Breaks Controls

**UI Layout & Styling (shadcn/ui):**
- **Paper Size Selector:**
  - `Select` component with options: "A4 (210 × 297 mm)", "US Letter (8.5 × 11 in)".
- **Page Margin Controls (`Slider` components):**
  - Individual Sliders or Universal Slider: Top/Bottom Margin (`10mm` to `30mm`), Left/Right Margin (`10mm` to `30mm`).
  - Section Spacing Gap (`8px` to `28px`).
  - Entry Item Spacing Gap (`4px` to `16px`).
- **Page Break & Numbering Options:**
  - Show Page Boundary Indicators: `Switch` component.
  - Page Numbers Toggle: `Switch` component + Alignment selector (`Left`, `Center`, `Right`).
  - Page Number Format: "1 of 2", "Page 1", "1".

**Feature Logic & State:**
- Updates A4/Letter dimensions on preview canvas container element.
- Dynamic page split calculation: Displays horizontal page break line indicators on the preview area when content overflows past page 1 height.
- Adjusting margins updates `@page` print media styles for PDF compiler exports.

**Hermes Action Items:**
1. Create `components/editor/customize/page-spacing-settings.tsx`.
2. Integrate `shadcn/ui` `Select`, `Slider`, `Switch`, and `Label`.
3. Wire page metrics to live document view page break engine.

### Task: Implement List Bullets, Date Layout & Section Overrides

**UI Layout & Styling (shadcn/ui):**
- **Bullet Point Style Picker (`Select` or `ToggleGroup`):**
  - Options: Standard Circle (`disc`), Square (`square`), Arrow (`>`), Dash (`-`), None (`none`).
- **Date & Location Display Formatting:**
  - Date Format Selector: "MM/YYYY (04/2026)", "MMM YYYY (Apr 2026)", "YYYY (2026)".
  - Date Position: Right Aligned (same line as title), Below Title (new line), Inline with bullet.
- **Section Specific Overrides (Collapsible Sub-cards):**
  - Skills Style: Compact Pills (`bg-muted px-2 py-0.5 rounded-md`), Progress Bars (1-5 scale), Dot Ratings, Plain Comma List.
  - Languages Style: Tag pills vs Level subtext display.
- **Bottom Reset / Save Defaults Row (`p-4 bg-muted/40 rounded-xl flex items-center justify-between mt-6`):**
  - "Reset Customizations": `Button` variant `ghost` size `sm` `text-destructive hover:bg-destructive/10`.
  - "Save as Default": `Button` variant `outline` size `sm` `font-semibold`.

**Feature Logic & State:**
- Formatting rules apply globally across all entries while maintaining option for per-section overrides.
- Reset Action: Restores design store state to template default parameters.
- Save as Default: Stores user's preferred layout options to user profile preferences in backend database.

**Hermes Action Items:**
1. Create `components/editor/customize/entry-formatting-settings.tsx`.
2. Integrate `shadcn/ui` `Select`, `ToggleGroup`, `Button`, and `Accordion`.
3. Connect list bullet and date format transforms to document generator engine.

### Task: Implement Cover Letter Editor Header & View Wrapper

**UI Layout & Styling (shadcn/ui):**
- Container: Full-width sticky bar (`h-16 border-b border-border bg-background/95 backdrop-blur px-6 flex items-center justify-between z-10`).
- Left Tab Group (`TabsList` or `ToggleGroup`):
  - Tabs: "Overview" (`LayoutGrid` icon), "Content" (`FileText` icon), "Customize" (`Sliders` icon).
  - Active Tab ("Content"): `bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-semibold shadow-none rounded-lg px-3.5 py-1.5 text-sm flex items-center gap-2`.
  - Inactive Tabs: `text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors flex items-center gap-2`.
- Right Action Controls:
  - Cover Letter Dropdown: `Select` component (`w-52` size `sm`) showing active letter document title (e.g. `Sina-kheiri-Cover-L...`).
  - Download Button: `Button` component (`bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg gap-2 font-medium`).
  - Action Menu: `DropdownMenu` trigger using `MoreVertical` icon button.

**Feature Logic & State:**
- Active tab navigation state (`activeTab`: `'overview' | 'content' | 'customize'`).
- Document selector state handling active cover letter instance.
- Download trigger: Initiates PDF compilation for cover letter layout.

**Hermes Action Items:**
1. Create `components/cover-letter/cover-letter-header.tsx` and `app/cover-letter/[id]/page.tsx`.
2. Integrate `shadcn/ui` `Select`, `Button`, `DropdownMenu`, and `Tabs`.
3. Wire active route state to render content view vs customize view.

### Task: Implement Cover Letter Navigation Card Stack

**UI Layout & Styling (shadcn/ui):**
- Container: Stacked column layout (`w-full max-w-xl mx-auto p-6 space-y-3.5`).
- Section Cards (`Card` component):
  - Card Styling: `bg-card hover:bg-muted/30 border border-border rounded-2xl p-5 shadow-sm transition-all cursor-pointer flex items-center justify-between group`.
  - Card Header Content:
    - Left Title Row: Flex row containing section title (`text-lg font-bold text-foreground`) and optional metadata badge (`text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-normal`).
    - Preview Text: Truncated summary line below heading (`text-sm text-muted-foreground mt-1 line-clamp-1 flex-1 pr-4`).
  - Right Action Trigger: `ChevronRight` icon (`size-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all`).

- **Defined Cards Stack:**
  1. **Sender details:** Sublabel badge "Modern header" • Preview: "Sina Kheiri • Front-end Developer".
  2. **Date:** Preview: "February 9, 2025".
  3. **Recipient details:** Preview: "Hr Manager • Eversports".
  4. **Subject:** Preview: "Not added" (`text-muted-foreground/60 italic`).
  5. **Body:** Sublabel badge "185 words" • Preview paragraph snippet.
  6. **Signature:** Preview: "Sina Kheiri".

**Feature Logic & State:**
- Active section editor state (`activeSection`: `'sender' | 'date' | 'recipient' | 'subject' | 'body' | 'signature' | null`).
- Clicking a card slides/transitions into the specialized form component for that specific section.
- Live word count calculation for the body section badge (`wordCount` derived state).

**Hermes Action Items:**
1. Create `components/cover-letter/cover-letter-section-card.tsx` and `components/cover-letter/cover-letter-section-list.tsx`.
2. Define section card data configuration array.
3. Handle active card selection to display corresponding input form.

### Task: Implement Meta & Contact Information Form Views

**UI Layout & Styling (shadcn/ui):**
- Layout Container: `Card` wrapper (`bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4`).

- **Form 1: Sender Details Form (`components/cover-letter/forms/sender-details-form.tsx`)**
  - Layout Style Switcher: Select header layout type ("Modern header", "Classic top", "Minimal sidebar").
  - Inputs: Full Name, Professional Title, Email, Phone, Address, Website, LinkedIn, GitHub (`Input` components with embedded `LinkPopover`).

- **Form 2: Date Picker Form (`components/cover-letter/forms/date-form.tsx`)**
  - Date Selection: `Popover` calendar picker or raw text input with date format choices ("February 9, 2025", "09/02/2025", "2025-02-09").

- **Form 3: Recipient Details Form (`components/cover-letter/forms/recipient-details-form.tsx`)**
  - Inputs:
    - "Recipient Name / Role" (e.g., "Hr Manager" or "Hiring Team").
    - "Company Name" (e.g., "Eversports").
    - "Department" (e.g., "Engineering Team").
    - "Address & City" (`Textarea` or stacked `Input` fields).

- **Form 4: Subject Line Form (`components/cover-letter/forms/subject-form.tsx`)**
  - Input: "Subject Line" (`Input` component, placeholder: "Application for Mid-level Frontend Engineer position").

- **Form 5: Signature Form (`components/cover-letter/forms/signature-form.tsx`)**
  - Signature Type Toggle: Text Name vs Upload Image Signature vs Handwritten Script Font.
  - Text Input: "Sign-off Name" (default: User Full Name).
  - Closing Salutation Select: "Sincerely,", "Best regards,", "Kind regards,".

**Feature Logic & State:**
- Zod schemas for cover letter metadata (`coverLetterMetaSchema`).
- Form updates emit live changes to `useCoverLetterStore` to sync with the right-side A4 cover letter canvas.

**Hermes Action Items:**
1. Create form files under `components/cover-letter/forms/`:
   - `sender-details-form.tsx`
   - `date-form.tsx`
   - `recipient-details-form.tsx`
   - `subject-form.tsx`
   - `signature-form.tsx`
2. Integrate `shadcn/ui` `Input`, `Textarea`, `Select`, `Popover`, and `Calendar`.

### Task: Implement Cover Letter Body Editor & AI Enhancement Toolbar

**UI Layout & Styling (shadcn/ui):**
- Container: `Card` container (`bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4`).
- Header Bar:
  - Title: "Body" (`text-xl font-bold text-foreground`).
  - Word Count Badge: `text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full`.
- Body Rich Text Editor: `RichTextEditor` component with Tiptap editor engine.
- AI Assistant Toolbar Container (`p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2`):
  - Prompt Action Chips:
    - "Tailor to Job Description" (`Wand2` icon)
    - "Improve Flow & Tone"
    - "Make More Professional"
    - "Shorten Letter"
  - Target Job Description Textarea: Collapsible input field allowing users to paste job descriptions for tailored generation.
- Sticky Bottom "Done" Bar: Gradient pill button (`bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold h-12 rounded-2xl shadow-md`).

**Feature Logic & State:**
- Live word count & reading time calculation (`text.split(/\s+/).filter(Boolean).length`).
- Real-time synchronization with the live PDF preview pane.
- AI Generation API Handler (`/api/ai/cover-letter`): Accepts current body text + job description to generate tailored cover letter paragraphs.

**Hermes Action Items:**
1. Create `components/cover-letter/forms/cover-letter-body-form.tsx`.
2. Connect `RichTextEditor` and `AiEnhancerChips` components.
3. Wire word counter engine and store updates.

### Task: Implement Cover Letter Customization Shell & Resume Design Sync

**UI Layout & Styling (shadcn/ui):**
- Container: Vertical scrolling column (`w-full max-w-xl mx-auto p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-4rem)]`).
- Top Quick Action Banner: Card container (`bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4`).
  - Text Content: Label "Sync Styles" (`text-sm font-bold text-foreground`), subtext "Match your cover letter design to your primary resume" (`text-xs text-muted-foreground`).
  - Button Action: "Copy resume design" (`Button` variant `outline` size `sm` `border-primary/30 text-primary hover:bg-primary/10 rounded-xl gap-2 font-medium shrink-0`).

**Feature Logic & State:**
- Single Zustand store for cover letter style configuration (`useCoverLetterStyleStore`).
- "Copy resume design" Action:
  1. Reads global active resume design state (`useResumeStyleStore`).
  2. Map-copies primary properties: `fontFamily`, `fontSize`, `primaryColor`, `accentColor`, `lineHeight`, `margins`, `paperSize`.
  3. Applies copied parameters directly into `useCoverLetterStyleStore` and shows a success toast notification (`toast.success("Design copied from resume!")`).

**Hermes Action Items:**
1. Create `components/cover-letter/customize/cover-letter-customize-tab.tsx` and `components/cover-letter/customize/copy-resume-design-button.tsx`.
2. Setup Zustand store `stores/use-cover-letter-style-store.ts`.
3. Wire the cross-store sync mechanism to import styles from `useResumeStyleStore`.

### Task: Implement Cover Letter Document Settings & Template Selector

**UI Layout & Styling (shadcn/ui):**
- **Document Settings Card (`Card` component):**
  - Section Title: "Document Settings" (`text-base font-bold text-foreground mb-3 flex items-center gap-2`).
  - Controls Grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`):
    - Language Selector: `Select` component (Options: "English (US)", "English (UK)", "German", "French").
    - Paper Format: `Select` component (Options: "A4", "US Letter").
  - Target Page Count Segmented Toggle (`ToggleGroup`): Options: "1 Page Limit", "Flexible Length".

- **Design Templates Card (`Card` component):**
  - Section Header Row: Title "Design Templates" alongside "Copy resume design" icon button.
  - Template Preview Carousel/Grid: Compact preview thumbnails showing cover letter template variants ("Modern", "Classic", "Minimal", "Sidebar").
  - Active Template Card State: `border-2 border-primary bg-primary/5 rounded-xl`.

**Feature Logic & State:**
- Selecting a template presets layout defaults (e.g. Header position, contact icon style).
- Paper format toggle dynamically resizes preview canvas dimensions.

**Hermes Action Items:**
1. Create `components/cover-letter/customize/cover-letter-doc-settings.tsx` and `components/cover-letter/customize/cover-letter-templates.tsx`.
2. Integrate `shadcn/ui` `Select`, `ToggleGroup`, `Card`, and `Button`.
3. Sync document format properties to live preview wrapper.

### Task: Implement Cover Letter Layout Structure & Header Formatting

**UI Layout & Styling (shadcn/ui):**
- **Layout Card (`Card` component):**
  - Header Position Options (`ToggleGroup`): "Top Position" vs "Left Sidebar Position".
  - Text Alignment Controls (`ToggleGroup` with alignment icons): "Left", "Right", "Justify".
  - Margin Presets: "Compact" (10mm), "Normal" (15mm), "Wide" (20mm).

- **Header Customization Card (`Card` component):**
  - Text Alignment: "Left", "Center", "Right".
  - Address Arrangement: "Single Line (Inline)", "Multi-line (Stacked)".
  - Date Position & Format: Select dropdown for date display formats ("February 9, 2025", "09/02/2025").
  - Icon Style Selector: "Minimal Icons", "Circle Filled", "Outline", "No Icons".

- **Photo Settings Card (`Card` component):**
  - Visibility Toggle Switch: `Switch` component labeled "Show Profile Photo".
  - Photo Properties (When Enabled): Shape picker ("Circle", "Rounded", "Square"), size slider.

**Feature Logic & State:**
- Conditional rendering: Hides Photo controls if no user image is uploaded in sender details.
- Header position switch toggles CSS flex-direction of the rendered document header container (`flex-col` vs `flex-row`).

**Hermes Action Items:**
1. Create `components/cover-letter/customize/cover-letter-layout-settings.tsx` and `components/cover-letter/customize/cover-letter-header-settings.tsx`.
2. Integrate `shadcn/ui` `ToggleGroup`, `Select`, `Switch`, `Slider`, and `Label`.
3. Apply structural layout class overrides to the cover letter preview renderer.

### Task: Implement Cover Letter Typography, Spacing, Color & Link Controls

**UI Layout & Styling (shadcn/ui):**
- **Font Size Card (`Card` component):**
  - Controls (`Slider` components with numerical indicator pills):
    - General Font Size: Range `8pt` to `13pt` (default `10pt`).
    - Professional Title Size: Scale `1.0x` to `1.8x`.
    - Text Size: Scale `0.9x` to `1.2x`.

- **Spacing Card (`Card` component):**
  - Controls (`Slider` components):
    - Line Height: Compact (1.1) to Relaxed (1.6).
    - Paragraph Margin: Gap between body paragraphs (`6px` to `24px`).
    - Top/Bottom Page Margins: `10mm` to `30mm`.

- **Font Family Card (`Card` component):**
  - Dropdowns: "Body Font" and "Header Font" (`Select` component with system & Google font choices).
  - Checkbox Group: "Bold Recipient Details", "Italics Salutation".

- **Color Card (`Card` component):**
  - Target Selectors: "Background", "Accent / Headings", "Body Text".
  - Color Swatches Grid: Circle palette buttons with hex picker popover.

- **Link & Footer Styling Card (`Card` component):**
  - Link Display Options: Checkbox for "Underline Links", "Use Accent Color for Links".
  - Footer Options: Show Page Number (`Switch`), Footer layout alignment ("Left", "Center", "Right").

**Feature Logic & State:**
- Real-time CSS property injection for body text font sizing, paragraph gaps, and line spacing.
- Footer configuration toggles page count rendering at the bottom of the rendered cover letter canvas.

**Hermes Action Items:**
1. Create `components/cover-letter/customize/cover-letter-typography-settings.tsx` and `components/cover-letter/customize/cover-letter-color-settings.tsx`.
2. Integrate `shadcn/ui` `Slider`, `Select`, `Checkbox`, `Switch`, and `Popover`.
3. Bind all fields to `useCoverLetterStyleStore` for dynamic preview re-rendering.

