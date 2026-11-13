import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { NotificationKind } from '@/types'

export type AlertKind = Exclude<NotificationKind, 'system'>
export type EmailDigest = 'off' | 'daily' | 'weekly'

export interface SettingsState {
  alerts: Record<AlertKind, boolean>
  emailDigest: EmailDigest
  reduceMotion: boolean
}

export const SETTINGS_KEY = 'nexrel-user:settings'

export function defaultSettings(): SettingsState {
  return {
    alerts: { lead: true, task: true, meeting: true, deal: true },
    emailDigest: 'daily',
    reduceMotion: false,
  }
}

export function readSettings(): SettingsState {
  const base = defaultSettings()
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as Partial<SettingsState>
    return {
      alerts: { ...base.alerts, ...saved.alerts },
      emailDigest: saved.emailDigest === 'off' || saved.emailDigest === 'weekly' ? saved.emailDigest : base.emailDigest,
      reduceMotion: saved.reduceMotion === true,
    }
  } catch {
    return base
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: defaultSettings,
  reducers: {
    setAlert(state, action: PayloadAction<{ kind: AlertKind; enabled: boolean }>) {
      state.alerts[action.payload.kind] = action.payload.enabled
    },
    setEmailDigest(state, action: PayloadAction<EmailDigest>) {
      state.emailDigest = action.payload
    },
    setReduceMotion(state, action: PayloadAction<boolean>) {
      state.reduceMotion = action.payload
    },
    resetSettings() {
      return defaultSettings()
    },
  },
})

export const { setAlert, setEmailDigest, setReduceMotion, resetSettings } = settingsSlice.actions
export const settingsReducer = settingsSlice.reducer
