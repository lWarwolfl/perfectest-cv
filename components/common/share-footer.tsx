'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function ShareFooter() {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')
  useEffect(() => setUrl(window.location.href), [])
  return (
    <div className="flex w-full max-w-[794px] items-center justify-between gap-3 py-4 text-sm text-muted-foreground">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 transition-colors hover:bg-accent"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <span className="min-w-0 truncate">{url}</span>
      </div>
      <span>
        Made with{' '}
        <Link href="/" className="font-medium text-foreground hover:underline">
          Perfectest CV
        </Link>
      </span>
    </div>
  )
}
