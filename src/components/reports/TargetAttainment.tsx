import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import { Award, CalendarCheck, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { PerformanceMonth } from '@/types'

export function TargetAttainment({ data, className }: { data: PerformanceMonth[]; className?: string }) {
  const revenue = data.reduce((sum, point) => sum + point.revenue, 0)
  const target = data.reduce((sum, point) => sum + point.target, 0)
  const attainment = target ? Math.round((revenue / target) * 100) : 0
  const best = data.reduce<PerformanceMonth | undefined>((top, point) => (!top || point.revenue > top.revenue ? point : top), undefined)
  const hit = data.filter((point) => point.revenue >= point.target).length
  const average = data.length ? revenue / data.length : 0
  const animate = useChartAnimation()

  const rows = [
    { icon: Award, label: 'Best month', value: best ? `${best.month} · ${formatCompactCurrency(best.revenue)}` : '—' },
    { icon: TrendingUp, label: 'Monthly average', value: formatCompactCurrency(average) },
    { icon: CalendarCheck, label: 'Months on target', value: `${hit} of ${data.length}` },
  ]

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Target attainment" description={`${formatCompactCurrency(revenue)} of ${formatCompactCurrency(target)} quota.`} />
      <div className="relative mx-auto aspect-square w-full max-w-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={[{ name: 'Attainment', value: Math.min(attainment, 100) }]} innerRadius="78%" outerRadius="100%" startAngle={90} endAngle={-270}>
            <defs>
              <linearGradient id="attainmentFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.aurora} />
                <stop offset="100%" stopColor={CHART_COLORS.brand} />
              </linearGradient>
            </defs>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={999} fill="url(#attainmentFill)" background={{ fill: '#EEF1FB' }} isAnimationActive={animate} animationDuration={1100} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink tabular-nums">{attainment}%</span>
          <span className="text-xs font-medium text-ink-subtle">of target</span>
        </div>
      </div>
      <ul className="mt-5 space-y-2 border-t border-border/60 pt-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-canvas/80 px-3 py-2 transition-colors hover:bg-brand-soft/60">
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink-muted">
              <Icon className="size-4 shrink-0 text-brand" aria-hidden />
              <span className="truncate">{label}</span>
            </span>
            <span className="shrink-0 text-xs font-bold text-ink tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
