import { describe, expect, it } from 'vitest'
import { workspaceReducer, addCustomer, addInteraction, addLead, convertLead, deleteCustomer, deleteLead, logFollowUp, updateLeadStatus } from './workspaceSlice'
import { createWorkspace } from '@/data/workspace'
import { selectKpis } from './workspaceSelectors'

const start = createWorkspace(new Date('2026-11-11T12:00:00'))

describe('lead and customer records', () => {
  it('creates a lead and counts it on the shared dashboard', () => {
    const next = workspaceReducer(
      start,
      addLead({
        name: 'Ada Moss',
        company: 'Moss Studio',
        email: 'ada@moss.studio',
        phone: '+1 415 555 0100',
        status: 'new',
        source: 'Website',
        estimatedValue: 12000,
        notes: 'Asked for pricing.',
        nextFollowUp: '2026-11-12',
      }),
    )
    expect(next.leads[0]?.name).toBe('Ada Moss')
    expect(next.leads).toHaveLength(start.leads.length + 1)
    const kpis = selectKpis({ workspace: next })
    expect(kpis.assignedLeads).toBe(13)
  })

  it('logs a follow-up and moves a new lead to contacted', () => {
    const lead = start.leads.find((item) => item.status === 'new')
    expect(lead).toBeTruthy()
    const next = workspaceReducer(start, logFollowUp({ id: lead!.id, nextFollowUp: '2026-11-18', note: 'Left a voicemail.' }))
    const updated = next.leads.find((item) => item.id === lead!.id)
    expect(updated?.status).toBe('contacted')
    expect(updated?.nextFollowUp).toBe('2026-11-18')
    expect(updated?.notes).toBe('Left a voicemail.')
    expect(next.activities[0]?.type).toBe('follow_up')
    expect(next.activities[0]?.relatedTo).toBe(lead!.company)
  })

  it('converts a lead into an active customer profile', () => {
    const lead = start.leads.find((item) => item.id === 'lead_01')!
    const next = workspaceReducer(start, convertLead(lead))
    const updated = next.leads.find((item) => item.id === 'lead_01')
    expect(updated?.status).toBe('won')
    expect(updated?.customerId).toBeTruthy()
    const customer = next.customers.find((item) => item.id === updated?.customerId)
    expect(customer?.email).toBe(lead.email)
    expect(customer?.status).toBe('active')
    expect(selectKpis({ workspace: next }).activeCustomers).toBe(8)
  })

  it('updates status, deletes a lead, and keeps customer deletion from removing deals', () => {
    const status = workspaceReducer(start, updateLeadStatus({ id: 'lead_04', status: 'qualified' }))
    expect(status.leads.find((item) => item.id === 'lead_04')?.status).toBe('qualified')

    const withoutLead = workspaceReducer(status, deleteLead('lead_04'))
    expect(withoutLead.leads.some((item) => item.id === 'lead_04')).toBe(false)

    const created = workspaceReducer(
      start,
      addCustomer({
        name: 'Imani Cole',
        company: 'Cole Goods',
        email: 'imani@colegoods.com',
        phone: '+1 404 555 0199',
        jobTitle: 'Owner',
        location: 'Atlanta, GA',
        status: 'active',
        notes: 'New account.',
      }),
    )
    const customer = created.customers[0]!
    const withNote = workspaceReducer(created, addInteraction({ customerId: customer.id, type: 'call', title: 'Intro call', description: 'Wants a pilot.' }))
    expect(withNote.activities[0]?.relatedTo).toBe('Cole Goods')
    expect(withNote.activities[0]?.customerId).toBe(customer.id)

    const removed = workspaceReducer(withNote, deleteCustomer('cus_01'))
    expect(removed.customers.some((item) => item.id === 'cus_01')).toBe(false)
    expect(removed.deals.some((deal) => deal.id === 'deal_01')).toBe(true)
    expect(removed.deals.find((deal) => deal.id === 'deal_01')?.customerId).toBeUndefined()
    expect(removed.activities.some((activity) => activity.customerId === 'cus_01')).toBe(false)
    expect(removed.leads.find((item) => item.id === 'lead_10')?.customerId).toBeUndefined()
  })
})
