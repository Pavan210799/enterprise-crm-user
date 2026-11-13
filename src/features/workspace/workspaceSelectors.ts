import { createSelector } from '@reduxjs/toolkit'
import { KPI_PREVIOUS } from '@/data/workspace'
import { DEAL_STAGES, OPEN_STAGES } from '@/lib/dealStage'
import { daysUntil, percentChange } from '@/lib/format'
import type { WorkspaceState } from '@/features/workspace/workspaceSlice'
import type { LeadStatus, NotificationKind } from '@/types'

type State = { workspace: WorkspaceState }

const selectLeads = (state: State) => state.workspace.leads
const selectCustomers = (state: State) => state.workspace.customers
export const selectDeals = (state: State) => state.workspace.deals
export const selectTasks = (state: State) => state.workspace.tasks
export const selectActivities = (state: State) => state.workspace.activities
const selectNotificationList = (state: State) => state.workspace.notifications
const selectPerformanceHistory = (state: State) => state.workspace.performance

export const selectNotifications = createSelector([selectNotificationList], (notifications) =>
  [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
)

export const LEAD_STATUS_META: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#22D3EE' },
  { value: 'contacted', label: 'Contacted', color: '#38BDF8' },
  { value: 'qualified', label: 'Qualified', color: '#A78BFA' },
  { value: 'proposal', label: 'Proposal', color: '#7C3AED' },
  { value: 'won', label: 'Won', color: '#10B981' },
  { value: 'lost', label: 'Lost', color: '#CBD5E1' },
]

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export const selectKpis = createSelector([selectLeads, selectCustomers, selectDeals, selectTasks], (leads, customers, deals, tasks) => {
  const ongoing = deals.filter((deal) => OPEN_STAGES.includes(deal.stage))
  const wonDeals = deals.filter((deal) => deal.stage === 'closed_won')
  const pending = tasks.filter((task) => task.status !== 'completed')
  const completed = tasks.length - pending.length
  const wonLeads = leads.filter((lead) => lead.status === 'won').length
  const activeCustomers = customers.filter((customer) => customer.status === 'active').length

  return {
    assignedLeads: leads.length,
    activeCustomers,
    ongoingDeals: ongoing.length,
    ongoingValue: sum(ongoing.map((deal) => deal.value)),
    pendingTasks: pending.length,
    wonRevenue: sum(wonDeals.map((deal) => deal.value)),
    completedDeals: wonDeals.length,
    conversion: leads.length ? (wonLeads / leads.length) * 100 : 0,
    taskCompletion: tasks.length ? (completed / tasks.length) * 100 : 0,
    changes: {
      assignedLeads: percentChange(leads.length, KPI_PREVIOUS.assignedLeads),
      activeCustomers: percentChange(activeCustomers, KPI_PREVIOUS.activeCustomers),
      ongoingDeals: percentChange(ongoing.length, KPI_PREVIOUS.ongoingDeals),
      pendingTasks: percentChange(pending.length, KPI_PREVIOUS.pendingTasks),
    },
  }
})

/** Monthly history where the current month reflects the live book, so wins and lead changes show up in charts. */
export const selectPerformance = createSelector([selectPerformanceHistory, selectKpis, selectLeads], (history, kpis, leads) => {
  if (!history.length) return history
  const current = history[history.length - 1]
  return [
    ...history.slice(0, -1),
    { ...current, revenue: kpis.wonRevenue, leads: leads.length, converted: leads.filter((lead) => lead.status === 'won').length },
  ]
})

export const selectTodayFocus = createSelector([selectTasks], (tasks) => {
  const open = tasks.filter((task) => task.status !== 'completed')
  return {
    dueToday: open.filter((task) => daysUntil(task.dueDate) === 0).length,
    overdue: open.filter((task) => daysUntil(task.dueDate) < 0).length,
    open: open.length,
  }
})

export const selectLeadFunnel = createSelector([selectLeads], (leads) =>
  LEAD_STATUS_META.map((status) => ({
    ...status,
    name: status.label,
    value: leads.filter((lead) => lead.status === status.value).length,
  })),
)

export const selectPipelineStages = createSelector([selectDeals], (deals) =>
  DEAL_STAGES.map((stage) => {
    const items = deals.filter((deal) => deal.stage === stage.value)
    return {
      ...stage,
      count: items.length,
      value: sum(items.map((deal) => deal.value)),
    }
  }),
)

export const selectUpcomingTasks = createSelector([selectTasks], (tasks) =>
  tasks
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.title.localeCompare(b.title))
    .slice(0, 5),
)

export const selectRecentActivities = createSelector([selectActivities, selectCustomers], (activities, customers) => {
  const names = new Map(customers.map((customer) => [customer.id, customer.name]))
  const now = Date.now()
  return activities
    .filter((activity) => new Date(activity.occurredAt).getTime() <= now)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 6)
    .map((activity) => ({
      ...activity,
      customerName: activity.customerId ? names.get(activity.customerId) : undefined,
    }))
})

export const selectUnreadCount = createSelector([selectNotificationList], (notifications) => notifications.filter((item) => !item.read).length)

export const selectNavBadges = createSelector([selectLeads, selectTasks, selectUnreadCount], (leads, tasks, unread) => ({
  '/leads': leads.filter((lead) => lead.status === 'new').length,
  '/tasks': tasks.filter((task) => task.status !== 'completed' && daysUntil(task.dueDate) < 0).length,
  '/notifications': unread,
}))

export const selectPipelineSummary = createSelector([selectDeals], (deals) => {
  const open = deals.filter((deal) => OPEN_STAGES.includes(deal.stage))
  const won = deals.filter((deal) => deal.stage === 'closed_won')
  const lost = deals.filter((deal) => deal.stage === 'closed_lost')
  const closed = won.length + lost.length
  return {
    openCount: open.length,
    openValue: sum(open.map((deal) => deal.value)),
    weighted: sum(open.map((deal) => (deal.value * deal.probability) / 100)),
    wonCount: won.length,
    wonValue: sum(won.map((deal) => deal.value)),
    winRate: closed ? Math.round((won.length / closed) * 100) : 0,
  }
})

export const selectTaskSummary = createSelector([selectTasks], (tasks) => {
  const open = tasks.filter((task) => task.status !== 'completed')
  return {
    total: tasks.length,
    open: open.length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    completed: tasks.length - open.length,
    overdue: open.filter((task) => daysUntil(task.dueDate) < 0).length,
    dueToday: open.filter((task) => daysUntil(task.dueDate) === 0).length,
  }
})

export const selectNotificationCounts = createSelector([selectNotificationList], (notifications) => {
  const byKind = { lead: 0, deal: 0, task: 0, meeting: 0, system: 0 } satisfies Record<NotificationKind, number>
  for (const item of notifications) byKind[item.kind] += 1
  return { all: notifications.length, unread: notifications.filter((item) => !item.read).length, ...byKind }
})
