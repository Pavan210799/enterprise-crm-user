import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/70 px-6 py-14 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[var(--shadow-glow)]">
        <Icon className="size-7" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
