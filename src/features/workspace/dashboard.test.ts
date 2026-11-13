import { describe, expect, it } from 'vitest'
import { makeStore } from '@/app/store'
import { selectKpis } from '@/features/workspace/workspaceSelectors'
import type { AuthUser } from '@/types'

function user(role: AuthUser['role'], roleLabel: string): AuthUser {
  return {
    id: role,
    name: roleLabel,
    email: `${role}@nexrel.io`,
    company: 'NexRel Inc.',
    role,
    roleLabel,
  }
}

describe('dashboard kpis', () => {
  it('uses the same book for every signed-in user', () => {
    const employee = makeStore({
      auth: { user: user('employee', 'Employee'), status: 'idle', error: null },
    })
    const manager = makeStore({
      auth: { user: user('manager', 'Manager'), status: 'idle', error: null },
    })
    expect(selectKpis(employee.getState())).toEqual(selectKpis(manager.getState()))
  })

  it('counts the workspace the dashboard is built from', () => {
    const kpis = selectKpis(makeStore().getState())
    expect(kpis.assignedLeads).toBe(12)
    expect(kpis.activeCustomers).toBe(7)
    expect(kpis.ongoingDeals).toBe(7)
    expect(kpis.pendingTasks).toBe(6)
    expect(kpis.completedDeals).toBe(2)
    expect(kpis.wonRevenue).toBe(74000)
    expect(kpis.conversion).toBeCloseTo(16.666, 2)
    expect(kpis.taskCompletion).toBe(40)
  })
})
