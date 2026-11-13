import { Link } from 'react-router-dom'
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge'
import { formatCurrency, formatDay, timeAgo } from '@/lib/format'
import type { Activity, Lead } from '@/types'

export function LeadDetails({ lead, activities }: { lead: Lead; activities: Activity[] }) {
  const history = activities.filter((activity) => activity.relatedTo === lead.company).slice(0, 4)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <LeadStatusBadge status={lead.status} />
        <span className="text-sm text-ink-muted">{lead.source}</span>
        <span className="text-sm font-semibold text-ink tabular-nums">{formatCurrency(lead.estimatedValue)}</span>
      </div>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-subtle">Company</dt>
          <dd className="font-semibold text-ink">{lead.company}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Next follow-up</dt>
          <dd className="font-semibold text-ink">{lead.nextFollowUp ? formatDay(lead.nextFollowUp) : 'Not scheduled'}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Email</dt>
          <dd className="truncate font-medium text-ink">{lead.email}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">Phone</dt>
          <dd className="font-medium text-ink">{lead.phone}</dd>
        </div>
      </dl>
      {lead.notes ? <p className="rounded-xl bg-canvas/80 p-3 text-sm leading-relaxed text-ink-muted">{lead.notes}</p> : null}
      {lead.customerId ? (
        <Link to={`/customers/${lead.customerId}`} className="inline-flex text-sm font-semibold text-brand hover:text-orchid">
          Open customer profile
        </Link>
      ) : null}
      {history.length ? (
        <div>
          <h3 className="text-sm font-semibold text-ink">Recent activity</h3>
          <ul className="mt-2 space-y-2">
            {history.map((activity) => (
              <li key={activity.id} className="rounded-xl border border-border/70 px-3 py-2">
                <p className="text-sm font-semibold text-ink">{activity.title}</p>
                <p className="text-xs text-ink-subtle">{timeAgo(activity.occurredAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
