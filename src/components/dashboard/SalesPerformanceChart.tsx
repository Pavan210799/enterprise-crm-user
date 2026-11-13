import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppSelector } from '@/app/hooks'
import { selectPerformance } from '@/features/workspace/workspaceSelectors'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { RangeToggle } from '@/components/charts/RangeToggle'
import { CHART_COLORS, axisProps } from '@/components/charts/chartTheme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

const RANGES = [
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
] as const

export function SalesPerformanceChart({ className }: { className?: string }) {
  const [range, setRange] = useState<6 | 12>(6)
  const data = useAppSelector(selectPerformance).slice(-range)
  const animate = useChartAnimation()
  const total = data.reduce((sum, point) => sum + point.revenue, 0)
  const target = data.reduce((sum, point) => sum + point.target, 0)
  const delta = target ? Math.round(((total - target) / target) * 100) : 0

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Personal sales performance"
        description="Closed revenue against your target."
        action={<RangeToggle options={RANGES} value={range} onChange={setRange} />}
      />
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{formatCompactCurrency(total)}</p>
          <p className="text-xs text-ink-subtle">Revenue, last {range} months</p>
        </div>
        <span className={cn('mb-1 rounded-full px-2 py-0.5 text-xs font-semibold', delta >= 0 ? 'bg-success-soft text-emerald-700' : 'bg-danger-soft text-red-700')}>
          {delta >= 0 ? '+' : ''}
          {delta}% vs target
        </span>
        <div className="mb-1 flex items-center gap-4 text-xs text-ink-muted sm:ml-auto">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full bg-brand" /> Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-aurora" /> Target
          </span>
        </div>
      </div>
      <div className="min-h-64 w-full min-w-0 flex-1 sm:min-h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={range} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps} width={48} tickFormatter={(value: number) => formatCompactCurrency(value)} />
            <Tooltip content={<ChartTooltip formatValue={(value) => formatCompactCurrency(value)} />} />
            <Area type="monotone" dataKey="target" name="Target" stroke={CHART_COLORS.aurora} strokeDasharray="5 5" fill="none" strokeWidth={2} isAnimationActive={animate} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.brand} fill="url(#revenueFill)" strokeWidth={2.5} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={animate} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
