import { AuthBrand } from '@/features/auth/components/auth-brand'

export default function VerifiedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <AuthBrand />
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-lg font-semibold">Email verified</p>
          <p className="mt-1 text-sm text-muted-foreground">You can sign in now</p>
        </div>
      </div>
    </main>
  )
}
