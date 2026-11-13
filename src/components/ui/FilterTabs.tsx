import { cn } from '@/lib/cn'

type FilterTab<T extends string> = { value: T; label: string; count?: number }

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="no-scrollbar flex snap-x gap-1.5 overflow-x-auto overscroll-x-contain rounded-2xl border border-border/80 bg-surface/80 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={(event) => {
              event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
              onChange(tab.value)
            }}
            className={cn(
              'inline-flex shrink-0 snap-start items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200',
              active ? 'bg-brand-gradient text-white shadow-[0_4px_12px_-4px_rgb(124_58_237_/_0.7)]' : 'text-ink-muted hover:bg-brand-soft/70 hover:text-brand',
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className={cn('min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums', active ? 'bg-white/20 text-white' : 'bg-canvas-muted text-ink-subtle')}>
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
