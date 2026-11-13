export const CHART_COLORS = {
  brand: '#7C3AED',
  aurora: '#22D3EE',
  auroraDeep: '#0891B2',
  orchid: '#C026D3',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#CBD5E1',
  tick: '#8B839C',
  grid: '#E2E8F8',
}

export const SERIES_COLORS = [CHART_COLORS.brand, CHART_COLORS.auroraDeep, CHART_COLORS.orchid, CHART_COLORS.success, CHART_COLORS.aurora, CHART_COLORS.warning, '#A78BFA']

export const axisProps = {
  tick: { fill: CHART_COLORS.tick, fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const
