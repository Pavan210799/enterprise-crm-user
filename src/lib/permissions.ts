import type { UserRole } from '@/types'

export type Permission =
  | 'leads.create'
  | 'leads.edit'
  | 'leads.status'
  | 'leads.followUp'
  | 'leads.delete'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'customers.interact'
  | 'deals.create'
  | 'deals.edit'
  | 'deals.move'
  | 'deals.delete'
  | 'tasks.manage'
  | 'activities.log'
  | 'activities.edit'
  | 'activities.delete'

const EMPLOYEE: Permission[] = [
  'leads.create',
  'leads.edit',
  'leads.status',
  'leads.followUp',
  'customers.create',
  'customers.edit',
  'customers.interact',
  'deals.create',
  'deals.edit',
  'deals.move',
  'tasks.manage',
  'activities.log',
  'activities.edit',
]

const SALES: Permission[] = [...EMPLOYEE, 'leads.delete', 'deals.delete', 'activities.delete']
const MANAGER: Permission[] = [...SALES, 'customers.delete']

const MATRIX: Record<UserRole, readonly Permission[]> = {
  employee: EMPLOYEE,
  sales_representative: SALES,
  manager: MANAGER,
}

export const PERMISSION_GROUPS: { module: string; items: { permission: Permission; label: string }[] }[] = [
  {
    module: 'Leads',
    items: [
      { permission: 'leads.create', label: 'Create and edit leads' },
      { permission: 'leads.followUp', label: 'Update status and log follow-ups' },
      { permission: 'leads.delete', label: 'Delete leads' },
    ],
  },
  {
    module: 'Customers',
    items: [
      { permission: 'customers.create', label: 'Create and edit customers' },
      { permission: 'customers.interact', label: 'Log customer interactions' },
      { permission: 'customers.delete', label: 'Delete customers' },
    ],
  },
  {
    module: 'Pipeline',
    items: [
      { permission: 'deals.create', label: 'Create and edit deals' },
      { permission: 'deals.move', label: 'Move deals between stages' },
      { permission: 'deals.delete', label: 'Delete deals' },
    ],
  },
  {
    module: 'Tasks & activities',
    items: [
      { permission: 'tasks.manage', label: 'Create, complete, and delete tasks' },
      { permission: 'activities.log', label: 'Log and edit activities' },
      { permission: 'activities.delete', label: 'Delete activities' },
    ],
  },
]

export function can(role: UserRole | undefined, permission: Permission) {
  if (!role) return false
  return MATRIX[role].includes(permission)
}
