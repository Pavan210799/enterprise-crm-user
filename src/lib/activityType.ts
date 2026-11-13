import { ArrowUpRight, Mail, Phone, StickyNote, Users, type LucideIcon } from 'lucide-react'
import type { ActivityType } from '@/types'

export const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: LucideIcon; tint: string; color: string }[] = [
  { value: 'call', label: 'Call', icon: Phone, tint: 'bg-aurora-soft text-aurora-deep', color: '#0891B2' },
  { value: 'email', label: 'Email', icon: Mail, tint: 'bg-brand-soft text-brand', color: '#7C3AED' },
  { value: 'meeting', label: 'Meeting', icon: Users, tint: 'bg-fuchsia-100 text-orchid', color: '#C026D3' },
  { value: 'follow_up', label: 'Follow-up', icon: ArrowUpRight, tint: 'bg-success-soft text-emerald-700', color: '#10B981' },
  { value: 'note', label: 'Note', icon: StickyNote, tint: 'bg-warning-soft text-amber-700', color: '#F59E0B' },
]

export function activityMeta(type: ActivityType) {
  return ACTIVITY_TYPES.find((item) => item.value === type) ?? ACTIVITY_TYPES[0]!
}
