import { describe, expect, it } from 'vitest'
import { makeStore } from './store'
import { addDeal, addLead, addTask, logActivity, moveDeal, updateTask } from '@/features/workspace/workspaceSlice'
import { createWorkspace, dateInputFromOffset } from '@/data/workspace'

const freshStore = () => makeStore({ workspace: createWorkspace() })

describe('notification listeners', () => {
  it('alerts on a won deal', () => {
    const store = freshStore()
    const deal = store.getState().workspace.deals.find((item) => item.stage === 'negotiation')!
    store.dispatch(moveDeal({ id: deal.id, stage: 'closed_won' }))
    const [latest] = store.getState().workspace.notifications
    expect(latest?.kind).toBe('deal')
    expect(latest?.title).toBe('Deal won')
    expect(latest?.read).toBe(false)
  })

  it('ignores a move to the same stage', () => {
    const store = freshStore()
    const deal = store.getState().workspace.deals[0]!
    const before = store.getState().workspace.notifications.length
    store.dispatch(moveDeal({ id: deal.id, stage: deal.stage }))
    expect(store.getState().workspace.notifications).toHaveLength(before)
  })

  it('announces new leads, deals, and task reminders', () => {
    const store = freshStore()
    store.dispatch(
      addLead({ name: 'Ada Moss', company: 'Moss Studio', email: 'ada@moss.studio', phone: '+1 415 555 0100', status: 'new', source: 'Website', estimatedValue: 0, notes: '', nextFollowUp: '' }),
    )
    expect(store.getState().workspace.notifications[0]?.title).toBe('New lead assigned')

    store.dispatch(addDeal({ title: 'Pilot', company: 'Moss Studio', value: 5000, stage: 'prospecting', probability: 10, expectedClose: dateInputFromOffset(20) }))
    expect(store.getState().workspace.notifications[0]?.kind).toBe('deal')

    store.dispatch(addTask({ title: 'Call Ada', description: '', priority: 'high', status: 'todo', dueDate: dateInputFromOffset(0), relatedTo: 'Moss Studio' }))
    const reminder = store.getState().workspace.notifications[0]
    expect(reminder?.kind).toBe('task')
    expect(reminder?.title).toBe('Task reminder')
  })

  it('raises a meeting alert only for future meetings', () => {
    const store = freshStore()
    const count = () => store.getState().workspace.notifications.length
    const before = count()
    store.dispatch(logActivity({ type: 'meeting', title: 'Past sync', description: '', relatedTo: 'Orchard Bank', occurredAt: new Date(Date.now() - 3_600_000).toISOString() }))
    expect(count()).toBe(before)
    store.dispatch(logActivity({ type: 'meeting', title: 'Renewal review', description: '', relatedTo: 'Orchard Bank', occurredAt: new Date(Date.now() + 86_400_000).toISOString() }))
    expect(count()).toBe(before + 1)
    expect(store.getState().workspace.notifications[0]?.kind).toBe('meeting')
  })

  it('does not notify on routine task edits', () => {
    const store = freshStore()
    const task = store.getState().workspace.tasks[0]!
    const before = store.getState().workspace.notifications.length
    store.dispatch(updateTask({ id: task.id, values: { ...task, title: 'Renamed' } }))
    expect(store.getState().workspace.notifications).toHaveLength(before)
  })
})
