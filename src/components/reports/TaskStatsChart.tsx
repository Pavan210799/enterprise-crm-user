import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppSelector } from '@/app/hooks'
import { selectTaskStats } from '@/features/workspace/reportSelectors'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS, axisProps } from '@/components/charts/chartTheme'
import { cn } from '@/lib/cn'

export function TaskStatsChart({ className }: { className?: string }) {
  const stats = useAppSelector(selectTaskStats)
  const animate = useChartAnimation()
  const tiles = [
    { label: 'Completed', value: stats.completed, tone: 'text-emerald-700' },
    { label: 'Open', value: stats.open, tone: 'text-brand' },
    { label: 'In progress', value: stats.inProgress, tone: 'text-aurora-deep' },
    { label: 'Overdue', value: stats.overdue, tone: stats.overdue ? 'text-danger' : 'text-ink' },
  ]

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Task statistics" description={`${stats.completionRate}% of ${stats.total} tasks completed.`} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="min-w-0 rounded-xl bg-canvas/80 px-3 py-2 transition-colors hover:bg-brand-soft/60">
            <p className={cn('font-display text-lg font-bold tabular-nums', tile.tone)}>{tile.value}</p>
            <p className="truncate text-[11px] font-medium text-ink-subtle">{tile.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 min-h-52 w-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.byPriority} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={28} allowDecimals={false} />
            <Tooltip cursor={{ fill: 'rgb(124 58 237 / 0.06)' }} content={<ChartTooltip />} />
            <Bar dataKey="completed" name="Completed" stackId="tasks" fill={CHART_COLORS.success} isAnimationActive={animate} animationDuration={900} />
            <Bar dataKey="open" name="Open" stackId="tasks" fill={CHART_COLORS.brand} radius={[6, 6, 0, 0]} isAnimationActive={animate} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand" /> Open
        </span>
      </div>
    </Card>
  )
}
