import { cn } from '@/lib/cn'

export function RangeToggle<T extends string | number>({
  options,
  value,
  onChange,
  label = 'Date range',
}: {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div className="inline-flex rounded-xl bg-canvas-muted p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
            option.value === value ? 'bg-surface text-brand shadow-[var(--shadow-soft)]' : 'text-ink-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
