import type { DealStage } from '@/types'

export const DEAL_STAGES: { value: DealStage; label: string; color: string; probability: number }[] = [
  { value: 'prospecting', label: 'Prospecting', color: '#22D3EE', probability: 10 },
  { value: 'qualification', label: 'Qualification', color: '#38BDF8', probability: 25 },
  { value: 'proposal', label: 'Proposal', color: '#A78BFA', probability: 50 },
  { value: 'negotiation', label: 'Negotiation', color: '#7C3AED', probability: 75 },
  { value: 'closed_won', label: 'Closed won', color: '#10B981', probability: 100 },
  { value: 'closed_lost', label: 'Closed lost', color: '#94A3B8', probability: 0 },
]

export const OPEN_STAGES: DealStage[] = ['prospecting', 'qualification', 'proposal', 'negotiation']

export function dealStageMeta(stage: DealStage) {
  return DEAL_STAGES.find((item) => item.value === stage) ?? DEAL_STAGES[0]!
}
