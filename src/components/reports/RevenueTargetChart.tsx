import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS, axisProps } from '@/components/charts/chartTheme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { PerformanceMonth } from '@/types'

export function RevenueTargetChart({ data, className }: { data: PerformanceMonth[]; className?: string }) {
  const animate = useChartAnimation()

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Revenue vs target"
        description="Closed revenue each month against your quota."
        action={
          <div className="flex items-center gap-4 pt-1 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-linear-to-b from-brand to-orchid" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-aurora" /> Target
            </span>
          </div>
        }
      />
      <div className="min-h-64 w-full min-w-0 flex-1 sm:min-h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart key={data.length} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.brand} />
                <stop offset="100%" stopColor={CHART_COLORS.orchid} stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps} width={52} tickFormatter={(value: number) => formatCompactCurrency(value)} />
            <Tooltip cursor={{ fill: 'rgb(124 58 237 / 0.06)' }} content={<ChartTooltip formatValue={(value) => formatCompactCurrency(value)} />} />
            <Bar dataKey="revenue" name="Revenue" fill="url(#reportRevenueFill)" radius={[8, 8, 3, 3]} maxBarSize={30} isAnimationActive={animate} animationDuration={900} />
            <Line type="monotone" dataKey="target" name="Target" stroke={CHART_COLORS.aurora} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={animate} animationDuration={1100} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
