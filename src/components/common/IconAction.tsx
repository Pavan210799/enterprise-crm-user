import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const toneStyles = {
  default: 'hover:bg-brand-soft hover:text-brand',
  danger: 'hover:bg-danger-soft hover:text-danger',
  success: 'hover:bg-success-soft hover:text-emerald-700',
}

export function IconAction({
  icon: Icon,
  label,
  tone = 'default',
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: LucideIcon
  label: string
  tone?: 'default' | 'danger' | 'success'
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn('grid size-8 shrink-0 place-items-center rounded-lg text-ink-subtle transition hover:-translate-y-0.5 active:scale-90', toneStyles[tone], className)}
      {...props}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}
