'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthBrand } from '@/features/auth/components/auth-brand'
import { useResendVerification } from '@/features/auth/hooks/auth.hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function VerifyEmailPageClient() {
  const resend = useResendVerification()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setSent(false), 30000)
      return () => clearTimeout(t)
    }
  }, [sent])

  return (
    <div className="w-full max-w-sm space-y-6">
      <AuthBrand />
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-lg font-semibold">Verify your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a verification link to your inbox. Click it to activate your account.
        </p>
        <div className="mt-5 space-y-3 text-left">
          <Label htmlFor="email">Didn&apos;t get it? Resend to</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-0"
          />
          <Button
            className="w-full"
            disabled={resend.isPending || sent || !email}
            onClick={() =>
              resend.mutate({ email }, { onSuccess: () => setSent(true) })
            }
          >
            {sent ? 'Sent, check your inbox' : resend.isPending ? 'Sending…' : 'Resend verification email'}
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
