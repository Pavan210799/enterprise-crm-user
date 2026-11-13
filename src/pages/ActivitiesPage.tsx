import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity as ActivityIcon, CalendarCheck, CalendarClock, Pencil, Plus, Trash2, Users2, Zap } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { RoleAccessNote } from '@/components/access/RoleAccessNote'
import { IconAction } from '@/components/common/IconAction'
import { SearchField } from '@/components/common/SearchField'
import { StatTile } from '@/components/common/StatTile'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { selectActivities } from '@/features/workspace/workspaceSelectors'
import { deleteActivity, logActivity, updateActivity, type ActivityInput } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { useCreateParam } from '@/hooks/useCreateParam'
import { usePagination } from '@/hooks/usePagination'
import { ACTIVITY_TYPES, activityMeta } from '@/lib/activityType'
import { timeAgo } from '@/lib/format'
import { can } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { Activity, ActivityType } from '@/types'

const PAGE_SIZE = 8
type TypeFilter = ActivityType | 'all'

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

function dayLabel(iso: string) {
  const date = new Date(iso)
  const start = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const diff = Math.round((start(new Date()) - start(date)) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date)
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

function dateTimeLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

export default function ActivitiesPage() {
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const activities = useAppSelector(selectActivities)
  const customers = useAppSelector((state) => state.workspace.customers)
  const leads = useAppSelector((state) => state.workspace.leads)
  const canLog = can(role, 'activities.log')
  const canEdit = can(role, 'activities.edit')
  const canDelete = can(role, 'activities.delete')

  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<ActivityType>('call')
  const [editing, setEditing] = useState<Activity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null)
  useCreateParam(canLog, () => openForm(null))

  const customerNames = useMemo(() => new Map(customers.map((customer) => [customer.id, customer.name])), [customers])
  const relatedOptions = useMemo(() => [...new Set([...customers.map((customer) => customer.company), ...leads.map((lead) => lead.company)])].sort(), [customers, leads])

  const { history, upcoming, typeCounts, weekCount } = useMemo(() => {
    const now = Date.now()
    const sorted = [...activities].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    const past = sorted.filter((item) => new Date(item.occurredAt).getTime() <= now)
    const counts = Object.fromEntries(ACTIVITY_TYPES.map((item) => [item.value, 0])) as Record<ActivityType, number>
    for (const item of past) counts[item.type] += 1
    return {
      history: past,
      upcoming: sorted.filter((item) => new Date(item.occurredAt).getTime() > now).reverse(),
      typeCounts: counts,
      weekCount: past.filter((item) => now - new Date(item.occurredAt).getTime() < 7 * 86_400_000).length,
    }
  }, [activities])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return history.filter((item) => {
      if (type !== 'all' && item.type !== type) return false
      if (!query) return true
      const customer = item.customerId ? (customerNames.get(item.customerId) ?? '') : ''
      return `${item.title} ${item.description} ${item.relatedTo} ${customer}`.toLowerCase().includes(query)
    })
  }, [history, type, search, customerNames])

  const pager = usePagination(filtered, PAGE_SIZE, `${search}|${type}`)
  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>()
    for (const item of pager.pageItems) {
      const key = dayLabel(item.occurredAt)
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()]
  }, [pager.pageItems])

  const tabs = [{ value: 'all' as const, label: 'All', count: history.length }, ...ACTIVITY_TYPES.map((item) => ({ value: item.value, label: item.label, count: typeCounts[item.value] }))]
  const maxType = Math.max(1, ...Object.values(typeCounts))

  function openForm(item: Activity | null, defaultType: ActivityType = 'call') {
    setEditing(item)
    setFormType(defaultType)
    setFormOpen(true)
  }

  async function handleSave(values: ActivityInput) {
    await wait(350)
    const scheduled = new Date(values.occurredAt).getTime() > Date.now()
    if (editing) {
      dispatch(updateActivity({ id: editing.id, values }))
      dispatch(pushToast({ tone: 'success', title: 'Activity updated', message: values.title }))
    } else {
      dispatch(logActivity(values))
      dispatch(pushToast({ tone: 'success', title: scheduled ? 'Activity scheduled' : 'Activity logged', message: `${values.title} · ${values.relatedTo}` }))
    }
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget || !canDelete) return
    await wait(250)
    dispatch(deleteActivity(deleteTarget.id))
    dispatch(pushToast({ tone: 'success', title: 'Activity deleted', message: deleteTarget.title }))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <RoleAccessNote area="activities" />
      <div className="stagger grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatTile icon={ActivityIcon} label="Total logged" value={history.length} tone="brand" />
        <StatTile icon={Zap} label="Last 7 days" value={weekCount} tone="aurora" />
        <StatTile icon={Users2} label="Meetings held" value={typeCounts.meeting} tone="success" />
        <StatTile icon={CalendarClock} label="Upcoming" value={upcoming.length} hint="Scheduled meetings and follow-ups" tone="warning" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField label="Search activities" placeholder="Search activities, companies, or customers…" value={search} onChange={setSearch} className="sm:max-w-md sm:flex-1" />
        {canLog ? (
          <Button onClick={() => openForm(null)} className="sm:ml-auto">
            <Plus className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">Log activity</span>
          </Button>
        ) : null}
      </div>

      <FilterTabs tabs={tabs} value={type} onChange={setType} ariaLabel="Filter by activity type" />

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No activities found"
              description="Try another filter or log a call, meeting, email, or follow-up."
              actionLabel={canLog ? 'Log activity' : undefined}
              onAction={canLog ? () => openForm(null, type === 'all' ? 'call' : type) : undefined}
            />
          ) : (
            <Card>
              <div key={`${pager.page}-${type}`} className="space-y-6">
                {groups.map(([label, items]) => (
                  <section key={label} aria-label={label}>
                    <h2 className="mb-3 flex items-center gap-3 text-xs font-bold tracking-wider text-ink-subtle uppercase">
                      <span className="shrink-0">{label}</span>
                      <span className="h-px flex-1 bg-border" />
                      <span className="shrink-0 rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] tabular-nums">{items.length}</span>
                    </h2>
                    <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[1.1875rem] before:w-px before:bg-border">
                      {items.map((item) => {
                        const meta = activityMeta(item.type)
                        const Icon = meta.icon
                        const customerName = item.customerId ? customerNames.get(item.customerId) : undefined
                        return (
                          <li key={item.id} className="group relative flex min-w-0 gap-3">
                            <span className={cn('relative z-[1] grid size-10 shrink-0 place-items-center rounded-xl ring-4 ring-surface', meta.tint)}>
                              <Icon className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1 rounded-xl border border-border/70 p-3 transition-colors group-hover:border-brand/30">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold break-words text-ink">{item.title}</p>
                                  <p className="mt-0.5 text-[11px] font-medium text-ink-subtle">
                                    {meta.label} · {timeLabel(item.occurredAt)} · {timeAgo(item.occurredAt)}
                                  </p>
                                </div>
                                <div className="flex shrink-0 gap-0.5">
                                  {canEdit ? <IconAction icon={Pencil} label={`Edit ${item.title}`} onClick={() => openForm(item)} /> : null}
                                  {canDelete ? <IconAction icon={Trash2} label={`Delete ${item.title}`} tone="danger" onClick={() => setDeleteTarget(item)} /> : null}
                                </div>
                              </div>
                              {item.description ? <p className="mt-2 text-sm text-ink-muted">{item.description}</p> : null}
                              <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-ink-subtle">
                                <span>{item.relatedTo}</span>
                                {customerName && item.customerId ? (
                                  <Link to={`/customers/${item.customerId}`} className="font-semibold text-aurora-deep hover:underline">
                                    {customerName}
                                  </Link>
                                ) : null}
                              </p>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </section>
                ))}
              </div>
              <div className="mt-6 border-t border-border/70 pt-5">
                <Pagination page={pager.page} totalPages={pager.totalPages} totalItems={pager.total} rangeStart={pager.rangeStart} rangeEnd={pager.rangeEnd} onPageChange={pager.goToPage} label="activities" />
              </div>
            </Card>
          )}
        </div>

        <aside className="grid grid-cols-1 content-start gap-5 md:grid-cols-2 2xl:grid-cols-1">
          <Card>
            <CardHeader
              title="Upcoming"
              description="Scheduled meetings and follow-ups."
              action={
                canLog ? (
                  <Button size="sm" variant="ghost" onClick={() => openForm(null, 'meeting')}>
                    <Plus className="size-4" aria-hidden />
                    Schedule
                  </Button>
                ) : null
              }
            />
            {upcoming.length ? (
              <ul className="stagger space-y-2.5">
                {upcoming.slice(0, 6).map((item) => {
                  const meta = activityMeta(item.type)
                  const Icon = meta.icon
                  return (
                    <li key={item.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-2.5">
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', meta.tint)}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
                        <span className="block truncate text-xs text-ink-subtle">
                          {dateTimeLabel(item.occurredAt)} · {item.relatedTo}
                        </span>
                      </span>
                      {canEdit ? <IconAction icon={Pencil} label={`Edit ${item.title}`} onClick={() => openForm(item)} /> : null}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center rounded-xl bg-canvas p-5 text-center">
                <CalendarCheck className="mb-2 size-7 text-success" aria-hidden />
                <p className="text-sm text-ink-muted">Nothing scheduled yet.</p>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Activity mix" description="Logged activity by type." />
            <ul className="space-y-3.5">
              {ACTIVITY_TYPES.map((item, index) => {
                const Icon = item.icon
                const count = typeCounts[item.value]
                return (
                  <li key={item.value} className="group">
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Icon className="size-4 transition-transform group-hover:scale-125" style={{ color: item.color }} aria-hidden />
                        {item.label}
                      </span>
                      <span className="font-semibold text-ink-muted tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-canvas-muted">
                      <div className="h-full origin-left animate-grow-x rounded-full" style={{ width: `${(count / maxType) * 100}%`, backgroundColor: item.color, animationDelay: `${index * 80}ms` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </aside>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit activity' : 'Log activity'} description="Calls, meetings, emails, notes, and follow-ups." size="lg">
        {formOpen ? (
          <ActivityForm
            key={editing?.id ?? `new-${formType}`}
            initial={editing ?? undefined}
            defaultType={formType}
            customers={customers}
            relatedOptions={relatedOptions}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete activity" message={`Remove "${deleteTarget?.title ?? ''}" from the activity log?`} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
