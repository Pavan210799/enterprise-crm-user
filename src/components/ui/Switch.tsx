import { useId } from 'react'
import { cn } from '@/lib/cn'

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex min-w-0 items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-semibold text-ink">
          {label}
        </label>
        {description ? <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand-gradient shadow-[0_6px_16px_-6px_rgb(124_58_237_/_0.7)]' : 'bg-border-strong hover:bg-ink-subtle/60',
        )}
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow-[0_2px_6px_rgb(18_10_31_/_0.25)] transition-transform duration-300 ease-[var(--ease-out-expo)]',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  )
}
