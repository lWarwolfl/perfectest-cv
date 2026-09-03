'use client'

import { useSignOut } from '@/features/auth/hooks/auth.hooks'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const signOut = useSignOut()
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
      Sign out
    </Button>
  )
}