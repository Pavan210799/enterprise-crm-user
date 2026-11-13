import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAppSelector } from '@/app/hooks'
import { selectLeadSources } from '@/features/workspace/reportSelectors'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { CHART_COLORS, axisProps } from '@/components/charts/chartTheme'
import { cn } from '@/lib/cn'

function describeLeaders(sources: { source: string; leads: number }[]) {
  const most = sources[0]?.leads ?? 0
  if (!most) return 'Where your leads come from.'
  const leaders = sources.filter((item) => item.leads === most).map((item) => item.source)
  if (leaders.length === 1) return `${leaders[0]} brings in the most leads.`
  return `${new Intl.ListFormat('en-US').format(leaders)} tie at ${most} leads each.`
}

export function LeadSourcesChart({ className }: { className?: string }) {
  const sources = useAppSelector(selectLeadSources)
  const animate = useChartAnimation()

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader title="Lead sources" description={describeLeaders(sources)} />
      {sources.length ? (
        <>
          <div className="w-full min-w-0 flex-1" style={{ minHeight: Math.max(220, sources.length * 44) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10} barGap={3}>
                <defs>
                  <linearGradient id="sourceLeadsFill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={CHART_COLORS.brand} />
                    <stop offset="100%" stopColor={CHART_COLORS.orchid} />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="source" {...axisProps} width={76} />
                <Tooltip cursor={{ fill: 'rgb(124 58 237 / 0.06)' }} content={<ChartTooltip />} />
                <Bar dataKey="leads" name="Leads" fill="url(#sourceLeadsFill)" radius={[4, 8, 8, 4]} maxBarSize={14} isAnimationActive={animate} animationDuration={900} />
                <Bar dataKey="won" name="Won" fill={CHART_COLORS.success} radius={[4, 8, 8, 4]} maxBarSize={14} isAnimationActive={animate} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-linear-to-r from-brand to-orchid" /> Leads
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-success" /> Won
            </span>
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-sm text-ink-muted">No leads yet.</p>
      )}
    </Card>
  )
}
