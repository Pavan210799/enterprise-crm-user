import { Bell, CalendarClock, CheckSquare, GitBranch, UserPlus, type LucideIcon } from 'lucide-react'
import type { NotificationKind } from '@/types'

export const NOTIFICATION_KINDS: { value: NotificationKind; label: string; icon: LucideIcon; tint: string }[] = [
  { value: 'lead', label: 'Lead assignments', icon: UserPlus, tint: 'bg-aurora-soft text-aurora-deep' },
  { value: 'task', label: 'Task reminders', icon: CheckSquare, tint: 'bg-warning-soft text-amber-700' },
  { value: 'meeting', label: 'Meeting alerts', icon: CalendarClock, tint: 'bg-fuchsia-100 text-orchid' },
  { value: 'deal', label: 'Deal updates', icon: GitBranch, tint: 'bg-brand-soft text-brand' },
  { value: 'system', label: 'System', icon: Bell, tint: 'bg-canvas-muted text-ink-muted' },
]

export function notificationMeta(kind: NotificationKind) {
  return NOTIFICATION_KINDS.find((item) => item.value === kind) ?? NOTIFICATION_KINDS[NOTIFICATION_KINDS.length - 1]!
}
