import { Link } from 'react-router-dom'
import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/cn'

type StatCardProps = {
  label: string
  value: number
  format: (value: number) => string
  change: number
  icon: LucideIcon
  color: string
  gradient: string
  to: string
  improveWhen?: 'up' | 'down'
}

export function StatCard({ label, value, format, change, icon: Icon, color, gradient, to, improveWhen = 'up' }: StatCardProps) {
  const animated = useCountUp(value)
  const good = improveWhen === 'down' ? change <= 0 : change >= 0

  return (
    <Link to={to} className="block min-w-0">
      <article className="group card-hover shine relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-border/80 bg-surface p-4 shadow-[var(--shadow-card)] sm:gap-4 sm:p-5">
        <div className="absolute -top-12 -right-12 size-32 rounded-full opacity-[0.12] blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-25" style={{ backgroundColor: color }} aria-hidden />
        <div className="relative min-w-0 flex-1">
          <p className="text-sm leading-snug font-medium text-ink-muted">{label}</p>
          <p className="mt-1.5 truncate font-display text-2xl leading-tight font-bold tracking-tight text-ink tabular-nums sm:text-3xl">{format(animated)}</p>
          <span
            title="Compared with last month"
            className={cn(
              'mt-3 inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
              good ? 'bg-success-soft text-emerald-700' : 'bg-danger-soft text-red-700',
            )}
          >
            {change >= 0 ? <TrendingUp className="size-3.5 shrink-0" /> : <TrendingDown className="size-3.5 shrink-0" />}
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        </div>
        <span className={cn('relative grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg] sm:size-16', gradient)}>
          <Icon className="size-7 sm:size-8" aria-hidden />
        </span>
      </article>
    </Link>
  )
}
