import { Shield } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { can, type Permission } from '@/lib/permissions'

type Area = 'leads' | 'customers' | 'pipeline' | 'activities'

const COPY: Record<Area, { permission: Permission; allowed: string; limited: string }> = {
  leads: {
    permission: 'leads.delete',
    allowed: 'You can create leads, update status, schedule follow-ups, and delete records.',
    limited: 'You can create leads, update status, and schedule follow-ups. Deleting a lead is limited to sales representatives and managers.',
  },
  customers: {
    permission: 'customers.delete',
    allowed: 'You can create and update profiles, log interactions, and delete customers.',
    limited: 'You can create and update profiles and log every interaction. Deleting a customer is limited to managers.',
  },
  pipeline: {
    permission: 'deals.delete',
    allowed: 'You can create, edit, move, and delete deals.',
    limited: 'You can create, edit, and move deals between stages. Deleting a deal is limited to sales representatives and managers.',
  },
  activities: {
    permission: 'activities.delete',
    allowed: 'You can log, edit, and delete activities.',
    limited: 'You can log and edit calls, meetings, emails, and follow-ups. Deleting an activity is limited to sales representatives and managers.',
  },
}

export function RoleAccessNote({ area }: { area: Area }) {
  const user = useAppSelector((state) => state.auth.user)
  if (!user) return null
  const copy = COPY[area]

  return (
    <p className="flex items-start gap-2 rounded-2xl border border-border/80 bg-surface/80 px-4 py-3 text-sm text-ink-muted">
      <Shield className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
      <span>
        <span className="font-semibold text-ink">{user.roleLabel}.</span> {can(user.role, copy.permission) ? copy.allowed : copy.limited}
      </span>
    </p>
  )
}
