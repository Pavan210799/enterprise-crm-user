import {
  Activity,
  BarChart3,
  Bell,
  CheckSquare,
  GitBranch,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

export const APP_NAME = 'NexRel'

export const ROLE_LABEL: Record<UserRole, string> = {
  employee: 'Employee',
  sales_representative: 'Sales Representative',
  manager: 'Manager',
}

const ALL_ROLES: UserRole[] = ['employee', 'sales_representative', 'manager']

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  roles: UserRole[]
  description: string
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        end: true,
        roles: ALL_ROLES,
        description: 'Assigned leads, customers, deals, tasks, and performance.',
      },
      {
        to: '/reports',
        label: 'Reports',
        icon: BarChart3,
        roles: ALL_ROLES,
        description: 'Personal sales performance, conversion, and task statistics.',
      },
    ],
  },
  {
    title: 'Sales',
    items: [
      {
        to: '/leads',
        label: 'Leads',
        icon: UserPlus,
        roles: ALL_ROLES,
        description: 'Leads assigned to you, with status and follow-ups.',
      },
      {
        to: '/pipeline',
        label: 'Pipeline',
        icon: GitBranch,
        roles: ALL_ROLES,
        description: 'Deals moving across your sales stages.',
      },
      {
        to: '/customers',
        label: 'Customers',
        icon: Users,
        roles: ALL_ROLES,
        description: 'Profiles, contacts, history, and related deals.',
      },
    ],
  },
  {
    title: 'Work',
    items: [
      {
        to: '/tasks',
        label: 'Tasks',
        icon: CheckSquare,
        roles: ALL_ROLES,
        description: 'Tasks with priority, deadlines, and completion.',
      },
      {
        to: '/activities',
        label: 'Activities',
        icon: Activity,
        roles: ALL_ROLES,
        description: 'Calls, meetings, emails, and follow-ups.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        to: '/notifications',
        label: 'Notifications',
        icon: Bell,
        roles: ALL_ROLES,
        description: 'Assignments, reminders, meetings, and updates.',
      },
      {
        to: '/settings',
        label: 'Profile',
        icon: Settings,
        roles: ALL_ROLES,
        description: 'Personal information, account settings, and password.',
      },
    ],
  },
]

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items)

export function navForRole(role: UserRole) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}

export function canAccessPath(role: UserRole, pathname: string) {
  const item = navItemForPath(pathname)
  if (!item) return true
  return item.roles.includes(role)
}

export function navItemForPath(pathname: string) {
  if (pathname === '/') return NAV_ITEMS[0]
  return NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to))
}
