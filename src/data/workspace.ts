import type {
  Activity,
  AppNotification,
  Customer,
  Deal,
  Lead,
  PerformanceMonth,
  Task,
} from '@/types'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function dateInputFromOffset(offset: number, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function atHour(offsetDays: number, hour: number, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, hour, 0, 0, 0)
  return date.toISOString()
}

export const KPI_PREVIOUS = {
  assignedLeads: 10,
  activeCustomers: 6,
  ongoingDeals: 5,
  pendingTasks: 8,
}

const WON_CUSTOMER: Record<string, string> = { lead_10: 'cus_01', lead_11: 'cus_02' }

export function createLeads(now = new Date()): Lead[] {
  const rows: Omit<Lead, 'updatedAt' | 'customerId'>[] = [
    { id: 'lead_01', name: 'Helena Voss', company: 'Northwind Labs', email: 'helena@northwindlabs.com', phone: '+1 415 555 0142', status: 'new', source: 'Website', estimatedValue: 24000, notes: 'Asked for a demo of the pipeline board.', nextFollowUp: dateInputFromOffset(1, now), createdAt: atHour(-2, 9, now) },
    { id: 'lead_02', name: 'Marcus Hale', company: 'Brightline Retail', email: 'marcus@brightline.co', phone: '+1 212 555 0194', status: 'new', source: 'Referral', estimatedValue: 18000, notes: 'Referred by an existing customer.', nextFollowUp: dateInputFromOffset(0, now), createdAt: atHour(-4, 11, now) },
    { id: 'lead_03', name: 'Aisha Rahman', company: 'Kite & Co.', email: 'aisha@kiteandco.com', phone: '+1 312 555 0177', status: 'new', source: 'Event', estimatedValue: 32000, notes: 'Met at the spring sales summit.', nextFollowUp: dateInputFromOffset(2, now), createdAt: atHour(-6, 15, now) },
    { id: 'lead_04', name: 'Owen Blake', company: 'Harbor Freight Digital', email: 'owen@hfd.io', phone: '+1 617 555 0118', status: 'contacted', source: 'Outbound', estimatedValue: 15000, notes: 'Intro call completed. Waiting on budget owner.', nextFollowUp: dateInputFromOffset(3, now), createdAt: atHour(-12, 10, now) },
    { id: 'lead_05', name: 'Priya Nair', company: 'Lumen Health', email: 'priya.nair@lumenhealth.com', phone: '+1 646 555 0160', status: 'contacted', source: 'Website', estimatedValue: 41000, notes: 'Needs a security review before the next meeting.', nextFollowUp: dateInputFromOffset(1, now), createdAt: atHour(-15, 13, now) },
    { id: 'lead_06', name: 'Diego Alvarez', company: 'Solstice Foods', email: 'diego@solsticefoods.com', phone: '+1 305 555 0133', status: 'qualified', source: 'Partner', estimatedValue: 56000, notes: 'Qualified. Two sites, one shared pipeline.', nextFollowUp: dateInputFromOffset(4, now), createdAt: atHour(-20, 9, now) },
    { id: 'lead_07', name: 'Chloe Martin', company: 'Paperplane HR', email: 'chloe@paperplanehr.com', phone: '+1 206 555 0188', status: 'qualified', source: 'Referral', estimatedValue: 27000, notes: 'Decision maker confirmed for Thursday.', nextFollowUp: dateInputFromOffset(2, now), createdAt: atHour(-22, 16, now) },
    { id: 'lead_08', name: 'Jonah Ellis', company: 'Fieldnote', email: 'jonah@fieldnote.app', phone: '+1 503 555 0121', status: 'proposal', source: 'Outbound', estimatedValue: 48000, notes: 'Proposal sent. Legal is reviewing terms.', nextFollowUp: dateInputFromOffset(5, now), createdAt: atHour(-28, 11, now) },
    { id: 'lead_09', name: 'Sara Okonkwo', company: 'Atlas Freight', email: 'sara@atlasfreight.com', phone: '+1 404 555 0190', status: 'proposal', source: 'Website', estimatedValue: 63000, notes: 'Asked for a phased rollout option.', nextFollowUp: dateInputFromOffset(3, now), createdAt: atHour(-30, 14, now) },
    { id: 'lead_10', name: 'Ben Carter', company: 'Orchard Bank', email: 'ben.carter@orchardbank.com', phone: '+1 917 555 0104', status: 'won', source: 'Referral', estimatedValue: 42000, notes: 'Signed. Handed to onboarding.', nextFollowUp: dateInputFromOffset(14, now), createdAt: atHour(-40, 10, now) },
    { id: 'lead_11', name: 'Nina Petrova', company: 'Glasshouse', email: 'nina@glasshouse.studio', phone: '+1 347 555 0155', status: 'won', source: 'Event', estimatedValue: 32000, notes: 'Closed after the workshop follow-up.', nextFollowUp: dateInputFromOffset(21, now), createdAt: atHour(-45, 12, now) },
    { id: 'lead_12', name: 'Leo Grant', company: 'Milestone Insurance', email: 'leo@milestoneins.com', phone: '+1 214 555 0172', status: 'lost', source: 'Outbound', estimatedValue: 22000, notes: 'Chose an internal tool this quarter.', nextFollowUp: dateInputFromOffset(60, now), createdAt: atHour(-50, 9, now) },
  ]
  return rows.map((lead) => ({
    ...lead,
    customerId: WON_CUSTOMER[lead.id],
    updatedAt: lead.createdAt,
  }))
}

export function createCustomers(now = new Date()): Customer[] {
  const rows: Omit<Customer, 'updatedAt' | 'notes'>[] = [
    { id: 'cus_01', name: 'Ben Carter', company: 'Orchard Bank', email: 'ben.carter@orchardbank.com', phone: '+1 917 555 0104', jobTitle: 'VP Sales', location: 'New York, NY', status: 'active', createdAt: atHour(-40, 10, now) },
    { id: 'cus_02', name: 'Nina Petrova', company: 'Glasshouse', email: 'nina@glasshouse.studio', phone: '+1 347 555 0155', jobTitle: 'Founder', location: 'Brooklyn, NY', status: 'active', createdAt: atHour(-45, 12, now) },
    { id: 'cus_03', name: 'Elena Cho', company: 'Marlow Analytics', email: 'elena@marlow.io', phone: '+1 628 555 0148', jobTitle: 'Head of Revenue', location: 'San Francisco, CA', status: 'active', createdAt: atHour(-70, 11, now) },
    { id: 'cus_04', name: 'Samuel Wright', company: 'Cedar Clinic Group', email: 'sam@cedarclinic.com', phone: '+1 512 555 0166', jobTitle: 'Operations Director', location: 'Austin, TX', status: 'active', createdAt: atHour(-80, 15, now) },
    { id: 'cus_05', name: 'Amelia Brooks', company: 'Northstar Logistics', email: 'amelia@northstarlog.com', phone: '+1 303 555 0199', jobTitle: 'Sales Manager', location: 'Denver, CO', status: 'active', createdAt: atHour(-90, 9, now) },
    { id: 'cus_06', name: 'Hugo Lambert', company: 'Kindred Hotels', email: 'hugo@kindredhotels.com', phone: '+1 702 555 0112', jobTitle: 'Commercial Lead', location: 'Las Vegas, NV', status: 'active', createdAt: atHour(-100, 13, now) },
    { id: 'cus_07', name: 'Fatima Diallo', company: 'Rivermark', email: 'fatima@rivermark.co', phone: '+1 786 555 0181', jobTitle: 'Account Director', location: 'Miami, FL', status: 'active', createdAt: atHour(-110, 10, now) },
    { id: 'cus_08', name: 'Chris Dalton', company: 'Old Mill Supply', email: 'chris@oldmillsupply.com', phone: '+1 216 555 0139', jobTitle: 'Owner', location: 'Cleveland, OH', status: 'inactive', createdAt: atHour(-200, 11, now) },
  ]
  return rows.map((customer) => ({
    ...customer,
    notes: '',
    updatedAt: customer.createdAt,
  }))
}

export function createDeals(now = new Date()): Deal[] {
  return [
    { id: 'deal_01', title: 'Orchard Bank rollout', company: 'Orchard Bank', customerId: 'cus_01', value: 42000, stage: 'closed_won', probability: 100, expectedClose: dateInputFromOffset(-6, now), createdAt: atHour(-40, 10, now) },
    { id: 'deal_02', title: 'Glasshouse studio plan', company: 'Glasshouse', customerId: 'cus_02', value: 32000, stage: 'closed_won', probability: 100, expectedClose: dateInputFromOffset(-3, now), createdAt: atHour(-45, 12, now) },
    { id: 'deal_03', title: 'Marlow renewal', company: 'Marlow Analytics', customerId: 'cus_03', value: 54000, stage: 'negotiation', probability: 75, expectedClose: dateInputFromOffset(12, now), createdAt: atHour(-18, 11, now) },
    { id: 'deal_04', title: 'Cedar multi-site', company: 'Cedar Clinic Group', customerId: 'cus_04', value: 61000, stage: 'negotiation', probability: 75, expectedClose: dateInputFromOffset(18, now), createdAt: atHour(-16, 14, now) },
    { id: 'deal_05', title: 'Northstar expansion', company: 'Northstar Logistics', customerId: 'cus_05', value: 47000, stage: 'proposal', probability: 50, expectedClose: dateInputFromOffset(21, now), createdAt: atHour(-14, 9, now) },
    { id: 'deal_06', title: 'Atlas freight pilot', company: 'Atlas Freight', value: 63000, stage: 'proposal', probability: 50, expectedClose: dateInputFromOffset(24, now), createdAt: atHour(-12, 15, now) },
    { id: 'deal_07', title: 'Kindred group license', company: 'Kindred Hotels', customerId: 'cus_06', value: 38000, stage: 'qualification', probability: 25, expectedClose: dateInputFromOffset(30, now), createdAt: atHour(-9, 10, now) },
    { id: 'deal_08', title: 'Fieldnote starter', company: 'Fieldnote', value: 28000, stage: 'prospecting', probability: 10, expectedClose: dateInputFromOffset(40, now), createdAt: atHour(-5, 11, now) },
    { id: 'deal_09', title: 'Rivermark add-on', company: 'Rivermark', customerId: 'cus_07', value: 19000, stage: 'prospecting', probability: 10, expectedClose: dateInputFromOffset(35, now), createdAt: atHour(-4, 16, now) },
    { id: 'deal_10', title: 'Milestone annual', company: 'Milestone Insurance', value: 22000, stage: 'closed_lost', probability: 0, expectedClose: dateInputFromOffset(-10, now), createdAt: atHour(-50, 9, now) },
  ]
}

export function createTasks(now = new Date()): Task[] {
  return [
    { id: 'task_01', title: 'Call Helena about the demo', description: 'Confirm attendees and send the deck.', priority: 'urgent', status: 'todo', dueDate: dateInputFromOffset(0, now), relatedTo: 'Northwind Labs', createdAt: atHour(-1, 9, now) },
    { id: 'task_02', title: 'Send the Atlas proposal revision', description: 'Include the phased rollout option.', priority: 'high', status: 'in_progress', dueDate: dateInputFromOffset(0, now), relatedTo: 'Atlas Freight', createdAt: atHour(-2, 11, now) },
    { id: 'task_03', title: 'Prep Marlow renewal notes', description: 'Pull last quarter usage before negotiation.', priority: 'high', status: 'todo', dueDate: dateInputFromOffset(-1, now), relatedTo: 'Marlow Analytics', createdAt: atHour(-5, 10, now) },
    { id: 'task_04', title: 'Intro email to Brightline', description: 'Thank Marcus for the referral.', priority: 'medium', status: 'todo', dueDate: dateInputFromOffset(1, now), relatedTo: 'Brightline Retail', createdAt: atHour(-3, 14, now) },
    { id: 'task_05', title: 'Book Cedar site visit', description: 'Two clinics, one afternoon.', priority: 'medium', status: 'in_progress', dueDate: dateInputFromOffset(2, now), relatedTo: 'Cedar Clinic Group', createdAt: atHour(-6, 15, now) },
    { id: 'task_06', title: 'Follow up with Paperplane HR', description: 'Share the qualification summary.', priority: 'low', status: 'todo', dueDate: dateInputFromOffset(4, now), relatedTo: 'Paperplane HR', createdAt: atHour(-7, 9, now) },
    { id: 'task_07', title: 'Onboard Orchard Bank', description: 'Kickoff is scheduled with their admin.', priority: 'high', status: 'completed', dueDate: dateInputFromOffset(-4, now), relatedTo: 'Orchard Bank', createdAt: atHour(-12, 10, now) },
    { id: 'task_08', title: 'Send Glasshouse welcome kit', description: 'Workspace invite and first pipeline template.', priority: 'medium', status: 'completed', dueDate: dateInputFromOffset(-2, now), relatedTo: 'Glasshouse', createdAt: atHour(-10, 13, now) },
    { id: 'task_09', title: 'Log the summit conversations', description: 'Three new contacts from the booth.', priority: 'low', status: 'completed', dueDate: dateInputFromOffset(-8, now), relatedTo: 'Event', createdAt: atHour(-9, 16, now) },
    { id: 'task_10', title: 'Close the Milestone notes', description: 'Record why the deal was lost.', priority: 'medium', status: 'completed', dueDate: dateInputFromOffset(-9, now), relatedTo: 'Milestone Insurance', createdAt: atHour(-11, 11, now) },
  ]
}

export function createActivities(now = new Date()): Activity[] {
  return [
    { id: 'act_01', type: 'call', title: 'Discovery call with Lumen Health', description: 'Security review is the blocker. Send the questionnaire.', customerId: undefined, relatedTo: 'Lumen Health', occurredAt: atHour(-1, 15, now) },
    { id: 'act_02', type: 'email', title: 'Proposal sent to Atlas Freight', description: 'Phased rollout attached. Asked for a reply by Friday.', relatedTo: 'Atlas Freight', occurredAt: atHour(-1, 11, now) },
    { id: 'act_03', type: 'meeting', title: 'Negotiation with Marlow Analytics', description: 'They want a 12-month term with a quarterly check-in.', customerId: 'cus_03', relatedTo: 'Marlow Analytics', occurredAt: atHour(-2, 14, now) },
    { id: 'act_04', type: 'follow_up', title: 'Follow-up after the summit', description: 'Aisha asked for a product tour next week.', relatedTo: 'Kite & Co.', occurredAt: atHour(-3, 10, now) },
    { id: 'act_05', type: 'note', title: 'Orchard Bank kickoff notes', description: 'Admin users invited. First pipeline imported.', customerId: 'cus_01', relatedTo: 'Orchard Bank', occurredAt: atHour(-4, 16, now) },
    { id: 'act_06', type: 'meeting', title: 'Cedar clinic walkthrough', description: 'Front desk wants a shared task list.', customerId: 'cus_04', relatedTo: 'Cedar Clinic Group', occurredAt: atHour(-6, 13, now) },
    { id: 'act_07', type: 'call', title: 'Check-in with Kindred Hotels', description: 'Still qualifying the group license.', customerId: 'cus_06', relatedTo: 'Kindred Hotels', occurredAt: atHour(-8, 9, now) },
    { id: 'act_08', type: 'email', title: 'Lost-deal note to Milestone', description: 'Left the door open for next fiscal year.', relatedTo: 'Milestone Insurance', occurredAt: atHour(-10, 11, now) },
    { id: 'act_09', type: 'meeting', title: 'Cedar site visit', description: 'Walk both clinics with the operations lead.', customerId: 'cus_04', relatedTo: 'Cedar Clinic Group', occurredAt: atHour(1, 14, now) },
    { id: 'act_10', type: 'follow_up', title: 'Product tour for Kite & Co.', description: 'Aisha requested a 30-minute walkthrough.', relatedTo: 'Kite & Co.', occurredAt: atHour(3, 11, now) },
  ]
}

export function createNotifications(now = new Date()): AppNotification[] {
  return [
    { id: 'note_01', kind: 'lead', title: 'New lead assigned', message: 'Helena Voss at Northwind Labs was added to your book.', createdAt: atHour(-2, 9, now), read: false, link: '/leads' },
    { id: 'note_02', kind: 'task', title: 'Task due today', message: 'Call Helena about the demo is due today.', createdAt: atHour(0, 8, now), read: false, link: '/tasks' },
    { id: 'note_03', kind: 'deal', title: 'Deal moved to negotiation', message: 'Marlow renewal is ready for a close plan.', createdAt: atHour(-2, 15, now), read: false, link: '/pipeline' },
    { id: 'note_04', kind: 'meeting', title: 'Meeting tomorrow', message: 'Cedar site visit still needs a calendar hold.', createdAt: atHour(-1, 17, now), read: true, link: '/activities' },
    { id: 'note_05', kind: 'lead', title: 'Follow-up reminder', message: 'Brightline Retail has not been contacted yet.', createdAt: atHour(-4, 11, now), read: true, link: '/leads' },
  ]
}

export function createPerformance(now = new Date()): PerformanceMonth[] {
  const amounts = [
    { revenue: 58000, target: 70000, leads: 7, converted: 1 },
    { revenue: 64000, target: 72000, leads: 8, converted: 2 },
    { revenue: 71000, target: 75000, leads: 9, converted: 2 },
    { revenue: 69000, target: 78000, leads: 8, converted: 1 },
    { revenue: 80000, target: 82000, leads: 10, converted: 2 },
    { revenue: 83000, target: 86000, leads: 11, converted: 3 },
    { revenue: 86000, target: 90000, leads: 10, converted: 2 },
    { revenue: 94000, target: 92000, leads: 12, converted: 3 },
    { revenue: 88000, target: 95000, leads: 11, converted: 2 },
    { revenue: 102000, target: 98000, leads: 13, converted: 3 },
    { revenue: 110000, target: 104000, leads: 14, converted: 4 },
    { revenue: 74000, target: 108000, leads: 12, converted: 2 },
  ]
  return amounts.map((point, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (amounts.length - 1 - index), 1)
    return {
      month: date.toLocaleString('en-US', { month: 'short' }),
      ...point,
    }
  })
}

export function createWorkspace(now = new Date()) {
  return {
    leads: createLeads(now),
    customers: createCustomers(now),
    deals: createDeals(now),
    tasks: createTasks(now),
    activities: createActivities(now),
    notifications: createNotifications(now),
    performance: createPerformance(now),
  }
}
