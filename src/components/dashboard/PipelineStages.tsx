import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectKpis, selectPipelineStages } from '@/features/workspace/workspaceSelectors'
import { Card, CardHeader } from '@/components/ui/Card'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

export function PipelineStages({ className }: { className?: string }) {
  const stages = useAppSelector(selectPipelineStages)
  const kpis = useAppSelector(selectKpis)
  const max = Math.max(...stages.map((stage) => stage.value), 1)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Ongoing deals"
        description={`${kpis.ongoingDeals} open · ${formatCompactCurrency(kpis.ongoingValue)} in play`}
        action={
          <Link to="/pipeline" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'group' })}>
            Pipeline <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />
      <ul className="space-y-3">
        {stages.map((stage) => (
          <li key={stage.value}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{stage.label}</span>
              <span className="text-ink-subtle tabular-nums">
                {stage.count} · {formatCompactCurrency(stage.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-canvas-muted">
              <div className="h-full rounded-full" style={{ width: `${Math.max(stage.value ? 8 : 0, (stage.value / max) * 100)}%`, backgroundColor: stage.color }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
