import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />
}

export function AuthSkeleton() {
  return (
    <div role="status" aria-label="Loading page">
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-[0_30px_80px_-30px_rgb(45_20_82_/_0.35)] sm:p-8">
        <Skeleton className="h-8 w-48 max-w-full" />
        <Skeleton className="mt-3 h-3.5 w-64 max-w-full" />
        <div className="mt-7 space-y-5">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="mx-auto mt-6 h-4 w-56 max-w-full" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-5">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
