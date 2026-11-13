import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type StatTone = 'brand' | 'aurora' | 'orchid' | 'success' | 'warning' | 'danger'

const tones: Record<StatTone, string> = {
  brand: 'from-brand to-violet-400 shadow-[0_10px_24px_-10px_rgb(124_58_237_/_0.8)]',
  aurora: 'from-aurora-deep to-aurora shadow-[0_10px_24px_-10px_rgb(8_145_178_/_0.8)]',
  orchid: 'from-orchid to-fuchsia-400 shadow-[0_10px_24px_-10px_rgb(192_38_211_/_0.8)]',
  success: 'from-emerald-600 to-success shadow-[0_10px_24px_-10px_rgb(16_185_129_/_0.8)]',
  warning: 'from-amber-500 to-warning shadow-[0_10px_24px_-10px_rgb(245_158_11_/_0.8)]',
  danger: 'from-red-600 to-danger shadow-[0_10px_24px_-10px_rgb(239_68_68_/_0.8)]',
}

export function StatTile({
  icon: Icon,
  label,
  value,
  tone = 'brand',
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tone?: StatTone
  hint?: string
}) {
  return (
    <div className="group card-hover flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-surface p-3.5 shadow-[var(--shadow-card)] sm:p-4">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white transition-transform duration-300 group-hover:scale-110 sm:size-11', tones[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs leading-snug font-semibold text-ink-subtle">{label}</p>
        <p className="truncate font-display text-lg font-bold text-ink tabular-nums sm:text-xl">{value}</p>
        {hint ? <p className="line-clamp-2 text-[11px] leading-snug text-ink-muted">{hint}</p> : null}
      </div>
    </div>
  )
}
