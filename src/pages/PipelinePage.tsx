import { useCallback, useMemo, useState } from 'react'
import { CircleDollarSign, Plus, Scale, Target, Trophy } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { RoleAccessNote } from '@/components/access/RoleAccessNote'
import { SearchField } from '@/components/common/SearchField'
import { StatTile } from '@/components/common/StatTile'
import { DealCard } from '@/components/pipeline/DealCard'
import { DealForm } from '@/components/pipeline/DealForm'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Modal } from '@/components/ui/Modal'
import { selectDeals, selectPipelineSummary } from '@/features/workspace/workspaceSelectors'
import { addDeal, deleteDeal, moveDeal, updateDeal, type DealInput } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { useCreateParam } from '@/hooks/useCreateParam'
import { DEAL_STAGES, dealStageMeta } from '@/lib/dealStage'
import { formatCompactCurrency } from '@/lib/format'
import { can } from '@/lib/permissions'
import { cn } from '@/lib/cn'
import type { Deal, DealStage } from '@/types'

const COLUMN_LIMIT = 6

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export default function PipelinePage() {
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const deals = useAppSelector(selectDeals)
  const summary = useAppSelector(selectPipelineSummary)
  const customers = useAppSelector((state) => state.workspace.customers)
  const canCreate = can(role, 'deals.create')
  const canEdit = can(role, 'deals.edit')
  const canMove = can(role, 'deals.move')
  const canDelete = can(role, 'deals.delete')

  const [search, setSearch] = useState('')
  const [mobileStage, setMobileStage] = useState<DealStage>('prospecting')
  const [expanded, setExpanded] = useState<Partial<Record<DealStage, boolean>>>({})
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<DealStage | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [formStage, setFormStage] = useState<DealStage>('prospecting')
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null)
  useCreateParam(canCreate, () => openForm(null))

  const byStage = useMemo(() => {
    const query = search.trim().toLowerCase()
    const groups = Object.fromEntries(DEAL_STAGES.map((stage) => [stage.value, [] as Deal[]])) as Record<DealStage, Deal[]>
    for (const deal of deals) {
      if (query && !`${deal.title} ${deal.company}`.toLowerCase().includes(query)) continue
      groups[deal.stage].push(deal)
    }
    for (const stage of DEAL_STAGES) groups[stage.value].sort((a, b) => a.expectedClose.localeCompare(b.expectedClose))
    return groups
  }, [deals, search])

  function openForm(deal: Deal | null, stage: DealStage = 'prospecting') {
    setEditing(deal)
    setFormStage(stage)
    setFormOpen(true)
  }

  const handleMove = useCallback(
    (deal: Deal, stage: DealStage) => {
      if (deal.stage === stage) return
      dispatch(moveDeal({ id: deal.id, stage }))
      const label = dealStageMeta(stage).label
      if (stage === 'closed_won') dispatch(pushToast({ tone: 'success', title: 'Deal won', message: `${deal.title} moved to ${label}.` }))
      else dispatch(pushToast({ tone: 'info', title: 'Deal moved', message: `${deal.title} is now in ${label}.` }))
    },
    [dispatch],
  )

  const handleEdit = useCallback((deal: Deal) => {
    setEditing(deal)
    setFormOpen(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setOverStage(null)
  }, [])

  function handleDrop(stage: DealStage, id: string) {
    const deal = deals.find((item) => item.id === id)
    if (deal && canMove) handleMove(deal, stage)
    handleDragEnd()
  }

  async function handleSave(values: DealInput) {
    await wait(350)
    if (editing) {
      dispatch(updateDeal({ id: editing.id, values }))
      dispatch(pushToast({ tone: 'success', title: 'Deal updated', message: values.title }))
    } else {
      dispatch(addDeal(values))
      dispatch(pushToast({ tone: 'success', title: 'Deal created', message: `${values.title} added to ${dealStageMeta(values.stage).label}.` }))
    }
    setFormOpen(false)
  }

  async function confirmDelete() {
    if (!deleteTarget || !canDelete) return
    await wait(300)
    dispatch(deleteDeal(deleteTarget.id))
    dispatch(pushToast({ tone: 'success', title: 'Deal deleted', message: deleteTarget.title }))
    setDeleteTarget(null)
  }

  function renderColumn(stage: (typeof DEAL_STAGES)[number], mobile = false) {
    const items = byStage[stage.value]
    const total = items.reduce((sum, deal) => sum + deal.value, 0)
    const showAll = expanded[stage.value] || mobile
    const visible = showAll ? items : items.slice(0, COLUMN_LIMIT)
    const isOver = overStage === stage.value && draggingId !== null

    return (
      <section
        key={stage.value}
        aria-label={`${stage.label} stage`}
        onDragOver={(event) => {
          if (!draggingId) return
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
          if (overStage !== stage.value) setOverStage(stage.value)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverStage(null)
        }}
        onDrop={(event) => {
          event.preventDefault()
          handleDrop(stage.value, event.dataTransfer.getData('text/plain') || draggingId || '')
        }}
        className={cn(
          'flex min-w-0 flex-col rounded-3xl border bg-surface/60 p-3 backdrop-blur transition-all duration-300',
          mobile ? 'w-full' : 'w-[18.5rem] shrink-0 snap-start',
          isOver ? 'border-brand/50 bg-brand-soft/60 shadow-[var(--shadow-glow)] ring-4 ring-brand/10' : 'border-border/70',
        )}
      >
        <header className="mb-3 px-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full ring-4 ring-white" style={{ backgroundColor: stage.color }} />
              <h2 className="truncate font-display text-sm font-bold text-ink">{stage.label}</h2>
              <span className="rounded-full bg-canvas-muted px-2 py-0.5 text-[11px] font-bold text-ink-muted tabular-nums">{items.length}</span>
            </div>
            {canCreate ? (
              <button
                type="button"
                onClick={() => openForm(null, stage.value)}
                aria-label={`Add deal to ${stage.label}`}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-subtle transition-all duration-200 hover:rotate-90 hover:bg-brand-soft hover:text-brand"
              >
                <Plus className="size-4" />
              </button>
            ) : null}
          </div>
          <p className="mt-1 pl-[1.125rem] text-xs font-semibold text-ink-subtle tabular-nums">{formatCompactCurrency(total)}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas-muted">
            <div className="h-full origin-left animate-grow-x rounded-full" style={{ backgroundColor: stage.color, width: `${Math.min(100, (items.length / 6) * 100)}%` }} />
          </div>
        </header>

        <div className="stagger flex flex-1 flex-col gap-3">
          {visible.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              dragging={draggingId === deal.id}
              canMove={canMove}
              canEdit={canEdit}
              canDelete={canDelete}
              onDragStart={setDraggingId}
              onDragEnd={handleDragEnd}
              onMove={handleMove}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
          {items.length === 0 ? (
            <div className={cn('grid min-h-28 place-items-center rounded-2xl border-2 border-dashed px-3 text-center text-xs transition-colors', isOver ? 'border-brand/50 text-brand' : 'border-border text-ink-subtle')}>
              {isOver ? 'Release to drop here' : search ? 'No matching deals' : 'No deals in this stage'}
            </div>
          ) : null}
          {!mobile && items.length > COLUMN_LIMIT ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => ({ ...current, [stage.value]: !current[stage.value] }))}
              className="rounded-xl py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
            >
              {showAll ? 'Show less' : `Show ${items.length - COLUMN_LIMIT} more`}
            </button>
          ) : null}
        </div>
      </section>
    )
  }

  const mobileTabs = DEAL_STAGES.map((stage) => ({ value: stage.value, label: stage.label, count: byStage[stage.value].length }))

  return (
    <div className="space-y-5">
      <RoleAccessNote area="pipeline" />
      <div className="stagger grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatTile icon={CircleDollarSign} label="Open pipeline" value={formatCompactCurrency(summary.openValue)} hint={`${summary.openCount} open deals`} tone="brand" />
        <StatTile icon={Scale} label="Weighted forecast" value={formatCompactCurrency(summary.weighted)} hint="By win probability" tone="aurora" />
        <StatTile icon={Trophy} label="Won revenue" value={formatCompactCurrency(summary.wonValue)} hint={`${summary.wonCount} deals closed`} tone="success" />
        <StatTile icon={Target} label="Win rate" value={`${summary.winRate}%`} hint="Won of closed deals" tone="orchid" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField label="Search deals" placeholder="Search deals or companies…" value={search} onChange={setSearch} className="sm:max-w-sm sm:flex-1" />
        {canCreate ? (
          <Button onClick={() => openForm(null)} className="sm:ml-auto">
            <Plus className="relative z-[2] size-4" aria-hidden />
            <span className="relative z-[2]">New deal</span>
          </Button>
        ) : null}
      </div>

      <div className="space-y-4 md:hidden">
        <FilterTabs tabs={mobileTabs} value={mobileStage} onChange={setMobileStage} ariaLabel="Pipeline stage" />
        <div key={mobileStage} className="animate-fade-up">
          {renderColumn(dealStageMeta(mobileStage), true)}
        </div>
      </div>
      <div className="scrollbar-thin -mx-4 hidden snap-x scroll-px-4 overflow-x-auto overscroll-x-contain -mt-4 px-4 pt-4 pb-4 after:w-px after:shrink-0 after:content-[''] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:flex md:items-start md:gap-4 lg:-mx-8 lg:scroll-px-8 lg:px-8">
        {DEAL_STAGES.map((stage) => renderColumn(stage))}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit deal' : 'Create deal'} description="Value, stage, probability, and expected close." size="lg">
        {formOpen ? (
          <DealForm
            key={editing?.id ?? `new-${formStage}`}
            initial={editing ?? undefined}
            defaultStage={formStage}
            customers={customers}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete deal"
        message={`Delete "${deleteTarget?.title ?? ''}" from the pipeline? This cannot be undone.`}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
