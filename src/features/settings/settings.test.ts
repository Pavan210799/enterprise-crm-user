import { describe, expect, it } from 'vitest'
import { makeStore } from '@/app/store'
import { createWorkspace } from '@/data/workspace'
import { moveDeal } from '@/features/workspace/workspaceSlice'
import { SETTINGS_KEY, defaultSettings, readSettings, setAlert, setEmailDigest, setReduceMotion } from './settingsSlice'

describe('settings', () => {
  it('falls back to defaults for missing or invalid saved settings', () => {
    expect(readSettings()).toEqual(defaultSettings())
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ alerts: { deal: false }, emailDigest: 'hourly', reduceMotion: 'yes' }))
    expect(readSettings()).toEqual({ ...defaultSettings(), alerts: { ...defaultSettings().alerts, deal: false } })
    localStorage.setItem(SETTINGS_KEY, '{not json')
    expect(readSettings()).toEqual(defaultSettings())
  })

  it('updates alert, digest, and motion preferences', () => {
    const store = makeStore()
    store.dispatch(setAlert({ kind: 'task', enabled: false }))
    store.dispatch(setEmailDigest('weekly'))
    store.dispatch(setReduceMotion(true))
    expect(store.getState().settings).toEqual({
      alerts: { lead: true, task: false, meeting: true, deal: true },
      emailDigest: 'weekly',
      reduceMotion: true,
    })
  })

  it('stops deal notifications once deal alerts are muted', () => {
    const store = makeStore({ workspace: createWorkspace() })
    store.dispatch(setAlert({ kind: 'deal', enabled: false }))
    const before = store.getState().workspace.notifications.length
    const deal = store.getState().workspace.deals.find((item) => item.stage === 'negotiation')!
    store.dispatch(moveDeal({ id: deal.id, stage: 'closed_won' }))
    expect(store.getState().workspace.deals.find((item) => item.id === deal.id)?.stage).toBe('closed_won')
    expect(store.getState().workspace.notifications).toHaveLength(before)
  })
})
