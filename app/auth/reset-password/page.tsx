import { ResetPasswordPageClient } from '@/features/auth/components/reset-password-page.client'
import { Suspense } from 'react'

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense>
        <ResetPasswordPageClient />
      </Suspense>
    </main>
  )
}
