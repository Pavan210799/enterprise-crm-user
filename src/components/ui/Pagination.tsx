import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

const navBtn =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-ink-muted transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-40'

export function Pagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  label = 'results',
}: {
  page: number
  totalPages: number
  totalItems: number
  rangeStart: number
  rangeEnd: number
  onPageChange: (page: number) => void
  label?: string
}) {
  if (totalItems === 0 || totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-ink-muted tabular-nums">
        Showing <span className="font-semibold text-ink">{rangeStart}</span>–<span className="font-semibold text-ink">{rangeEnd}</span> of{' '}
        <span className="font-semibold text-ink">{totalItems}</span> {label}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={navBtn} disabled={page <= 1} aria-label="Previous page" onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </button>
        <span className={cn('min-w-24 text-center text-sm font-semibold text-ink tabular-nums')}>
          Page {page} of {totalPages}
        </span>
        <button type="button" className={navBtn} disabled={page >= totalPages} aria-label="Next page" onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
