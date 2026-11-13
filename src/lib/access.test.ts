import { describe, expect, it } from 'vitest'
import { canAccessPath, navForRole } from '@/lib/constants'

const SHARED = ['/', '/reports', '/leads', '/pipeline', '/customers', '/tasks', '/activities', '/notifications', '/settings']

function paths(role: Parameters<typeof navForRole>[0]) {
  return navForRole(role).flatMap((section) => section.items.map((item) => item.to))
}

describe('workspace access', () => {
  it('shows the same navigation to every signed-in user', () => {
    expect(paths('employee')).toEqual(SHARED)
    expect(paths('sales_representative')).toEqual(SHARED)
    expect(paths('manager')).toEqual(SHARED)
    expect(canAccessPath('employee', '/leads')).toBe(true)
    expect(canAccessPath('employee', '/reports')).toBe(true)
  })
})
