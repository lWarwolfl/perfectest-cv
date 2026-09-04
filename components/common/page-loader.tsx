import { Spinner } from '@/components/ui/spinner'

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-3">
      <Spinner className="size-8" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  )
}
