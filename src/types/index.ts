export type UserRole = 'employee' | 'sales_representative' | 'manager'

export interface AuthUser {
  id: string
  name: string
  email: string
  company: string
  role: UserRole
  roleLabel: string
  phone?: string
  jobTitle?: string
  location?: string
  bio?: string
  timezone?: string
  joinedAt?: string
  passwordChangedAt?: string
}

export interface ProfileInput {
  name: string
  email: string
  phone: string
  jobTitle: string
  location: string
  bio: string
  timezone: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

export type CustomerStatus = 'active' | 'inactive'

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 'todo' | 'in_progress' | 'completed'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'follow_up'

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  source: string
  estimatedValue: number
  notes: string
  nextFollowUp: string
  customerId?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  jobTitle: string
  location: string
  status: CustomerStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  company: string
  customerId?: string
  value: number
  stage: DealStage
  probability: number
  expectedClose: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  relatedTo: string
  createdAt: string
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  customerId?: string
  relatedTo: string
  occurredAt: string
}

export interface PerformanceMonth {
  month: string
  revenue: number
  target: number
  leads: number
  converted: number
}

export type NotificationKind = 'lead' | 'deal' | 'task' | 'meeting' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  createdAt: string
  read: boolean
  link?: string
}
