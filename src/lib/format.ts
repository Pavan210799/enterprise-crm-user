export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso))
}

export function formatDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value ? formatShortDate(value) : '—'
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

export function timeAgo(iso: string, now = Date.now()) {
  const diff = Math.round((now - new Date(iso).getTime()) / 1000)
  const future = diff < 0
  const abs = Math.abs(diff)
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ]
  let value = abs
  let unit = 'second'
  for (const [step, name] of units) {
    unit = name
    if (value < step) break
    value = Math.floor(value / step)
  }
  if (unit === 'second' && value < 45) return future ? 'in a moment' : 'just now'
  const label = `${value} ${unit}${value === 1 ? '' : 's'}`
  return future ? `in ${label}` : `${label} ago`
}

export function daysUntil(dateInput: string, now = new Date()) {
  const [y, m, d] = dateInput.split('-').map(Number)
  const target = new Date(y, (m ?? 1) - 1, d ?? 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function formatDueLabel(dateInput: string) {
  const days = daysUntil(dateInput)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days === -1) return 'Overdue by 1 day'
  if (days < 0) return `Overdue by ${Math.abs(days)} days`
  if (days < 7) return `Due in ${days} days`
  const [y, m, d] = dateInput.split('-').map(Number)
  return `Due ${formatShortDate(new Date(y, (m ?? 1) - 1, d ?? 1).toISOString())}`
}

export function percentChange(current: number, previous: number) {
  if (!previous) return 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}
