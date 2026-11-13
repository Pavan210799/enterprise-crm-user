import type { LeadStatus } from '@/types'
import type { BadgeVariant } from '@/components/ui/Badge'

export const LEAD_SOURCES = ['Website', 'Referral', 'Event', 'Outbound', 'Partner']

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export const leadStatusVariant: Record<LeadStatus, BadgeVariant> = {
  new: 'aurora',
  contacted: 'brand',
  qualified: 'default',
  proposal: 'warning',
  won: 'success',
  lost: 'danger',
}

export function leadStatusLabel(status: LeadStatus) {
  return LEAD_STATUSES.find((item) => item.value === status)?.label ?? status
}

export function isOpenFollowUp(status: LeadStatus, nextFollowUp: string, today: string) {
  if (status === 'won' || status === 'lost') return false
  return Boolean(nextFollowUp) && nextFollowUp <= today
}
