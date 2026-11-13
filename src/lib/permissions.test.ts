import { describe, expect, it } from 'vitest'
import { can } from './permissions'

describe('role permissions', () => {
  it('lets every role work the book', () => {
    for (const role of ['employee', 'sales_representative', 'manager'] as const) {
      expect(can(role, 'leads.create')).toBe(true)
      expect(can(role, 'leads.edit')).toBe(true)
      expect(can(role, 'leads.status')).toBe(true)
      expect(can(role, 'leads.followUp')).toBe(true)
      expect(can(role, 'customers.create')).toBe(true)
      expect(can(role, 'customers.edit')).toBe(true)
      expect(can(role, 'customers.interact')).toBe(true)
      expect(can(role, 'deals.create')).toBe(true)
      expect(can(role, 'deals.edit')).toBe(true)
      expect(can(role, 'deals.move')).toBe(true)
      expect(can(role, 'tasks.manage')).toBe(true)
      expect(can(role, 'activities.log')).toBe(true)
      expect(can(role, 'activities.edit')).toBe(true)
    }
  })

  it('reserves deal and activity deletion for sales representatives and managers', () => {
    for (const permission of ['deals.delete', 'activities.delete'] as const) {
      expect(can('employee', permission)).toBe(false)
      expect(can('sales_representative', permission)).toBe(true)
      expect(can('manager', permission)).toBe(true)
    }
  })

  it('reserves lead deletion for sales representatives and managers', () => {
    expect(can('employee', 'leads.delete')).toBe(false)
    expect(can('sales_representative', 'leads.delete')).toBe(true)
    expect(can('manager', 'leads.delete')).toBe(true)
  })

  it('reserves customer deletion for managers', () => {
    expect(can('employee', 'customers.delete')).toBe(false)
    expect(can('sales_representative', 'customers.delete')).toBe(false)
    expect(can('manager', 'customers.delete')).toBe(true)
    expect(can(undefined, 'customers.delete')).toBe(false)
  })
})
