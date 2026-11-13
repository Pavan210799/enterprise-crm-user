import { useAppSelector } from '@/app/hooks'
import { selectConversionFunnel, selectLeadRates } from '@/features/workspace/reportSelectors'
import { Card, CardHeader } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

export function ConversionFunnel({ className }: { className?: string }) {
  const funnel = useAppSelector(selectConversionFunnel)
  const rates = useAppSelector(selectLeadRates)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Conversion funnel" description="How far your current leads have progressed." />
      <ul className="space-y-3">
        {funnel.map((step, index) => (
          <li key={step.status} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-ink">{step.label}</span>
              <span className="text-ink-muted tabular-nums">
                <span className="font-semibold text-ink">{step.count}</span> · {step.pct}%
              </span>
            </div>
            <div className="flex h-8 justify-center overflow-hidden rounded-lg bg-canvas">
              <div
                className="h-full origin-center animate-grow-x rounded-lg transition-[filter] duration-300 group-hover:brightness-110"
                style={{ width: `${Math.max(6, step.pct)}%`, background: `linear-gradient(90deg, ${step.color}cc, ${step.color})`, animationDelay: `${index * 100}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
        <Metric label="Won" value={rates.won} />
        <Metric label="Lost" value={rates.lost} />
        <Metric label="Close rate" value={`${rates.closeRate}%`} />
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-xl bg-canvas/80 px-2 py-2 transition-colors hover:bg-brand-soft/60">
      <p className="font-display text-lg font-bold text-ink tabular-nums">{value}</p>
      <p className="truncate text-[11px] font-medium text-ink-subtle">{label}</p>
    </div>
  )
}
