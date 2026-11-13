import { Link } from 'react-router-dom'
import { BellRing, Mail } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setAlert, setEmailDigest, type AlertKind, type EmailDigest } from '@/features/settings/settingsSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { Card, CardHeader } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { notificationMeta } from '@/lib/notificationKind'
import { cn } from '@/lib/cn'

const ALERTS: { kind: AlertKind; description: string }[] = [
  { kind: 'lead', description: 'When a new lead is added to your book.' },
  { kind: 'task', description: 'When a task is scheduled or due today.' },
  { kind: 'meeting', description: 'When you schedule an upcoming meeting.' },
  { kind: 'deal', description: 'When a deal is created, moved, won, or lost.' },
]

const DIGESTS: { value: EmailDigest; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'A morning summary of tasks and meetings.' },
  { value: 'weekly', label: 'Weekly', description: 'Monday recap of pipeline and performance.' },
  { value: 'off', label: 'Off', description: 'Only in-app notifications.' },
]

export function NotificationPreferences() {
  const dispatch = useAppDispatch()
  const { alerts, emailDigest } = useAppSelector((s) => s.settings)
  const enabled = Object.values(alerts).filter(Boolean).length

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader
          title="In-app alerts"
          description={`${enabled} of ${ALERTS.length} alert types are on.`}
          action={
            <Link to="/notifications" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-brand transition hover:bg-brand-soft">
              <BellRing className="size-4" aria-hidden /> Inbox
            </Link>
          }
        />
        <ul className="divide-y divide-border/60">
          {ALERTS.map(({ kind, description }) => {
            const meta = notificationMeta(kind)
            const Icon = meta.icon
            return (
              <li key={kind} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 hover:scale-110', meta.tint)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <Switch
                  className="flex-1"
                  label={meta.label}
                  description={description}
                  checked={alerts[kind]}
                  onChange={(checked) => {
                    dispatch(setAlert({ kind, enabled: checked }))
                    dispatch(pushToast({ tone: 'info', title: `${meta.label} ${checked ? 'on' : 'off'}`, message: checked ? 'You will be notified in the app.' : 'These alerts are muted.' }))
                  }}
                />
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Email digest" description="A summary sent to your work email." />
        <div role="radiogroup" aria-label="Email digest" className="space-y-2.5">
          {DIGESTS.map((digest) => {
            const active = digest.value === emailDigest
            return (
              <button
                key={digest.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => dispatch(setEmailDigest(digest.value))}
                className={cn(
                  'flex w-full min-w-0 items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5',
                  active ? 'border-brand/40 bg-brand-soft/50 shadow-[var(--shadow-soft)]' : 'border-border/80 bg-surface hover:border-brand/30 hover:shadow-[var(--shadow-soft)]',
                )}
              >
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition-colors', active ? 'bg-brand-gradient text-white' : 'bg-canvas-muted text-ink-subtle')}>
                  <Mail className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{digest.label}</span>
                  <span className="block text-xs text-ink-muted">{digest.description}</span>
                </span>
                <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors', active ? 'border-brand' : 'border-border-strong')}>
                  {active ? <span className="size-2.5 animate-pop rounded-full bg-brand" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
