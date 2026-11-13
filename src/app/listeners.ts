import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit'
import { addDeal, addLead, addTask, logActivity, moveDeal, pushNotification, type NotificationInput } from '@/features/workspace/workspaceSlice'
import type { AlertKind } from '@/features/settings/settingsSlice'
import { dealStageMeta } from '@/lib/dealStage'
import { daysUntil, formatCurrency, formatDueLabel } from '@/lib/format'
import type { AppDispatch, RootState } from './store'

export const listenerMiddleware = createListenerMiddleware()

const startAppListening = listenerMiddleware.startListening as TypedStartListening<RootState, AppDispatch>

type ListenerApi = { getState: () => RootState; dispatch: AppDispatch }

function notify(api: ListenerApi, input: NotificationInput & { kind: AlertKind }) {
  if (!api.getState().settings.alerts[input.kind]) return
  api.dispatch(pushNotification(input))
}

startAppListening({
  actionCreator: addLead,
  effect: (action, api) => {
    const lead = action.payload
    notify(api, {
      kind: 'lead',
      title: 'New lead assigned',
      message: `${lead.name} at ${lead.company} was added to your book.`,
      link: '/leads',
    })
  },
})

startAppListening({
  actionCreator: addDeal,
  effect: (action, api) => {
    const deal = action.payload
    notify(api, {
      kind: 'deal',
      title: 'Deal added to pipeline',
      message: `${deal.title} (${formatCurrency(deal.value)}) entered ${dealStageMeta(deal.stage).label}.`,
      link: '/pipeline',
    })
  },
})

startAppListening({
  actionCreator: moveDeal,
  effect: (action, api) => {
    const before = api.getOriginalState().workspace.deals.find((deal) => deal.id === action.payload.id)
    if (!before || before.stage === action.payload.stage) return
    const stage = dealStageMeta(action.payload.stage)
    const title =
      action.payload.stage === 'closed_won' ? 'Deal won' : action.payload.stage === 'closed_lost' ? 'Deal lost' : `Deal moved to ${stage.label.toLowerCase()}`
    notify(api, {
      kind: 'deal',
      title,
      message: `${before.title} moved from ${dealStageMeta(before.stage).label} to ${stage.label}.`,
      link: '/pipeline',
    })
  },
})

startAppListening({
  actionCreator: addTask,
  effect: (action, api) => {
    const task = action.payload
    if (task.status === 'completed') return
    const days = daysUntil(task.dueDate)
    notify(api, {
      kind: 'task',
      title: days <= 0 ? 'Task reminder' : 'Task scheduled',
      message: `${task.title} · ${formatDueLabel(task.dueDate)}.`,
      link: '/tasks',
    })
  },
})

startAppListening({
  actionCreator: logActivity,
  effect: (action, api) => {
    const activity = action.payload
    if (activity.type !== 'meeting' || new Date(activity.occurredAt).getTime() <= Date.now()) return
    const when = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
      new Date(activity.occurredAt),
    )
    notify(api, {
      kind: 'meeting',
      title: 'Meeting scheduled',
      message: `${activity.title}${activity.relatedTo ? ` with ${activity.relatedTo}` : ''} on ${when}.`,
      link: '/activities',
    })
  },
})
