import { createSelector } from '@reduxjs/toolkit'
import { ACTIVITY_TYPES } from '@/lib/activityType'
import { TASK_PRIORITIES } from '@/lib/taskMeta'
import { daysUntil } from '@/lib/format'
import { LEAD_STATUS_META, selectActivities, selectDeals, selectTasks } from './workspaceSelectors'
import type { WorkspaceState } from './workspaceSlice'
import type { LeadStatus, TaskPriority } from '@/types'

type State = { workspace: WorkspaceState }

const selectLeads = (state: State) => state.workspace.leads
const selectCustomers = (state: State) => state.workspace.customers

const FUNNEL_ORDER: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won']

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#22D3EE',
  medium: '#7C3AED',
  high: '#F59E0B',
  urgent: '#EF4444',
}

export const selectLeadSources = createSelector([selectLeads], (leads) => {
  const counts = new Map<string, { leads: number; won: number }>()
  for (const lead of leads) {
    const entry = counts.get(lead.source) ?? { leads: 0, won: 0 }
    entry.leads += 1
    if (lead.status === 'won') entry.won += 1
    counts.set(lead.source, entry)
  }
  return [...counts.entries()].map(([source, entry]) => ({ source, ...entry })).sort((a, b) => b.leads - a.leads || a.source.localeCompare(b.source))
})

// a lead sitting in a later stage has already passed through every earlier one
export const selectConversionFunnel = createSelector([selectLeads], (leads) => {
  const active = leads.filter((lead) => lead.status !== 'lost')
  const reached = (status: LeadStatus) => active.filter((lead) => FUNNEL_ORDER.indexOf(lead.status) >= FUNNEL_ORDER.indexOf(status)).length
  const top = Math.max(1, reached('new'))
  return FUNNEL_ORDER.map((status) => {
    const meta = LEAD_STATUS_META.find((item) => item.value === status)!
    const count = reached(status)
    return { status, label: meta.label, color: meta.color, count, pct: Math.round((count / top) * 100) }
  })
})

export const selectLeadRates = createSelector([selectLeads], (leads) => {
  const won = leads.filter((lead) => lead.status === 'won').length
  const lost = leads.filter((lead) => lead.status === 'lost').length
  const decided = won + lost
  return {
    total: leads.length,
    won,
    lost,
    conversion: leads.length ? Math.round((won / leads.length) * 100) : 0,
    closeRate: decided ? Math.round((won / decided) * 100) : 0,
  }
})

export const selectTaskStats = createSelector([selectTasks], (tasks) => {
  const byPriority = TASK_PRIORITIES.map((priority) => {
    const items = tasks.filter((task) => task.priority === priority.value)
    const completed = items.filter((task) => task.status === 'completed').length
    return { priority: priority.value, label: priority.label, color: PRIORITY_COLORS[priority.value], completed, open: items.length - completed }
  })
  const open = tasks.filter((task) => task.status !== 'completed')
  const completed = tasks.length - open.length
  return {
    byPriority,
    total: tasks.length,
    completed,
    open: open.length,
    inProgress: tasks.filter((task) => task.status === 'in_progress').length,
    overdue: open.filter((task) => daysUntil(task.dueDate) < 0).length,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  }
})

export const selectActivityMix = createSelector([selectActivities], (activities) => {
  const now = Date.now()
  const past = activities.filter((activity) => new Date(activity.occurredAt).getTime() <= now)
  return ACTIVITY_TYPES.map((type) => ({
    type: type.value,
    name: type.label,
    color: type.color,
    value: past.filter((activity) => activity.type === type.value).length,
  }))
})

export const selectDealOutcomes = createSelector([selectDeals, selectCustomers], (deals, customers) => {
  const names = new Map(customers.map((customer) => [customer.id, customer.name]))
  const closed = deals
    .filter((deal) => deal.stage === 'closed_won' || deal.stage === 'closed_lost')
    .sort((a, b) => b.expectedClose.localeCompare(a.expectedClose) || a.title.localeCompare(b.title))
    .map((deal) => ({ ...deal, won: deal.stage === 'closed_won', customerName: deal.customerId ? names.get(deal.customerId) : undefined }))
  const won = closed.filter((deal) => deal.won)
  const wonValue = won.reduce((sum, deal) => sum + deal.value, 0)
  const lostValue = closed.reduce((sum, deal) => sum + (deal.won ? 0 : deal.value), 0)
  return {
    closed,
    wonCount: won.length,
    lostCount: closed.length - won.length,
    wonValue,
    lostValue,
    avgWon: won.length ? Math.round(wonValue / won.length) : 0,
    winRate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
  }
})
