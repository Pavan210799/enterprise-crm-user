import type { BadgeVariant } from '@/components/ui/Badge'
import type { TaskPriority, TaskStatus } from '@/types'

export const TASK_PRIORITIES: { value: TaskPriority; label: string; variant: BadgeVariant; accent: string }[] = [
  { value: 'low', label: 'Low', variant: 'aurora', accent: 'bg-aurora' },
  { value: 'medium', label: 'Medium', variant: 'brand', accent: 'bg-brand' },
  { value: 'high', label: 'High', variant: 'warning', accent: 'bg-warning' },
  { value: 'urgent', label: 'Urgent', variant: 'danger', accent: 'bg-danger' },
]

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

export function priorityMeta(priority: TaskPriority) {
  return TASK_PRIORITIES.find((item) => item.value === priority) ?? TASK_PRIORITIES[1]!
}
