'use client'

import * as React from 'react'
import type { Editor } from '@tiptap/react'
import { Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AiEnhancerChipsProps {
  onUpdate: (content: string) => void
  editor: Editor
}

const AI_ACTIONS = ['Improve Writing', 'Suggest Content', 'Grammar Check', 'Shorter']

function simulateAiEnhance(text: string, action: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = text
      if (action === 'Improve Writing') result = `[Improved] ${text}`
      if (action === 'Suggest Content') result = `${text}\n\n[Suggested addition: ...]`
      if (action === 'Grammar Check') result = `[Grammar checked] ${text}`
      if (action === 'Shorter') result = text.length > 50 ? `${text.substring(0, 50)}...` : text
      resolve(result)
    }, 1000)
  })
}

export default function AiEnhancerChips({ onUpdate, editor }: AiEnhancerChipsProps) {
  const [loading, setLoading] = React.useState<Record<string, boolean>>({})

  const handleAiAction = async (action: string) => {
    setLoading((prev) => ({ ...prev, [action]: true }))
    try {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, ' ')
      const fullText = editor.getHTML()
      const enhancedText = await simulateAiEnhance(selectedText || fullText, action)

      if (selectedText) {
        editor.chain().focus().insertContent(enhancedText).run()
      } else {
        editor.chain().focus().clearContent().insertContent(enhancedText).run()
      }

      onUpdate(editor.getHTML())
    } catch (error) {
      console.error('AI enhancement failed:', error)
    } finally {
      setLoading((prev) => ({ ...prev, [action]: false }))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border/40 bg-muted/20 p-2.5">
      <span className="text-indigo-500">
        <Wand2 className="size-4" />
      </span>
      <div className="flex flex-wrap gap-2">
        {AI_ACTIONS.map((action) => (
          <Button
            key={action}
            variant="secondary"
            size="sm"
            onClick={() => handleAiAction(action)}
            className={loading[action] ? 'opacity-50' : ''}
            disabled={loading[action]}
          >
            {action}
          </Button>
        ))}
      </div>
    </div>
  )
}
