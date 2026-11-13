import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectUpcomingTasks } from '@/features/workspace/workspaceSelectors'
import { toggleTaskComplete } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { Card, CardHeader } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { daysUntil, formatDueLabel } from '@/lib/format'
import { priorityMeta } from '@/lib/taskMeta'
import { cn } from '@/lib/cn'

export function UpcomingTasks({ className }: { className?: string }) {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(selectUpcomingTasks)

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader
        title="Pending tasks"
        description="Next deadlines on your list."
        action={
          <Link to="/tasks" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'group' })}>
            All tasks <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />
      {tasks.length === 0 ? <p className="rounded-xl bg-canvas/80 p-4 text-sm text-ink-muted">Nothing pending. Every task is complete.</p> : null}
      <ul className="space-y-2">
        {tasks.map((task) => {
          const days = daysUntil(task.dueDate)
          return (
            <li key={task.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-2.5">
              <Checkbox
                size="sm"
                checked={false}
                label={`Mark ${task.title} complete`}
                onChange={() => {
                  dispatch(toggleTaskComplete(task.id))
                  dispatch(pushToast({ tone: 'success', title: 'Task completed', message: task.title }))
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{task.title}</p>
                <p className={cn('truncate text-xs', days < 0 ? 'font-semibold text-danger' : days === 0 ? 'font-semibold text-amber-600' : 'text-ink-subtle')}>
                  {formatDueLabel(task.dueDate)} · {task.relatedTo}
                </p>
              </div>
              <span className={cn('size-2.5 shrink-0 rounded-full', priorityMeta(task.priority).accent)} title={`${task.priority} priority`} />
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
