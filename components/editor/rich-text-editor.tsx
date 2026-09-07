'use client'

import { useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Loader2,
  Sparkles,
  Underline as UnderlineIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getAiSettingsAction, aiTransformAction } from '@/server/ai/ai.actions'
import { getErrorMessage } from '@/lib/utils'

interface RichTextEditorProps {
  onUpdate: (content: string) => void
  value?: string
  compact?: boolean
}

const ACTIVE_CLASSES = 'bg-primary text-primary-foreground'

const AI_LANGUAGES = ['English', 'Persian (فارسی)', 'German', 'French', 'Spanish', 'Arabic', 'Turkish']

const AI_ACTIONS = [
  { feature: 'improve', label: 'Improve writing' },
  { feature: 'grammar', label: 'Fix spelling & grammar' },
  { feature: 'summary', label: 'Generate summary' },
] as const

export default function RichTextEditor({
  onUpdate,
  value = '',
  compact = false,
}: RichTextEditorProps) {
  const [aiOpen, setAiOpen] = useState(false)
  const [aiBusy, setAiBusy] = useState<string | null>(null)
  const [aiLang, setAiLang] = useState(AI_LANGUAGES[0])
  const { data: aiSettings } = useQuery({
    queryKey: ['ai-settings-editor'],
    queryFn: getAiSettingsAction,
    staleTime: 60_000,
  })
  const aiReady = !!(aiSettings?.baseUrl && aiSettings?.apiKey && aiSettings?.model)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editable: true,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
  })

  if (!editor) return null

  const boldActive = editor.isActive('bold')
  const italicActive = editor.isActive('italic')
  const underlineActive = editor.isActive('underline')
  const bulletListActive = editor.isActive('bulletList')
  const linkActive = editor.isActive('link')
  const alignActive = (align: string) => editor.isActive('textAlign', { align })

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleLink = () => {
    if (linkActive) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Link URL')
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }
  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run()
  }
  const runAi = async (feature: 'improve' | 'grammar' | 'summary' | 'translate') => {
    const text = editor.getText().trim()
    if (!text) {
      toast.error('Nothing to work with — write some content first')
      return
    }
    setAiBusy(feature)
    try {
      const html = await aiTransformAction({
        feature,
        text,
        ...(feature === 'translate' ? { language: aiLang } : {}),
      })
      editor.commands.setContent(html)
      onUpdate(html)
      toast.success('AI suggestion applied')
      setAiOpen(false)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setAiBusy(null)
    }
  }

  return (
    <div className="border-input focus-within:border-ring focus-within:ring-ring/50 overflow-hidden rounded-lg border bg-transparent transition-colors focus-within:ring-3">
      <div className="border-border/60 bg-muted/50 flex min-h-12 flex-wrap items-center gap-1 border-b px-3 py-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleBold}
          className={boldActive ? ACTIVE_CLASSES : ''}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleItalic}
          className={italicActive ? ACTIVE_CLASSES : ''}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleUnderline}
          className={underlineActive ? ACTIVE_CLASSES : ''}
        >
          <UnderlineIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleBulletList}
          className={bulletListActive ? ACTIVE_CLASSES : ''}
        >
          <List className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleLink}
          className={linkActive ? ACTIVE_CLASSES : ''}
        >
          <LinkIcon className="size-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTextAlign('left')}
            className={alignActive('left') ? ACTIVE_CLASSES : ''}
          >
            <AlignLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTextAlign('center')}
            className={alignActive('center') ? ACTIVE_CLASSES : ''}
          >
            <AlignCenter className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTextAlign('right')}
            className={alignActive('right') ? ACTIVE_CLASSES : ''}
          >
            <AlignRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTextAlign('justify')}
            className={alignActive('justify') ? ACTIVE_CLASSES : ''}
          >
            <AlignJustify className="size-4" />
          </Button>
        </div>
        {aiReady && (
          <Popover open={aiOpen} onOpenChange={setAiOpen}>
            <PopoverTrigger
              render={
                <Button variant="outline" size="sm" className="ml-auto" title="AI suggestions">
                  {aiBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  AI
                </Button>
              }
            />
            <PopoverContent className="w-56 p-1" align="end">
              {AI_ACTIONS.map((a) => (
                <button
                  key={a.feature}
                  type="button"
                  disabled={!!aiBusy}
                  className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm disabled:opacity-50"
                  onClick={() => runAi(a.feature)}
                >
                  {aiBusy === a.feature ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {a.label}
                </button>
              ))}
              <div className="bg-border my-1 h-px" />
              <div className="flex items-center gap-1 px-1 py-1">
                <select
                  aria-label="Translate to"
                  className="border-input h-7 min-w-0 flex-1 rounded-md border bg-transparent px-1.5 text-xs"
                  value={aiLang}
                  onChange={(e) => setAiLang(e.target.value)}
                >
                  {AI_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="xs" disabled={!!aiBusy} onClick={() => runAi('translate')}>
                  {aiBusy === 'translate' ? <Loader2 className="size-3 animate-spin" /> : null}
                  Translate
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div
        className={`text-foreground resume-prose min-h-[140px] bg-transparent p-3 text-sm focus:outline-none [&_.ProseMirror]:outline-none ${compact ? '[&_.ProseMirror]:min-h-[64px]' : ''}`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
