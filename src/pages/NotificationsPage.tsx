import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BellOff, BellRing, CheckCheck, Mail, MailOpen, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { IconAction } from '@/components/common/IconAction'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { selectNotificationCounts, selectNotifications } from '@/features/workspace/workspaceSelectors'
import { clearReadNotifications, deleteNotification, markAllNotificationsRead, setNotificationRead } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { timeAgo } from '@/lib/format'
import { NOTIFICATION_KINDS, notificationMeta } from '@/lib/notificationKind'
import { cn } from '@/lib/cn'
import type { AppNotification, NotificationKind } from '@/types'

type NotificationFilter = 'all' | 'unread' | NotificationKind

export default function NotificationsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const notifications = useAppSelector(selectNotifications)
  const counts = useAppSelector(selectNotificationCounts)
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [confirmClear, setConfirmClear] = useState(false)
  const readCount = counts.all - counts.unread

  const visible = useMemo(
    () => (filter === 'all' ? notifications : filter === 'unread' ? notifications.filter((item) => !item.read) : notifications.filter((item) => item.kind === filter)),
    [notifications, filter],
  )

  const tabs = [
    { value: 'all' as const, label: 'All', count: counts.all },
    { value: 'unread' as const, label: 'Unread', count: counts.unread },
    ...NOTIFICATION_KINDS.filter((kind) => kind.value !== 'system' || counts.system > 0).map((kind) => ({ value: kind.value, label: kind.label, count: counts[kind.value] })),
  ]

  function open(item: AppNotification) {
    if (!item.read) dispatch(setNotificationRead({ id: item.id, read: true }))
    if (item.link) navigate(item.link)
  }

  function markAll() {
    dispatch(markAllNotificationsRead())
    dispatch(pushToast({ tone: 'success', title: 'All caught up', message: 'Every notification is marked as read.' }))
  }

  function clearRead() {
    dispatch(clearReadNotifications())
    dispatch(pushToast({ tone: 'success', title: 'Cleared', message: `${readCount} read notification${readCount === 1 ? '' : 's'} removed.` }))
    setConfirmClear(false)
  }

  return (
    <div className="space-y-5">
      <Card padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-[var(--shadow-glow)]">
            <BellRing className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-ink">{counts.unread ? `${counts.unread} unread` : 'You are all caught up'}</p>
            <p className="text-sm text-ink-muted">Lead assignments, task reminders, meeting alerts, and deal updates.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button variant="outline" onClick={markAll} disabled={!counts.unread}>
            <CheckCheck className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">Mark all read</span>
          </Button>
          <Button variant="outline" onClick={() => setConfirmClear(true)} disabled={!readCount}>
            <Trash2 className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">Clear read</span>
          </Button>
        </div>
      </Card>

      <FilterTabs tabs={tabs} value={filter} onChange={setFilter} ariaLabel="Filter notifications" />

      {visible.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications here'}
          description="New lead assignments, task reminders, meeting alerts, and deal updates will appear here."
        />
      ) : (
        <ul className="stagger space-y-3" aria-label="Notifications">
          {visible.map((item) => {
            const meta = notificationMeta(item.kind)
            const Icon = meta.icon
            return (
              <li
                key={item.id}
                className={cn(
                  'group relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border bg-surface p-3.5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:gap-4 sm:p-4',
                  item.read ? 'border-border/80' : 'border-brand/30 bg-brand-soft/30',
                )}
              >
                {!item.read ? <span className="absolute inset-y-0 left-0 w-1 bg-brand-gradient" aria-hidden /> : null}
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', meta.tint)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2">
                        <span className={cn('text-sm break-words text-ink', item.read ? 'font-medium' : 'font-bold')}>{item.title}</span>
                        {!item.read ? <span className="size-2 shrink-0 rounded-full bg-orchid" aria-label="Unread" /> : null}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-muted">{item.message}</p>
                      <p className="mt-1 text-[11px] font-medium text-ink-subtle">
                        {meta.label} · {timeAgo(item.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      {item.link ? <IconAction icon={ArrowUpRight} label={`Open ${item.title}`} onClick={() => open(item)} /> : null}
                      <IconAction
                        icon={item.read ? Mail : MailOpen}
                        label={item.read ? `Mark ${item.title} as unread` : `Mark ${item.title} as read`}
                        onClick={() => dispatch(setNotificationRead({ id: item.id, read: !item.read }))}
                      />
                      <IconAction icon={Trash2} label={`Delete ${item.title}`} tone="danger" onClick={() => dispatch(deleteNotification(item.id))} />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear read notifications"
        message={`Remove ${readCount} read notification${readCount === 1 ? '' : 's'}? Unread ones stay.`}
        confirmLabel="Clear"
        onConfirm={clearRead}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  )
}
