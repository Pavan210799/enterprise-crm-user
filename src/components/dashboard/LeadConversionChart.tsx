import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAppSelector } from '@/app/hooks'
import { selectLeadFunnel } from '@/features/workspace/workspaceSelectors'
import { useChartAnimation } from '@/hooks/useChartAnimation'
import { Card, CardHeader } from '@/components/ui/Card'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { cn } from '@/lib/cn'

export function LeadConversionChart({ className }: { className?: string }) {
  const funnel = useAppSelector(selectLeadFunnel)
  const data = funnel.filter((item) => item.value > 0)
  const total = funnel.reduce((sum, item) => sum + item.value, 0)
  const won = funnel.find((item) => item.label === 'Won')?.value ?? 0
  const rate = total ? Math.round((won / total) * 100) : 0
  const animate = useChartAnimation()

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <CardHeader title="Lead conversion" description="How assigned leads are spread across statuses." />
      <div className="relative mx-auto aspect-square w-full max-w-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="64%" outerRadius="92%" paddingAngle={3} cornerRadius={6} stroke="none" isAnimationActive={animate}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatValue={(value) => `${value} leads`} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-ink tabular-nums">{rate}%</span>
          <span className="text-xs font-medium text-ink-subtle">Won</span>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-4">
        {funnel.map((item) => (
          <li key={item.name} className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-canvas/80 px-2.5 py-2">
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink-muted">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="text-xs font-bold text-ink tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
