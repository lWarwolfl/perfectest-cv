'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import logo from '@public/logo.svg'

export function ShareFooter() {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')
  useEffect(() => setUrl(window.location.href), [])
  return (
    <div className="text-muted-foreground flex w-full max-w-[794px] items-center justify-between gap-3 py-4 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="border-border bg-card hover:bg-accent flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 transition-colors"
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
      <span className="flex shrink-0 items-center gap-1.5">
        <Image alt="Perfectest CV logo" src={logo} className="size-5" />
        Made with{' '}
        <Link href="/" className="text-foreground font-medium hover:underline">
          Perfectest CV
        </Link>
      </span>
    </div>
  )
}
