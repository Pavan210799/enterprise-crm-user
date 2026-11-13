import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Eye, Pencil, Plus, Trash2, UserCheck, UserRound, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { RoleAccessNote } from '@/components/access/RoleAccessNote'
import { IconAction } from '@/components/common/IconAction'
import { SearchField } from '@/components/common/SearchField'
import { FollowUpForm } from '@/components/leads/FollowUpForm'
import { LeadDetails } from '@/components/leads/LeadDetails'
import { LeadForm } from '@/components/leads/LeadForm'
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import {
  convertLead,
  deleteLead,
  linkLeadToCustomer,
  logFollowUp,
  updateLead,
  updateLeadStatus,
  addLead,
  type LeadInput,
} from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { dateInputFromOffset } from '@/data/workspace'
import { useCreateParam } from '@/hooks/useCreateParam'
import { usePagination } from '@/hooks/usePagination'
import { formatCurrency, formatDay } from '@/lib/format'
import { LEAD_STATUSES, isOpenFollowUp, leadStatusLabel } from '@/lib/leadStatus'
import { can } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { Lead, LeadStatus } from '@/types'

const PAGE_SIZE = 8
type LeadFilter = 'all' | 'follow_up' | LeadStatus

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

function followUpClass(date: string, today: string) {
  if (!date) return 'text-ink-subtle'
  if (date < today) return 'font-semibold text-danger'
  if (date === today) return 'font-semibold text-amber-700'
  return 'font-semibold text-ink'
}

export default function LeadsPage() {
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const leads = useAppSelector((state) => state.workspace.leads)
  const customers = useAppSelector((state) => state.workspace.customers)
  const activities = useAppSelector((state) => state.workspace.activities)
  const today = dateInputFromOffset(0)
  const canCreate = can(role, 'leads.create')
  const canEdit = can(role, 'leads.edit')
  const canStatus = can(role, 'leads.status')
  const canFollowUp = can(role, 'leads.followUp')
  const canDelete = can(role, 'leads.delete')
  const canConvert = can(role, 'customers.create')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Lead | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [followUpId, setFollowUpId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null)
  useCreateParam(canCreate, () => openForm(null))

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status.value, leads.filter((lead) => lead.status === status.value).length])) as Record<LeadStatus, number>
    return {
      all: leads.length,
      follow_up: leads.filter((lead) => isOpenFollowUp(lead.status, lead.nextFollowUp, today)).length,
      ...byStatus,
    }
  }, [leads, today])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'follow_up' ? isOpenFollowUp(lead.status, lead.nextFollowUp, today) : lead.status === statusFilter
      const haystack = `${lead.name} ${lead.company} ${lead.email}`.toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [leads, search, statusFilter, today])

  const pager = usePagination(filtered, PAGE_SIZE, `${search}|${statusFilter}`)
  const viewing = leads.find((lead) => lead.id === viewingId) ?? null
  const following = leads.find((lead) => lead.id === followUpId) ?? null

  const tabs = useMemo(
    () => [
      { value: 'all' as const, label: 'All', count: counts.all },
      { value: 'follow_up' as const, label: 'Follow-ups', count: counts.follow_up },
      ...LEAD_STATUSES.map((status) => ({ ...status, count: counts[status.value] })),
    ],
    [counts],
  )

  function openForm(lead: Lead | null) {
    setEditing(lead)
    setFormOpen(true)
  }

  async function handleSave(values: LeadInput) {
    await wait(350)
    const email = values.email.toLowerCase()
    if (leads.some((lead) => lead.email.toLowerCase() === email && lead.id !== editing?.id)) {
      throw new Error('Another lead already uses this email address.')
    }
    if (editing) {
      dispatch(updateLead({ id: editing.id, values }))
      dispatch(pushToast({ tone: 'success', title: 'Lead updated', message: `${values.name} has been saved.` }))
    } else {
      dispatch(addLead(values))
      dispatch(pushToast({ tone: 'success', title: 'Lead created', message: `${values.name} was added to the book.` }))
    }
    setFormOpen(false)
  }

  function handleStatus(lead: Lead, status: LeadStatus) {
    dispatch(updateLeadStatus({ id: lead.id, status }))
    dispatch(pushToast({ tone: 'info', title: 'Status updated', message: `${lead.name} is now ${leadStatusLabel(status)}.` }))
  }

  function handleConvert(lead: Lead) {
    const existing = customers.find((customer) => customer.email.toLowerCase() === lead.email.toLowerCase())
    if (existing) {
      dispatch(linkLeadToCustomer({ leadId: lead.id, customerId: existing.id }))
      dispatch(pushToast({ tone: 'success', title: 'Linked to customer', message: `${lead.name} already had a profile.` }))
      return
    }
    dispatch(convertLead(lead))
    dispatch(pushToast({ tone: 'success', title: 'Converted to customer', message: `${lead.name} now has a customer profile.` }))
  }

  async function handleFollowUp(values: { nextFollowUp: string; note: string }) {
    if (!following) return
    await wait(300)
    dispatch(logFollowUp({ id: following.id, ...values }))
    dispatch(pushToast({ tone: 'success', title: 'Follow-up saved', message: `${following.name} is scheduled for ${formatDay(values.nextFollowUp)}.` }))
    setFollowUpId(null)
  }

  async function confirmDelete() {
    if (!deleteTarget || !canDelete) return
    await wait(300)
    dispatch(deleteLead(deleteTarget.id))
    dispatch(pushToast({ tone: 'success', title: 'Lead deleted', message: `${deleteTarget.name} was removed.` }))
    setDeleteTarget(null)
    if (viewingId === deleteTarget.id) setViewingId(null)
  }

  function actions(lead: Lead) {
    return (
      <>
        <IconAction icon={Eye} label={`View ${lead.name}`} onClick={() => setViewingId(lead.id)} />
        {canFollowUp ? <IconAction icon={CalendarClock} label={`Log follow-up for ${lead.name}`} onClick={() => setFollowUpId(lead.id)} /> : null}
        {lead.customerId ? (
          <Link
            to={`/customers/${lead.customerId}`}
            title="Open customer profile"
            aria-label={`Open customer profile for ${lead.name}`}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-subtle transition hover:-translate-y-0.5 hover:bg-aurora-soft hover:text-aurora-deep"
          >
            <UserRound className="size-4" />
          </Link>
        ) : canConvert ? (
          <IconAction icon={UserCheck} label={`Convert ${lead.name} to customer`} tone="success" onClick={() => handleConvert(lead)} />
        ) : null}
        {canEdit ? <IconAction icon={Pencil} label={`Edit ${lead.name}`} onClick={() => openForm(lead)} /> : null}
        {canDelete ? <IconAction icon={Trash2} label={`Delete ${lead.name}`} tone="danger" onClick={() => setDeleteTarget(lead)} /> : null}
      </>
    )
  }

  return (
    <div className="space-y-5">
      <RoleAccessNote area="leads" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField label="Search leads" placeholder="Search by name, company, or email…" value={search} onChange={setSearch} className="sm:max-w-md sm:flex-1" />
        {canCreate ? (
          <Button onClick={() => openForm(null)} className="sm:ml-auto">
            <Plus className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">New lead</span>
          </Button>
        ) : null}
      </div>

      <FilterTabs tabs={tabs} value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter leads" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads found"
          description={search || statusFilter !== 'all' ? 'Try a different search or status filter.' : 'Create the first lead in this book.'}
          actionLabel={canCreate ? 'New lead' : undefined}
          onAction={canCreate ? () => openForm(null) : undefined}
        />
      ) : (
        <div className="space-y-5">
          <Card padding="none" className="hidden overflow-hidden xl:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-border bg-canvas/70 text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                <tr>
                  <th className="w-[28%] px-5 py-3.5">Lead</th>
                  <th className="w-[16%] px-4 py-3.5">Follow-up</th>
                  <th className="w-[18%] px-4 py-3.5">Status</th>
                  <th className="w-[12%] px-4 py-3.5">Value</th>
                  <th className="w-[10%] px-4 py-3.5">Source</th>
                  <th className="w-[16%] px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {pager.pageItems.map((lead) => (
                  <tr key={lead.id} className="group transition-colors duration-200 hover:bg-brand-soft/30">
                    <td className="px-5 py-3.5">
                      <button type="button" onClick={() => setViewingId(lead.id)} className="flex w-full min-w-0 items-center gap-3 text-left">
                        <Avatar name={lead.name} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink group-hover:text-brand">{lead.name}</span>
                          <span className="block truncate text-xs text-ink-muted">
                            {lead.company} · {lead.email}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className={cn('px-4 py-3.5 text-sm', followUpClass(lead.nextFollowUp, today))}>{lead.nextFollowUp ? formatDay(lead.nextFollowUp) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1.5">
                        <LeadStatusBadge status={lead.status} />
                        {canStatus ? (
                          <Select
                            aria-label={`Update status for ${lead.name}`}
                            value={lead.status}
                            onChange={(event) => handleStatus(lead, event.target.value as LeadStatus)}
                            options={LEAD_STATUSES}
                            containerClassName="w-full max-w-40"
                            className="h-9"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-ink tabular-nums">{formatCurrency(lead.estimatedValue)}</td>
                    <td className="truncate px-4 py-3.5 text-ink-muted">{lead.source}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-0.5">{actions(lead)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:hidden">
            {pager.pageItems.map((lead) => (
              <li key={lead.id}>
                <Card interactive padding="sm" className="flex h-full flex-col gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={lead.name} size="lg" />
                    <button type="button" onClick={() => setViewingId(lead.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate font-semibold text-ink">{lead.name}</p>
                      <p className="truncate text-sm text-ink-muted">{lead.company}</p>
                      <p className="truncate text-xs text-ink-subtle">{lead.email}</p>
                    </button>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-canvas/80 p-3 text-xs">
                    <div>
                      <p className="text-ink-subtle">Follow-up</p>
                      <p className={followUpClass(lead.nextFollowUp, today)}>{lead.nextFollowUp ? formatDay(lead.nextFollowUp) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-ink-subtle">Value</p>
                      <p className="truncate font-semibold text-ink tabular-nums">{formatCurrency(lead.estimatedValue)}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    {canStatus ? (
                      <Select
                        aria-label={`Update status for ${lead.name}`}
                        value={lead.status}
                        onChange={(event) => handleStatus(lead, event.target.value as LeadStatus)}
                        options={LEAD_STATUSES}
                        containerClassName="max-w-40 flex-1"
                        className="h-9"
                      />
                    ) : (
                      <span />
                    )}
                    <div className="flex shrink-0 gap-0.5">{actions(lead)}</div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <Pagination page={pager.page} totalPages={pager.totalPages} totalItems={pager.total} rangeStart={pager.rangeStart} rangeEnd={pager.rangeEnd} onPageChange={pager.goToPage} label="leads" />
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit lead' : 'Create lead'} description="Name, company, status, and the next follow-up." size="lg">
        {formOpen ? <LeadForm key={editing?.id ?? 'new'} initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => setFormOpen(false)} submitLabel={editing ? 'Save changes' : 'Create lead'} /> : null}
      </Modal>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewingId(null)}
        title={viewing?.name ?? 'Lead'}
        description={viewing?.company}
        size="lg"
        footer={
          viewing ? (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button variant="outline" onClick={() => setViewingId(null)}>
                Close
              </Button>
              {canEdit ? (
                <Button
                  onClick={() => {
                    const current = viewing
                    setViewingId(null)
                    openForm(current)
                  }}
                >
                  <Pencil className="relative z-[2] size-4" />
                  <span className="relative z-[2]">Edit lead</span>
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {viewing ? <LeadDetails lead={viewing} activities={activities} /> : null}
      </Modal>

      <Modal open={Boolean(following)} onClose={() => setFollowUpId(null)} title="Log follow-up" description={following ? `${following.name} · ${following.company}` : undefined}>
        {following ? <FollowUpForm key={following.id} initialDate={following.nextFollowUp} onSubmit={handleFollowUp} onCancel={() => setFollowUpId(null)} /> : null}
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete lead" message={`Remove ${deleteTarget?.name ?? 'this lead'} from the book? This cannot be undone.`} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
