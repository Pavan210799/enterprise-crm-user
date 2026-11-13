import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectDealOutcomes } from '@/features/workspace/reportSelectors'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCompactCurrency, formatCurrency, formatDay } from '@/lib/format'

export function ClosedDealsTable() {
  const outcomes = useAppSelector(selectDealOutcomes)

  return (
    <Card>
      <CardHeader
        title="Completed deals"
        description={`${outcomes.wonCount} won for ${formatCompactCurrency(outcomes.wonValue)} · ${outcomes.lostCount} lost for ${formatCompactCurrency(outcomes.lostValue)}`}
        action={
          <Link to="/pipeline" className="inline-flex items-center rounded-lg px-2 py-1 text-sm font-semibold text-brand transition hover:bg-brand-soft">
            Open pipeline
          </Link>
        }
      />
      {outcomes.closed.length === 0 ? (
        <EmptyState icon={Trophy} title="No closed deals yet" description="Deals you mark as won or lost will be summarised here." />
      ) : (
        <>
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                  <th className="py-2.5 pr-4 font-semibold">Deal</th>
                  <th className="py-2.5 pr-4 font-semibold">Customer</th>
                  <th className="py-2.5 pr-4 font-semibold">Closed</th>
                  <th className="py-2.5 pr-4 font-semibold">Outcome</th>
                  <th className="py-2.5 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.closed.map((deal) => (
                  <tr key={deal.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-canvas/70">
                    <td className="max-w-0 py-3 pr-4">
                      <p className="truncate font-semibold text-ink">{deal.title}</p>
                      <p className="truncate text-xs text-ink-subtle">{deal.company}</p>
                    </td>
                    <td className="max-w-0 py-3 pr-4">
                      {deal.customerId && deal.customerName ? (
                        <Link to={`/customers/${deal.customerId}`} className="block truncate font-medium text-aurora-deep transition hover:text-brand">
                          {deal.customerName}
                        </Link>
                      ) : (
                        <span className="text-ink-subtle">Prospect</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-ink-muted">{formatDay(deal.expectedClose)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={deal.won ? 'success' : 'danger'} dot>
                        {deal.won ? 'Won' : 'Lost'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-semibold whitespace-nowrap text-ink tabular-nums">{formatCurrency(deal.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-2.5 md:hidden">
            {outcomes.closed.map((deal) => (
              <li key={deal.id} className="rounded-xl border border-border/70 bg-surface-raised p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{deal.title}</p>
                    <p className="truncate text-xs text-ink-subtle">
                      {deal.company} · {formatDay(deal.expectedClose)}
                    </p>
                  </div>
                  <Badge variant={deal.won ? 'success' : 'danger'} dot>
                    {deal.won ? 'Won' : 'Lost'}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  {deal.customerId && deal.customerName ? (
                    <Link to={`/customers/${deal.customerId}`} className="truncate font-medium text-aurora-deep transition hover:text-brand">
                      {deal.customerName}
                    </Link>
                  ) : (
                    <span className="text-ink-subtle">Prospect</span>
                  )}
                  <span className="shrink-0 font-semibold text-ink tabular-nums">{formatCurrency(deal.value)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}
