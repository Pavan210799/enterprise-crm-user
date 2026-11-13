type TooltipEntry = { name?: string | number; value?: number | string | (number | string)[]; color?: string; dataKey?: string | number }

export function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean
  payload?: readonly TooltipEntry[]
  label?: string | number
  formatValue?: (value: number, name: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-36 animate-scale-in rounded-xl border border-border bg-surface/95 px-3 py-2.5 shadow-[var(--shadow-lift)] backdrop-blur">
      {label !== undefined && label !== '' ? <p className="mb-1.5 text-xs font-semibold text-ink">{label}</p> : null}
      <ul className="space-y-1">
        {payload.map((entry) => {
          const raw = Array.isArray(entry.value) ? entry.value[0] : entry.value
          const num = Number(raw ?? 0)
          const name = String(entry.name ?? entry.dataKey ?? '')
          return (
            <li key={name} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {name}
              </span>
              <span className="font-semibold text-ink tabular-nums">{formatValue ? formatValue(num, name) : num.toLocaleString()}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
