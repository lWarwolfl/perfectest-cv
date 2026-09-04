import { Suspense } from 'react'
import { ResetPasswordPageClient } from '@/features/auth/components/reset-password-page.client'

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-background p-4">
      <Suspense>
        <ResetPasswordPageClient />
        </Suspense>
    </main>
  )
}
