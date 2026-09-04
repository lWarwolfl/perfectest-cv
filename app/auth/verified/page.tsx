import { AuthBrand } from '@/features/auth/components/auth-brand'

export default function VerifiedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <AuthBrand />
        <div className="bg-card rounded-xl border p-6 text-center">
          <p className="text-lg font-semibold">Email verified</p>
          <p className="text-muted-foreground mt-1 text-sm">You can sign in now</p>
        </div>
      </div>
    </main>
  )
}
