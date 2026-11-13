import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const SIDEBAR_KEY = 'nexrel-user:sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0')
  } catch {
    // ignore
  }
}

interface UiState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  commandOpen: boolean
}

const initialState: UiState = {
  sidebarCollapsed: readCollapsed(),
  mobileNavOpen: false,
  commandOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
      writeCollapsed(state.sidebarCollapsed)
    },
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    setCommandOpen(state, action: PayloadAction<boolean>) {
      state.commandOpen = action.payload
    },
  },
})

export const { toggleSidebar, setMobileNavOpen, setCommandOpen } = uiSlice.actions
export const uiReducer = uiSlice.reducer
