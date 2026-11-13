import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'
import { createWorkspace } from '@/data/workspace'
import { dealStageMeta } from '@/lib/dealStage'
import type {
  Activity,
  ActivityType,
  AppNotification,
  Customer,
  CustomerStatus,
  Deal,
  DealStage,
  Lead,
  LeadStatus,
  NotificationKind,
  PerformanceMonth,
  Task,
  TaskPriority,
  TaskStatus,
} from '@/types'

const NOTIFICATION_LIMIT = 50

export interface DealInput {
  title: string
  company: string
  customerId?: string
  value: number
  stage: DealStage
  probability: number
  expectedClose: string
}

export interface TaskInput {
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  relatedTo: string
}

export interface ActivityInput {
  type: ActivityType
  title: string
  description: string
  customerId?: string
  relatedTo: string
  occurredAt: string
}

export interface NotificationInput {
  kind: NotificationKind
  title: string
  message: string
  link?: string
}

export interface LeadInput {
  name: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  source: string
  estimatedValue: number
  notes: string
  nextFollowUp: string
}

export interface CustomerInput {
  name: string
  company: string
  email: string
  phone: string
  jobTitle: string
  location: string
  status: CustomerStatus
  notes: string
}

export interface InteractionInput {
  customerId: string
  type: ActivityType
  title: string
  description: string
}

export interface WorkspaceState {
  leads: Lead[]
  customers: Customer[]
  deals: Deal[]
  tasks: Task[]
  activities: Activity[]
  notifications: AppNotification[]
  performance: PerformanceMonth[]
}

function nowIso() {
  return new Date().toISOString()
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: createWorkspace() satisfies WorkspaceState,
  reducers: {
    addLead: {
      reducer(state, action: PayloadAction<Lead>) {
        state.leads.unshift(action.payload)
      },
      prepare(values: LeadInput) {
        const now = nowIso()
        return {
          payload: {
            ...values,
            id: `lead_${nanoid(8)}`,
            createdAt: now,
            updatedAt: now,
          } satisfies Lead,
        }
      },
    },
    updateLead(state, action: PayloadAction<{ id: string; values: LeadInput }>) {
      const lead = state.leads.find((item) => item.id === action.payload.id)
      if (!lead) return
      Object.assign(lead, action.payload.values)
      lead.updatedAt = nowIso()
    },
    updateLeadStatus(state, action: PayloadAction<{ id: string; status: LeadStatus }>) {
      const lead = state.leads.find((item) => item.id === action.payload.id)
      if (!lead || lead.status === action.payload.status) return
      lead.status = action.payload.status
      lead.updatedAt = nowIso()
    },
    logFollowUp(state, action: PayloadAction<{ id: string; nextFollowUp: string; note: string }>) {
      const lead = state.leads.find((item) => item.id === action.payload.id)
      if (!lead) return
      const now = nowIso()
      lead.nextFollowUp = action.payload.nextFollowUp
      if (action.payload.note.trim()) lead.notes = action.payload.note.trim()
      if (lead.status === 'new') lead.status = 'contacted'
      lead.updatedAt = now
      state.activities.unshift({
        id: `act_${nanoid(8)}`,
        type: 'follow_up',
        title: `Follow-up with ${lead.name}`,
        description: action.payload.note.trim() || `Next follow-up scheduled for ${action.payload.nextFollowUp}.`,
        customerId: lead.customerId,
        relatedTo: lead.company,
        occurredAt: now,
      })
    },
    linkLeadToCustomer(state, action: PayloadAction<{ leadId: string; customerId: string }>) {
      const lead = state.leads.find((item) => item.id === action.payload.leadId)
      const customer = state.customers.find((item) => item.id === action.payload.customerId)
      if (!lead || !customer) return
      const now = nowIso()
      lead.customerId = customer.id
      lead.status = 'won'
      lead.updatedAt = now
      state.activities.unshift({
        id: `act_${nanoid(8)}`,
        type: 'note',
        title: `${lead.name} linked to a customer`,
        description: `${lead.company} now points at the ${customer.company} profile.`,
        customerId: customer.id,
        relatedTo: lead.company,
        occurredAt: now,
      })
    },
    convertLead: {
      reducer(state, action: PayloadAction<{ leadId: string; customer: Customer }>) {
        const lead = state.leads.find((item) => item.id === action.payload.leadId)
        if (!lead || lead.customerId) return
        const now = nowIso()
        state.customers.unshift(action.payload.customer)
        lead.customerId = action.payload.customer.id
        lead.status = 'won'
        lead.updatedAt = now
        state.activities.unshift({
          id: `act_${nanoid(8)}`,
          type: 'note',
          title: `${lead.name} converted to a customer`,
          description: `A customer profile was created for ${lead.company}.`,
          customerId: action.payload.customer.id,
          relatedTo: lead.company,
          occurredAt: now,
        })
      },
      prepare(lead: Lead) {
        const now = nowIso()
        return {
          payload: {
            leadId: lead.id,
            customer: {
              id: `cus_${nanoid(8)}`,
              name: lead.name,
              company: lead.company,
              email: lead.email,
              phone: lead.phone,
              jobTitle: '',
              location: '',
              status: 'active',
              notes: lead.notes,
              createdAt: now,
              updatedAt: now,
            } satisfies Customer,
          },
        }
      },
    },
    deleteLead(state, action: PayloadAction<string>) {
      state.leads = state.leads.filter((lead) => lead.id !== action.payload)
    },
    addCustomer: {
      reducer(state, action: PayloadAction<Customer>) {
        state.customers.unshift(action.payload)
      },
      prepare(values: CustomerInput) {
        const now = nowIso()
        return {
          payload: {
            ...values,
            id: `cus_${nanoid(8)}`,
            createdAt: now,
            updatedAt: now,
          } satisfies Customer,
        }
      },
    },
    updateCustomer(state, action: PayloadAction<{ id: string; values: CustomerInput }>) {
      const customer = state.customers.find((item) => item.id === action.payload.id)
      if (!customer) return
      Object.assign(customer, action.payload.values)
      customer.updatedAt = nowIso()
    },
    deleteCustomer(state, action: PayloadAction<string>) {
      const id = action.payload
      state.customers = state.customers.filter((customer) => customer.id !== id)
      state.activities = state.activities.filter((activity) => activity.customerId !== id)
      for (const lead of state.leads) {
        if (lead.customerId === id) lead.customerId = undefined
      }
      for (const deal of state.deals) {
        if (deal.customerId === id) deal.customerId = undefined
      }
    },
    addInteraction: {
      reducer(state, action: PayloadAction<Activity>) {
        const customer = state.customers.find((item) => item.id === action.payload.customerId)
        if (!customer) return
        customer.updatedAt = action.payload.occurredAt
        action.payload.relatedTo = customer.company
        state.activities.unshift(action.payload)
      },
      prepare(values: InteractionInput) {
        return {
          payload: {
            id: `act_${nanoid(8)}`,
            type: values.type,
            title: values.title.trim(),
            description: values.description.trim(),
            customerId: values.customerId,
            relatedTo: '',
            occurredAt: nowIso(),
          } satisfies Activity,
        }
      },
    },
    addDeal: {
      reducer(state, action: PayloadAction<Deal>) {
        state.deals.unshift(action.payload)
      },
      prepare(values: DealInput) {
        return {
          payload: { ...values, id: `deal_${nanoid(8)}`, createdAt: nowIso() } satisfies Deal,
        }
      },
    },
    updateDeal(state, action: PayloadAction<{ id: string; values: DealInput }>) {
      const deal = state.deals.find((item) => item.id === action.payload.id)
      if (!deal) return
      Object.assign(deal, action.payload.values)
      if (!action.payload.values.customerId) deal.customerId = undefined
    },
    moveDeal(state, action: PayloadAction<{ id: string; stage: DealStage }>) {
      const deal = state.deals.find((item) => item.id === action.payload.id)
      if (!deal || deal.stage === action.payload.stage) return
      deal.stage = action.payload.stage
      deal.probability = dealStageMeta(action.payload.stage).probability
    },
    deleteDeal(state, action: PayloadAction<string>) {
      state.deals = state.deals.filter((deal) => deal.id !== action.payload)
    },
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        state.tasks.unshift(action.payload)
      },
      prepare(values: TaskInput) {
        return {
          payload: { ...values, id: `task_${nanoid(8)}`, createdAt: nowIso() } satisfies Task,
        }
      },
    },
    updateTask(state, action: PayloadAction<{ id: string; values: TaskInput }>) {
      const task = state.tasks.find((item) => item.id === action.payload.id)
      if (task) Object.assign(task, action.payload.values)
    },
    setTaskStatus(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const task = state.tasks.find((item) => item.id === action.payload.id)
      if (task) task.status = action.payload.status
    },
    toggleTaskComplete(state, action: PayloadAction<string>) {
      const task = state.tasks.find((item) => item.id === action.payload)
      if (task) task.status = task.status === 'completed' ? 'todo' : 'completed'
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload)
    },
    logActivity: {
      reducer(state, action: PayloadAction<Activity>) {
        state.activities.unshift(action.payload)
      },
      prepare(values: ActivityInput) {
        return {
          payload: { ...values, id: `act_${nanoid(8)}` } satisfies Activity,
        }
      },
    },
    updateActivity(state, action: PayloadAction<{ id: string; values: ActivityInput }>) {
      const activity = state.activities.find((item) => item.id === action.payload.id)
      if (!activity) return
      Object.assign(activity, action.payload.values)
      if (!action.payload.values.customerId) activity.customerId = undefined
    },
    deleteActivity(state, action: PayloadAction<string>) {
      state.activities = state.activities.filter((activity) => activity.id !== action.payload)
    },
    pushNotification: {
      reducer(state, action: PayloadAction<AppNotification>) {
        state.notifications.unshift(action.payload)
        state.notifications = state.notifications.slice(0, NOTIFICATION_LIMIT)
      },
      prepare(values: NotificationInput) {
        return {
          payload: { ...values, id: `note_${nanoid(8)}`, createdAt: nowIso(), read: false } satisfies AppNotification,
        }
      },
    },
    setNotificationRead(state, action: PayloadAction<{ id: string; read: boolean }>) {
      const notification = state.notifications.find((item) => item.id === action.payload.id)
      if (notification) notification.read = action.payload.read
    },
    markAllNotificationsRead(state) {
      for (const notification of state.notifications) notification.read = true
    },
    deleteNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter((notification) => notification.id !== action.payload)
    },
    clearReadNotifications(state) {
      state.notifications = state.notifications.filter((notification) => !notification.read)
    },
    resetWorkspace() {
      return createWorkspace()
    },
  },
})

export const {
  addLead,
  updateLead,
  updateLeadStatus,
  logFollowUp,
  linkLeadToCustomer,
  convertLead,
  deleteLead,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addInteraction,
  addDeal,
  updateDeal,
  moveDeal,
  deleteDeal,
  addTask,
  updateTask,
  setTaskStatus,
  toggleTaskComplete,
  deleteTask,
  logActivity,
  updateActivity,
  deleteActivity,
  pushNotification,
  setNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearReadNotifications,
  resetWorkspace,
} = workspaceSlice.actions

export const workspaceReducer = workspaceSlice.reducer
