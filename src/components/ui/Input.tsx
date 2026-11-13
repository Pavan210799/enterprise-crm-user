import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, leftIcon, rightSlot, containerClassName, ...props }, ref) => {
    const autoId = useId()
    const inputId = id ?? (props.name ? `${props.name}-${autoId}` : autoId)
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

    return (
      <div className={cn('min-w-0 space-y-1.5', containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink">
            {label}
          </label>
        ) : null}
        <div className="group/input relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-subtle transition-colors group-focus-within/input:text-brand [&>svg]:size-4">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-11 w-full min-w-0 rounded-xl border bg-surface px-3.5 text-base text-ink sm:text-sm shadow-sm transition-all duration-200 placeholder:text-ink-subtle hover:border-brand/30 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
              error
                ? 'border-danger focus-visible:border-danger focus-visible:ring-danger/15'
                : 'border-border focus-visible:border-brand/50 focus-visible:ring-brand/12',
              leftIcon ? 'pl-10' : null,
              rightSlot ? 'pr-11' : null,
              className,
            )}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            {...props}
          />
          {rightSlot ? <span className="absolute top-1/2 right-1.5 -translate-y-1/2">{rightSlot}</span> : null}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="animate-slide-down text-xs font-medium text-danger" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-ink-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
