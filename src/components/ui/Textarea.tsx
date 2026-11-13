import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, id, ...props }, ref) => {
  const autoId = useId()
  const textareaId = id ?? (props.name ? `${props.name}-${autoId}` : autoId)

  return (
    <div className="min-w-0 space-y-1.5">
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'min-h-24 w-full resize-y rounded-xl border bg-surface px-3.5 py-2.5 text-base text-ink sm:text-sm shadow-sm transition-all duration-200 placeholder:text-ink-subtle hover:border-brand/30 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-danger focus-visible:ring-danger/15' : 'border-border focus-visible:border-brand/50 focus-visible:ring-brand/12',
          className,
        )}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})

Textarea.displayName = 'Textarea'
