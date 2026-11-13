import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, Phone, Plus, Trash2, UsersRound } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { RoleAccessNote } from '@/components/access/RoleAccessNote'
import { IconAction } from '@/components/common/IconAction'
import { SearchField } from '@/components/common/SearchField'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { addCustomer, deleteCustomer, type CustomerInput } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { useCreateParam } from '@/hooks/useCreateParam'
import { usePagination } from '@/hooks/usePagination'
import { can } from '@/lib/permissions'
import type { Customer, CustomerStatus } from '@/types'

const PAGE_SIZE = 9
type CustomerFilter = 'all' | CustomerStatus

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export default function CustomersPage() {
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const customers = useAppSelector((state) => state.workspace.customers)
  const deals = useAppSelector((state) => state.workspace.deals)
  const activities = useAppSelector((state) => state.workspace.activities)
  const canCreate = can(role, 'customers.create')
  const canDelete = can(role, 'customers.delete')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerFilter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  useCreateParam(canCreate, () => setCreateOpen(true))

  const counts = useMemo(
    () => ({
      all: customers.length,
      active: customers.filter((customer) => customer.status === 'active').length,
      inactive: customers.filter((customer) => customer.status === 'inactive').length,
    }),
    [customers],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const haystack = `${customer.name} ${customer.company} ${customer.email} ${customer.location}`.toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [customers, search, statusFilter])

  const pager = usePagination(filtered, PAGE_SIZE, `${search}|${statusFilter}`)

  async function handleCreate(values: CustomerInput) {
    await wait(350)
    if (customers.some((customer) => customer.email.toLowerCase() === values.email.toLowerCase())) {
      throw new Error('A customer with this email already exists.')
    }
    dispatch(addCustomer(values))
    dispatch(pushToast({ tone: 'success', title: 'Customer created', message: `${values.name} was added.` }))
    setCreateOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget || !canDelete) return
    await wait(300)
    dispatch(deleteCustomer(deleteTarget.id))
    dispatch(pushToast({ tone: 'success', title: 'Customer deleted', message: `${deleteTarget.name} was removed.` }))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <RoleAccessNote area="customers" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField label="Search customers" placeholder="Search name, company, email, or location…" value={search} onChange={setSearch} className="sm:max-w-md sm:flex-1" />
        {canCreate ? (
          <Button onClick={() => setCreateOpen(true)} className="sm:ml-auto">
            <Plus className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">New customer</span>
          </Button>
        ) : null}
      </div>

      <FilterTabs
        ariaLabel="Filter customers"
        value={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'active', label: 'Active', count: counts.active },
          { value: 'inactive', label: 'Inactive', count: counts.inactive },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No customers found"
          description={search || statusFilter !== 'all' ? 'Try a different search or status.' : 'Add the first customer profile.'}
          actionLabel={canCreate ? 'New customer' : undefined}
          onAction={canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-5">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {pager.pageItems.map((customer) => {
              const dealCount = deals.filter((deal) => deal.customerId === customer.id).length
              const interactionCount = activities.filter((activity) => activity.customerId === customer.id).length
              return (
                <li key={customer.id}>
                  <Card interactive padding="none" className="group flex h-full flex-col overflow-hidden">
                    <div className="relative h-16 bg-brand-gradient">
                      {canDelete ? (
                        <IconAction
                          icon={Trash2}
                          label={`Delete ${customer.name}`}
                          tone="danger"
                          onClick={() => setDeleteTarget(customer)}
                          className="absolute top-2.5 right-2.5 bg-white/15 text-white hover:bg-white"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col px-4 pt-0 pb-4">
                      <Avatar name={customer.name} size="lg" className="-mt-6 ring-4 ring-surface" />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-ink">{customer.name}</h2>
                          <p className="truncate text-sm text-ink-muted">{customer.company}</p>
                        </div>
                        <Badge variant={customer.status === 'active' ? 'success' : 'muted'} dot>
                          {customer.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
                        <li className="flex items-center gap-2 truncate">
                          <Mail className="size-3.5 shrink-0" aria-hidden /> {customer.email}
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="size-3.5 shrink-0" aria-hidden /> {customer.phone}
                        </li>
                        {customer.location ? (
                          <li className="flex items-center gap-2 truncate">
                            <MapPin className="size-3.5 shrink-0" aria-hidden /> {customer.location}
                          </li>
                        ) : null}
                      </ul>
                      <p className="mt-3 text-xs font-semibold text-ink-subtle">
                        {dealCount} {dealCount === 1 ? 'deal' : 'deals'} · {interactionCount} {interactionCount === 1 ? 'interaction' : 'interactions'}
                      </p>
                      <Link to={`/customers/${customer.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:gap-2 hover:text-orchid">
                        Open profile <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
          <Pagination page={pager.page} totalPages={pager.totalPages} totalItems={pager.total} rangeStart={pager.rangeStart} rangeEnd={pager.rangeEnd} onPageChange={pager.goToPage} label="customers" />
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create customer" description="Contact details and account status." size="lg">
        {createOpen ? <CustomerForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Create customer" /> : null}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message={`Remove ${deleteTarget?.name ?? 'this customer'} and their interaction history? Related deals stay in the pipeline.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
