import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, error, id, options, containerClassName, ...props }, ref) => {
  const autoId = useId()
  const selectId = id ?? (props.name ? `${props.name}-${autoId}` : autoId)

  return (
    <div className={cn('min-w-0 space-y-1.5', containerClassName)}>
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border bg-surface pr-10 pl-3.5 text-base text-ink sm:text-sm shadow-sm transition-all duration-200 hover:border-brand/30 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-danger focus-visible:ring-danger/15' : 'border-border focus-visible:border-brand/50 focus-visible:ring-brand/12',
            className,
          )}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})

Select.displayName = 'Select'
