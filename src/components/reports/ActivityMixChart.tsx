import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAppSelector } from '@/app/hooks'
import { selectActivityMix } from '@/features/workspace/reportSelectors'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { cn } from '@/lib/cn'

export function ActivityMixChart({ className }: { className?: string }) {
  const mix = useAppSelector(selectActivityMix)
  const animate = useChartAnimation()
  const data = mix.filter((item) => item.value > 0)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Activity mix" description="Calls, emails, meetings, and follow-ups you logged." />
      <div className="flex flex-1 flex-col items-center gap-5 sm:flex-row 2xl:flex-col">
        <div className="relative aspect-square w-full max-w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={3} cornerRadius={6} stroke="none" isAnimationActive={animate} animationDuration={1000}>
                {data.map((item) => (
                  <Cell key={item.type} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatValue={(value) => `${value} logged`} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold text-ink tabular-nums">{total}</span>
            <span className="text-xs text-ink-subtle">Activities</span>
          </div>
        </div>
        <ul className="grid w-full grid-cols-2 gap-2">
          {mix.map((item) => (
            <li
              key={item.type}
              className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-canvas/80 px-2.5 py-2 text-sm transition-colors hover:bg-brand-soft/60 [&:last-child:nth-child(odd)]:col-span-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-ink-muted">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 font-semibold text-ink tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
