import { describe, expect, it } from 'vitest'
import {
  addDeal,
  addTask,
  clearReadNotifications,
  deleteActivity,
  deleteDeal,
  deleteNotification,
  logActivity,
  markAllNotificationsRead,
  moveDeal,
  pushNotification,
  setNotificationRead,
  setTaskStatus,
  toggleTaskComplete,
  updateDeal,
  workspaceReducer,
} from './workspaceSlice'
import { selectKpis, selectNavBadges, selectPipelineSummary, selectRecentActivities, selectTaskSummary } from './workspaceSelectors'
import { createWorkspace, dateInputFromOffset } from '@/data/workspace'

const start = createWorkspace(new Date())

describe('sales pipeline', () => {
  it('creates a deal and counts it in the open pipeline', () => {
    const next = workspaceReducer(
      start,
      addDeal({ title: 'Pilot rollout', company: 'Moss Studio', value: 20000, stage: 'proposal', probability: 50, expectedClose: '2026-12-01' }),
    )
    expect(next.deals[0]?.title).toBe('Pilot rollout')
    expect(selectPipelineSummary({ workspace: next }).openValue).toBe(selectPipelineSummary({ workspace: start }).openValue + 20000)
  })

  it('moves a deal and resets probability to the stage default', () => {
    const deal = start.deals.find((item) => item.stage === 'negotiation')!
    const next = workspaceReducer(start, moveDeal({ id: deal.id, stage: 'closed_won' }))
    const moved = next.deals.find((item) => item.id === deal.id)!
    expect(moved.stage).toBe('closed_won')
    expect(moved.probability).toBe(100)
    expect(selectKpis({ workspace: next }).completedDeals).toBe(selectKpis({ workspace: start }).completedDeals + 1)
  })

  it('updates and deletes deals', () => {
    const deal = start.deals[0]!
    const edited = workspaceReducer(start, updateDeal({ id: deal.id, values: { ...deal, value: 99000, customerId: undefined } }))
    expect(edited.deals.find((item) => item.id === deal.id)?.value).toBe(99000)
    const removed = workspaceReducer(edited, deleteDeal(deal.id))
    expect(removed.deals).toHaveLength(start.deals.length - 1)
  })
})

describe('task management', () => {
  it('creates, completes, and reopens tasks', () => {
    const created = workspaceReducer(
      start,
      addTask({ title: 'Prep QBR deck', description: '', priority: 'urgent', status: 'todo', dueDate: '2099-01-01', relatedTo: 'Orchard Bank' }),
    )
    const task = created.tasks[0]!
    expect(task.priority).toBe('urgent')
    expect(selectTaskSummary({ workspace: created }).open).toBe(selectTaskSummary({ workspace: start }).open + 1)

    const done = workspaceReducer(created, toggleTaskComplete(task.id))
    expect(done.tasks[0]?.status).toBe('completed')
    const reopened = workspaceReducer(done, toggleTaskComplete(task.id))
    expect(reopened.tasks[0]?.status).toBe('todo')
    const progressing = workspaceReducer(reopened, setTaskStatus({ id: task.id, status: 'in_progress' }))
    expect(progressing.tasks[0]?.status).toBe('in_progress')
  })

  it('clears the overdue nav badge when the overdue task is completed', () => {
    const overdue = start.tasks.filter((task) => task.status !== 'completed' && task.dueDate < dateInputFromOffset(0))
    expect(selectNavBadges({ workspace: start })['/tasks']).toBe(1)
    const next = overdue.reduce((state, task) => workspaceReducer(state, toggleTaskComplete(task.id)), start)
    expect(selectNavBadges({ workspace: next })['/tasks']).toBe(0)
  })
})

describe('activity tracking', () => {
  it('logs activities and keeps scheduled ones off the recent list', () => {
    const future = new Date(Date.now() + 3 * 86_400_000).toISOString()
    const next = workspaceReducer(start, logActivity({ type: 'meeting', title: 'Renewal review', description: '', relatedTo: 'Orchard Bank', customerId: 'cus_01', occurredAt: future }))
    expect(next.activities[0]?.title).toBe('Renewal review')
    expect(selectRecentActivities({ workspace: next }).some((item) => item.title === 'Renewal review')).toBe(false)

    const removed = workspaceReducer(next, deleteActivity(next.activities[0]!.id))
    expect(removed.activities).toHaveLength(start.activities.length)
  })
})

describe('notifications', () => {
  it('pushes, reads, and clears notifications', () => {
    const pushed = workspaceReducer(start, pushNotification({ kind: 'deal', title: 'Deal won', message: 'Marlow renewal closed.' }))
    expect(pushed.notifications[0]?.read).toBe(false)
    expect(selectNavBadges({ workspace: pushed })['/notifications']).toBe(4)

    const one = workspaceReducer(pushed, setNotificationRead({ id: pushed.notifications[0]!.id, read: true }))
    expect(selectNavBadges({ workspace: one })['/notifications']).toBe(3)

    const all = workspaceReducer(one, markAllNotificationsRead())
    expect(all.notifications.every((item) => item.read)).toBe(true)

    const cleared = workspaceReducer(all, clearReadNotifications())
    expect(cleared.notifications).toHaveLength(0)
  })

  it('deletes a single notification', () => {
    const next = workspaceReducer(start, deleteNotification('note_01'))
    expect(next.notifications.some((item) => item.id === 'note_01')).toBe(false)
  })
})
