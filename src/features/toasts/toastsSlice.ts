import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  tone: ToastTone
  title: string
  message?: string
}

const toastsSlice = createSlice({
  name: 'toasts',
  initialState: { items: [] as Toast[] },
  reducers: {
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload)
        if (state.items.length > 4) state.items.shift()
      },
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: nanoid(8) } }
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { pushToast, dismissToast } = toastsSlice.actions
export const toastsReducer = toastsSlice.reducer
