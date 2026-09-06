'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import logo from '@public/logo.svg'
import { Button } from '@/components/ui/button'
import { MonitorDown } from 'lucide-react'

export function ScreenGate({
  overviewHref,
  onDownload,
}: {
  overviewHref: string
  onDownload: () => void
}) {
  const [tooSmall, setTooSmall] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const update = () => setTooSmall(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (!tooSmall) return null

  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
      <div className="border-border bg-card w-full max-w-sm rounded-2xl border p-6 text-center shadow-lg">
        <div className="bg-primary/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
          <MonitorDown className="text-primary size-7" />
        </div>
        <h2 className="text-lg font-semibold">A larger screen is needed</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          The editor needs at least 1024px of width to show the document and its controls side by
          side.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onDownload}>Download PDF</Button>
          <Button variant="outline" render={<Link href={overviewHref} />}>
            Back to documents
          </Button>
        </div>
      </div>
    </div>
  )
}

export function EditorLogo() {
  return <Image alt="Perfectest CV logo" src={logo} className="size-9 max-md:hidden" />
}
