import { describe, expect, it } from 'vitest'
import { createWorkspace } from '@/data/workspace'
import { toCsv } from '@/lib/csv'
import { selectConversionFunnel, selectDealOutcomes, selectLeadRates, selectLeadSources, selectTaskStats } from './reportSelectors'
import type { LeadStatus } from '@/types'

function stateWith(statuses: { status: LeadStatus; source: string }[]) {
  const workspace = createWorkspace()
  const template = workspace.leads[0]!
  const leads = statuses.map((item, index) => ({ ...template, id: `lead-${index}`, ...item }))
  return { workspace: { ...workspace, leads } }
}

describe('report selectors', () => {
  it('ranks lead sources by volume and counts wins per source', () => {
    const state = stateWith([
      { status: 'won', source: 'Referral' },
      { status: 'new', source: 'Referral' },
      { status: 'contacted', source: 'Website' },
      { status: 'won', source: 'Event' },
      { status: 'lost', source: 'Event' },
      { status: 'new', source: 'Event' },
    ])
    expect(selectLeadSources(state)).toEqual([
      { source: 'Event', leads: 3, won: 1 },
      { source: 'Referral', leads: 2, won: 1 },
      { source: 'Website', leads: 1, won: 0 },
    ])
  })

  it('builds a cumulative funnel that ignores lost leads', () => {
    const state = stateWith([
      { status: 'new', source: 'Web' },
      { status: 'contacted', source: 'Web' },
      { status: 'qualified', source: 'Web' },
      { status: 'won', source: 'Web' },
      { status: 'lost', source: 'Web' },
    ])
    const funnel = selectConversionFunnel(state)
    expect(funnel.map((step) => step.count)).toEqual([4, 3, 2, 1, 1])
    expect(funnel[0]?.pct).toBe(100)
    expect(funnel.at(-1)?.pct).toBe(25)
    for (let index = 1; index < funnel.length; index += 1) {
      expect(funnel[index]!.count).toBeLessThanOrEqual(funnel[index - 1]!.count)
    }
  })

  it('separates lead conversion from close rate', () => {
    const state = stateWith([
      { status: 'won', source: 'Web' },
      { status: 'lost', source: 'Web' },
      { status: 'new', source: 'Web' },
      { status: 'new', source: 'Web' },
    ])
    expect(selectLeadRates(state)).toMatchObject({ total: 4, won: 1, lost: 1, conversion: 25, closeRate: 50 })
  })

  it('summarises closed deals newest first', () => {
    const state = { workspace: createWorkspace() }
    const outcomes = selectDealOutcomes(state)
    expect(outcomes.wonCount + outcomes.lostCount).toBe(outcomes.closed.length)
    expect(outcomes.closed.every((deal) => deal.stage === 'closed_won' || deal.stage === 'closed_lost')).toBe(true)
    const dates = outcomes.closed.map((deal) => deal.expectedClose)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(outcomes.winRate).toBe(Math.round((outcomes.wonCount / outcomes.closed.length) * 100))
  })

  it('splits tasks by priority without losing any', () => {
    const state = { workspace: createWorkspace() }
    const stats = selectTaskStats(state)
    const total = stats.byPriority.reduce((sum, row) => sum + row.completed + row.open, 0)
    expect(total).toBe(stats.total)
    expect(stats.completed + stats.open).toBe(stats.total)
  })
})

describe('toCsv', () => {
  it('quotes cells that contain commas, quotes, or line breaks', () => {
    const csv = toCsv([
      ['Deal', 'Value', 'Note'],
      ['Acme, Inc.', 1200, 'Said "yes"'],
      ['Line\nbreak', null, undefined],
    ])
    expect(csv).toBe('Deal,Value,Note\r\n"Acme, Inc.",1200,"Said ""yes"""\r\n"Line\nbreak",,')
  })
})
