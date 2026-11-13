import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectRecentActivities } from '@/features/workspace/workspaceSelectors'
import { Card, CardHeader } from '@/components/ui/Card'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { activityMeta } from '@/lib/activityType'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'

export function RecentActivityList({ className }: { className?: string }) {
  const activities = useAppSelector(selectRecentActivities)

  return (
    <Card className={className}>
      <CardHeader
        title="Recent activity"
        description="Calls, meetings, emails, and follow-ups."
        action={
          <Link to="/activities" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'group' })}>
            All activity <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />
      <ul className="grid gap-3 lg:grid-cols-2">
        {activities.map((activity) => {
          const meta = activityMeta(activity.type)
          const Icon = meta.icon
          return (
            <li key={activity.id} className="flex min-w-0 gap-3 rounded-xl border border-border/70 p-3">
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', meta.tint)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{activity.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{activity.description}</p>
                <p className="mt-1 text-[11px] font-medium text-ink-subtle">
                  {timeAgo(activity.occurredAt)}
                  {activity.customerName ? ` · ${activity.customerName}` : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
