import { memo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronLeft, ChevronRight, GripVertical, Pencil, Trash2, UserRound } from 'lucide-react'
import { IconAction } from '@/components/common/IconAction'
import { DEAL_STAGES, dealStageMeta } from '@/lib/dealStage'
import { daysUntil, formatCurrency, formatDay } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Deal, DealStage } from '@/types'

type DealCardProps = {
  deal: Deal
  dragging: boolean
  canMove: boolean
  canEdit: boolean
  canDelete: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onMove: (deal: Deal, stage: DealStage) => void
  onEdit: (deal: Deal) => void
  onDelete: (deal: Deal) => void
}

function DealCardBase({ deal, dragging, canMove, canEdit, canDelete, onDragStart, onDragEnd, onMove, onEdit, onDelete }: DealCardProps) {
  const stage = dealStageMeta(deal.stage)
  const index = DEAL_STAGES.findIndex((item) => item.value === deal.stage)
  const prev = DEAL_STAGES[index - 1]
  const next = DEAL_STAGES[index + 1]
  const closed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
  const closeDays = daysUntil(deal.expectedClose)

  return (
    <article
      draggable={canMove}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', deal.id)
        onDragStart(deal.id)
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-3.5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-lift)]',
        canMove && 'cursor-grab active:cursor-grabbing',
        dragging && 'scale-[0.97] rotate-1 opacity-50',
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5" style={{ backgroundColor: stage.color }} aria-hidden />
      <div className="flex items-start gap-2">
        {canMove ? <GripVertical className="mt-0.5 hidden size-4 shrink-0 text-ink-subtle/60 transition-colors group-hover:text-brand md:block" aria-hidden /> : null}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold break-words text-ink">{deal.title}</h3>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{deal.company}</p>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="font-display text-lg font-bold text-ink tabular-nums">{formatCurrency(deal.value)}</p>
        <span className="text-xs font-semibold text-ink-subtle tabular-nums">{deal.probability}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas-muted">
        <div className="h-full origin-left animate-grow-x rounded-full" style={{ width: `${deal.probability}%`, backgroundColor: stage.color }} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        {deal.customerId ? (
          <Link to={`/customers/${deal.customerId}`} className="flex min-w-0 items-center gap-1.5 font-medium text-aurora-deep hover:underline">
            <UserRound className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">Customer profile</span>
          </Link>
        ) : (
          <span className="text-ink-subtle">Prospect</span>
        )}
        <span
          className={cn(
            'flex shrink-0 items-center gap-1',
            !closed && closeDays < 0 ? 'font-semibold text-danger' : !closed && closeDays <= 7 ? 'font-semibold text-amber-600' : 'text-ink-subtle',
          )}
          title="Expected close"
        >
          <CalendarClock className="size-3.5" aria-hidden />
          {formatDay(deal.expectedClose)}
        </span>
      </div>

      {canMove || canEdit || canDelete ? (
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
          <div className="flex gap-0.5">
            {canMove ? (
              <>
                <IconAction
                  icon={ChevronLeft}
                  label={prev ? `Move ${deal.title} to ${prev.label}` : 'First stage'}
                  disabled={!prev}
                  onClick={() => prev && onMove(deal, prev.value)}
                  className="disabled:pointer-events-none disabled:opacity-30"
                />
                <IconAction
                  icon={ChevronRight}
                  label={next ? `Move ${deal.title} to ${next.label}` : 'Last stage'}
                  disabled={!next}
                  onClick={() => next && onMove(deal, next.value)}
                  className="disabled:pointer-events-none disabled:opacity-30"
                />
              </>
            ) : null}
          </div>
          <div className="flex gap-0.5">
            {canEdit ? <IconAction icon={Pencil} label={`Edit ${deal.title}`} onClick={() => onEdit(deal)} /> : null}
            {canDelete ? <IconAction icon={Trash2} label={`Delete ${deal.title}`} tone="danger" onClick={() => onDelete(deal)} /> : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}

export const DealCard = memo(DealCardBase)
