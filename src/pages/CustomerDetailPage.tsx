import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Pencil, Phone, Trash2, UsersRound } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { InteractionForm } from '@/components/customers/InteractionForm'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { DEAL_STAGES } from '@/lib/dealStage'
import { addInteraction, deleteCustomer, updateCustomer, type CustomerInput } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { formatCurrency, timeAgo } from '@/lib/format'
import { can } from '@/lib/permissions'
import type { ActivityType, DealStage } from '@/types'

const TYPE_LABEL: Record<ActivityType, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  follow_up: 'Follow-up',
  note: 'Note',
}

function stageVariant(stage: DealStage) {
  if (stage === 'closed_won') return 'success' as const
  if (stage === 'closed_lost') return 'danger' as const
  if (stage === 'negotiation' || stage === 'proposal') return 'warning' as const
  return 'brand' as const
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export default function CustomerDetailPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const customer = useAppSelector((state) => state.workspace.customers.find((item) => item.id === id))
  const deals = useAppSelector((state) => state.workspace.deals.filter((deal) => deal.customerId === id))
  const activities = useAppSelector((state) => state.workspace.activities.filter((activity) => activity.customerId === id))
  const lead = useAppSelector((state) => state.workspace.leads.find((item) => item.customerId === id))
  const canEdit = can(role, 'customers.edit')
  const canDelete = can(role, 'customers.delete')
  const canInteract = can(role, 'customers.interact')
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [removed, setRemoved] = useState(false)

  const stageLabel = useMemo(() => Object.fromEntries(DEAL_STAGES.map((stage) => [stage.value, stage.label])), [])

  if (!customer || removed) {
    return (
      <div className="space-y-4">
        <EmptyState icon={UsersRound} title="Customer not found" description="This profile is not in the workspace." />
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-orchid">
          <ArrowLeft className="size-4" /> Back to customers
        </Link>
      </div>
    )
  }

  async function handleSave(values: CustomerInput) {
    if (!customer) return
    await wait(300)
    dispatch(updateCustomer({ id: customer.id, values }))
    dispatch(pushToast({ tone: 'success', title: 'Customer updated', message: `${values.name} has been saved.` }))
    setEditing(false)
  }

  async function handleInteraction(values: { type: ActivityType; title: string; description: string }) {
    if (!customer) return
    await wait(250)
    dispatch(addInteraction({ customerId: customer.id, ...values }))
    dispatch(pushToast({ tone: 'success', title: 'Interaction logged', message: values.title }))
  }

  async function confirmDelete() {
    if (!customer || !canDelete) return
    await wait(300)
    dispatch(deleteCustomer(customer.id))
    dispatch(pushToast({ tone: 'success', title: 'Customer deleted', message: `${customer.name} was removed.` }))
    setConfirming(false)
    setRemoved(true)
  }

  return (
    <div className="space-y-5">
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:gap-2.5 hover:text-orchid">
        <ArrowLeft className="size-4" /> Customers
      </Link>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={customer.name} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{customer.name}</h2>
              <Badge variant={customer.status === 'active' ? 'success' : 'muted'} dot>
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {customer.jobTitle ? `${customer.jobTitle} · ` : ''}
              {customer.company}
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
              <li className="flex items-center gap-2 truncate">
                <Mail className="size-4 shrink-0 text-brand" aria-hidden /> {customer.email}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-brand" aria-hidden /> {customer.phone}
              </li>
              {customer.location ? (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-brand" aria-hidden /> {customer.location}
                </li>
              ) : null}
            </ul>
            {customer.notes ? <p className="mt-4 rounded-xl bg-canvas/80 p-3 text-sm leading-relaxed text-ink-muted">{customer.notes}</p> : null}
            {lead ? (
              <p className="mt-3 text-sm text-ink-muted">
                Converted from lead <span className="font-semibold text-ink">{lead.name}</span>
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            {canEdit ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                <Trash2 className="size-4" /> Delete
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card>
          <CardHeader title="Interaction history" description="Calls, emails, meetings, and notes on this account." />
          {canInteract ? (
            <div className="mt-4 rounded-2xl border border-border/80 bg-canvas/50 p-4">
              <InteractionForm onSubmit={handleInteraction} />
            </div>
          ) : null}
          {activities.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No interactions yet.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="rounded-2xl border border-border/70 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">{TYPE_LABEL[activity.type]}</Badge>
                    <span className="text-xs text-ink-subtle">{timeAgo(activity.occurredAt)}</span>
                  </div>
                  <p className="mt-2 font-semibold text-ink">{activity.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{activity.description}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <CardHeader title="Related deals" description="Open and closed work tied to this customer." />
          {deals.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No deals are linked yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {deals.map((deal) => (
                <li key={deal.id} className="rounded-2xl border border-border/70 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{deal.title}</p>
                    <Badge variant={stageVariant(deal.stage)}>{stageLabel[deal.stage]}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink tabular-nums">{formatCurrency(deal.value)}</p>
                  <p className="text-xs text-ink-subtle">{deal.probability}% probability</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/pipeline" className="mt-4 inline-flex text-sm font-semibold text-brand hover:text-orchid">
            View pipeline
          </Link>
        </Card>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit customer" size="lg">
        {editing ? <CustomerForm initial={customer} onSubmit={handleSave} onCancel={() => setEditing(false)} submitLabel="Save changes" /> : null}
      </Modal>
      <ConfirmDialog
        open={confirming}
        title="Delete customer"
        message={`Remove ${customer.name} and their interaction history? Related deals stay in the pipeline.`}
        onConfirm={confirmDelete}
        onClose={() => setConfirming(false)}
      />
    </div>
  )
}
