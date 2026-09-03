'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Underline as UnderlineIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import AiEnhancerChips from './ai-enhancer-chips'

interface RichTextEditorProps {
  onUpdate: (content: string) => void
  value?: string
}

const ACTIVE_CLASSES = 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'

export default function RichTextEditor({
  onUpdate,
  value = '',
}: RichTextEditorProps) {
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

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/30 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
      <div className="flex h-10 items-center gap-1 overflow-x-auto border-b border-border/60 bg-muted/50 px-3">
        <Button variant="outline" size="icon" onClick={toggleBold} className={boldActive ? ACTIVE_CLASSES : ''}>
          <Bold className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleItalic} className={italicActive ? ACTIVE_CLASSES : ''}>
          <Italic className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleUnderline} className={underlineActive ? ACTIVE_CLASSES : ''}>
          <UnderlineIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleBulletList}
          className={bulletListActive ? ACTIVE_CLASSES : ''}
        >
          <List className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleLink} className={linkActive ? ACTIVE_CLASSES : ''}>
          <LinkIcon className="size-4" />
        </Button>
        <div className="flex flex-1 items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTextAlign('left')}
            className={alignActive('left') ? ACTIVE_CLASSES : ''}
          >
            <AlignLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTextAlign('center')}
            className={alignActive('center') ? ACTIVE_CLASSES : ''}
          >
            <AlignCenter className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTextAlign('right')}
            className={alignActive('right') ? ACTIVE_CLASSES : ''}
          >
            <AlignRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTextAlign('justify')}
            className={alignActive('justify') ? ACTIVE_CLASSES : ''}
          >
            <AlignJustify className="size-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-[120px] bg-transparent p-3 text-sm text-foreground focus:outline-none [&_.ProseMirror]:outline-none">
        <EditorContent editor={editor} />
      </div>
      <AiEnhancerChips onUpdate={onUpdate} editor={editor} />
    </div>
  )
}
