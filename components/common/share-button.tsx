'use client'

import { useState } from 'react'
import { Link2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ShareResult = { live: boolean; token: string | null } | undefined

export function ShareButton({ live, kind, pending, onToggle }: {
  live: boolean
  kind: 'resume' | 'letter'
  pending: boolean
  onToggle: (live: boolean) => Promise<ShareResult>
}) {
  const label = kind === 'resume' ? 'resume' : 'cover letter'
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function toggle(next: boolean) {
    setConfirmOpen(false)
    try {
      const res = await onToggle(next)
      if (res?.live && res.token) {
        setUrl(`${window.location.origin}/share/${kind}/${res.token}`)
        setCopied(false)
      }
    } catch {
      // error toast already shown by the mutation hook
    }
  }

  function copy() {
    if (!url) return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard')
    }).catch(() => toast.error(url))
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={pending}>
        <Link2 className="size-3.5" />
        Share
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        pending={pending}
        title={live ? `Update ${label} share URL?` : `Enable ${label} sharing?`}
        description={
          live
            ? 'The current link will stop working and a new URL will be generated.'
            : `A public URL will be generated. Anyone with the link can view this ${label}.`
        }
        confirmLabel={live ? 'Update URL' : 'Create link'}
        onConfirm={() => toggle(true)}
      />
      <Dialog open={!!url} onOpenChange={(open) => !open && setUrl(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share URL</DialogTitle>
            <DialogDescription>Anyone with this link can view your {label}.</DialogDescription>
          </DialogHeader>
          <Input readOnly value={url || ''} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
          <DialogFooter>
            <Button variant="outline" className="text-destructive" disabled={pending} onClick={() => toggle(false)}>
              Disable link
            </Button>
            <Button onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
