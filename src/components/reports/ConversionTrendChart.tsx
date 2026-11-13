import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS, axisProps } from '@/components/charts/chartTheme'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { cn } from '@/lib/cn'
import type { PerformanceMonth } from '@/types'

export function ConversionTrendChart({ data, className }: { data: PerformanceMonth[]; className?: string }) {
  const leads = data.reduce((sum, point) => sum + point.leads, 0)
  const converted = data.reduce((sum, point) => sum + point.converted, 0)
  const rate = leads ? Math.round((converted / leads) * 100) : 0
  const animate = useChartAnimation()

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Lead conversion trend" description="New leads you worked against leads that converted." />
      <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{rate}%</p>
          <p className="text-xs text-ink-subtle">
            {converted} of {leads} leads converted
          </p>
        </div>
        <div className="mb-1 flex items-center gap-4 text-xs text-ink-muted sm:ml-auto">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full bg-aurora-deep" /> New leads
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full bg-orchid" /> Converted
          </span>
        </div>
      </div>
      <div className="min-h-60 w-full min-w-0 flex-1 sm:min-h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={data.length} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendLeadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.aurora} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.aurora} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="trendConvertedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.orchid} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLORS.orchid} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" {...axisProps} interval="preserveStartEnd" minTickGap={8} />
            <YAxis {...axisProps} width={32} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="leads" name="New leads" stroke={CHART_COLORS.auroraDeep} strokeWidth={2.5} fill="url(#trendLeadsFill)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={animate} />
            <Area type="monotone" dataKey="converted" name="Converted" stroke={CHART_COLORS.orchid} strokeWidth={2.5} fill="url(#trendConvertedFill)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={animate} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
