import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  showLabel?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function Checkbox({ checked, onChange, label, showLabel = false, className, size = 'md' }: CheckboxProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2.5 select-none', className)}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={showLabel ? undefined : label}
      />
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20',
          size === 'sm' ? 'size-5' : 'size-6',
          checked
            ? 'border-transparent bg-brand-gradient text-white shadow-[0_6px_14px_-4px_rgb(124_58_237_/_0.6)]'
            : 'border-border-strong bg-surface hover:border-brand/60 hover:bg-brand-soft/60',
        )}
        aria-hidden
      >
        {checked ? <Check className={cn('animate-pop', size === 'sm' ? 'size-3' : 'size-3.5')} strokeWidth={3} /> : null}
      </span>
      {showLabel ? <span className="text-sm text-ink-muted">{label}</span> : null}
    </label>
  )
}
