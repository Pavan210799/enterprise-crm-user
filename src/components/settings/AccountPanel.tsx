import { useState } from 'react'
import { Building2, CalendarDays, Check, Lock, RotateCcw, Sparkles, UserCog } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setReduceMotion } from '@/features/settings/settingsSlice'
import { resetWorkspace } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { Card, CardHeader } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PERMISSION_GROUPS, can } from '@/lib/permissions'
import { formatDay } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { AuthUser } from '@/types'

export function AccountPanel({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch()
  const reduceMotion = useAppSelector((s) => s.settings.reduceMotion)
  const [confirmReset, setConfirmReset] = useState(false)

  const details = [
    { icon: Building2, label: 'Company', value: user.company },
    { icon: UserCog, label: 'Role', value: user.roleLabel },
    { icon: CalendarDays, label: 'Member since', value: user.joinedAt ? formatDay(user.joinedAt) : '—' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader title="Account" description="Managed by your workspace administrator." />
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          {details.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex min-w-0 items-center gap-3 rounded-xl bg-canvas/80 p-3 transition-colors hover:bg-brand-soft/60">
              <Icon className="size-4 shrink-0 text-brand" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">{label}</p>
                <p className="truncate text-sm font-semibold text-ink">{value}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
          <Switch
            label="Reduce motion"
            description="Minimise page transitions and animated effects across the app."
            checked={reduceMotion}
            onChange={(checked) => dispatch(setReduceMotion(checked))}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Your access"
          description="What your role can do in this workspace."
          action={
            <Badge variant="brand" dot>
              {user.roleLabel}
            </Badge>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.module} className="min-w-0">
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-ink-subtle uppercase">{group.module}</p>
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const allowed = can(user.role, item.permission)
                  return (
                    <li key={item.permission} className={cn('flex items-start gap-2 text-sm', allowed ? 'text-ink' : 'text-ink-subtle')}>
                      <span className={cn('mt-0.5 grid size-4 shrink-0 place-items-center rounded-full', allowed ? 'bg-success-soft text-emerald-700' : 'bg-canvas-muted text-ink-subtle')}>
                        {allowed ? <Check className="size-3" aria-hidden /> : <Lock className="size-2.5" aria-hidden />}
                      </span>
                      <span>
                        {item.label}
                        <span className="sr-only">{allowed ? ' (allowed)' : ' (not allowed)'}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-amber-700">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-ink sm:text-lg">Reset demo workspace</h2>
              <p className="mt-1 text-sm text-ink-muted">Restore the original leads, customers, deals, tasks, activities, and notifications.</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 hover:border-danger/40 hover:bg-danger-soft hover:text-danger" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" aria-hidden /> Reset data
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo workspace?"
        message="Every change you made to leads, customers, deals, tasks, activities, and notifications will be replaced with the original demo data."
        confirmLabel="Reset"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          dispatch(resetWorkspace())
          setConfirmReset(false)
          dispatch(pushToast({ tone: 'success', title: 'Workspace reset', message: 'The demo data was restored.' }))
        }}
      />
    </div>
  )
}
