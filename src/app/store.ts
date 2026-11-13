import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { authReducer } from '@/features/auth/authSlice'
import { toastsReducer } from '@/features/toasts/toastsSlice'
import { uiReducer } from '@/features/ui/uiSlice'
import { SETTINGS_KEY, readSettings, settingsReducer } from '@/features/settings/settingsSlice'
import { workspaceReducer, type WorkspaceState } from '@/features/workspace/workspaceSlice'
import { createPerformance } from '@/data/workspace'
import { listenerMiddleware } from './listeners'

export const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  workspace: workspaceReducer,
  settings: settingsReducer,
  toasts: toastsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

const WORKSPACE_KEY = 'nexrel-user:workspace'

function readWorkspace(): WorkspaceState | undefined {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY)
    if (!raw) return undefined
    const data = JSON.parse(raw) as WorkspaceState
    if (!Array.isArray(data.leads) || !Array.isArray(data.customers) || !Array.isArray(data.deals)) return undefined
    const performanceOk = Array.isArray(data.performance) && data.performance.length >= 12 && data.performance.every((point) => typeof point.leads === 'number')
    return performanceOk ? data : { ...data, performance: createPerformance() }
  } catch {
    return undefined
  }
}

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })
}

const savedWorkspace = readWorkspace()
export const store = makeStore({ settings: readSettings(), ...(savedWorkspace ? { workspace: savedWorkspace } : {}) })

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage can be full or disabled in private mode
  }
}

let lastWorkspace = store.getState().workspace
let lastSettings = store.getState().settings
store.subscribe(() => {
  const { workspace, settings } = store.getState()
  if (workspace !== lastWorkspace) {
    lastWorkspace = workspace
    persist(WORKSPACE_KEY, workspace)
  }
  if (settings !== lastSettings) {
    lastSettings = settings
    persist(SETTINGS_KEY, settings)
  }
})

export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
