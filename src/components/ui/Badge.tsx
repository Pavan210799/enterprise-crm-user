import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeVariant = 'default' | 'brand' | 'aurora' | 'success' | 'warning' | 'danger' | 'muted'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-canvas-muted text-ink-muted ring-border',
  brand: 'bg-brand-soft text-brand ring-brand/20',
  aurora: 'bg-aurora-soft text-aurora-deep ring-aurora/25',
  success: 'bg-success-soft text-emerald-800 ring-success/25',
  warning: 'bg-warning-soft text-amber-900 ring-warning/25',
  danger: 'bg-danger-soft text-red-800 ring-danger/20',
  muted: 'bg-surface text-ink-subtle ring-border',
}

const dots: Record<BadgeVariant, string> = {
  default: 'bg-ink-subtle',
  brand: 'bg-brand',
  aurora: 'bg-aurora-deep',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  muted: 'bg-ink-subtle',
}

export function Badge({ children, variant = 'default', dot = false, className }: { children: ReactNode; variant?: BadgeVariant; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex max-w-full shrink-0 items-center gap-1.5 truncate rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset', variants[variant], className)}>
      {dot ? <span className={cn('size-1.5 shrink-0 rounded-full', dots[variant])} aria-hidden /> : null}
      {children}
    </span>
  )
}
