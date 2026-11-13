import { Badge } from '@/components/ui/Badge'
import { leadStatusLabel, leadStatusVariant } from '@/lib/leadStatus'
import type { LeadStatus } from '@/types'

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={leadStatusVariant[status]} dot>
      {leadStatusLabel(status)}
    </Badge>
  )
}
