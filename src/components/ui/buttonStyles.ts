import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'shine bg-brand-gradient animate-gradient text-white shadow-[0_8px_24px_-6px_rgb(124_58_237_/_0.55)] hover:shadow-[0_14px_32px_-8px_rgb(124_58_237_/_0.7)] hover:-translate-y-0.5 focus-visible:ring-brand/40',
  secondary:
    'bg-aurora-soft text-aurora-deep ring-1 ring-inset ring-aurora/30 hover:bg-cyan-100 hover:-translate-y-0.5 focus-visible:ring-aurora/40',
  soft: 'bg-brand-soft text-brand hover:bg-violet-200/70 focus-visible:ring-brand/30',
  ghost: 'text-ink-muted hover:bg-canvas-muted hover:text-ink focus-visible:ring-brand/30',
  danger:
    'bg-danger text-white shadow-[0_8px_20px_-8px_rgb(239_68_68_/_0.6)] hover:bg-red-600 hover:-translate-y-0.5 focus-visible:ring-danger/40',
  outline:
    'border border-border-strong bg-surface text-ink hover:border-brand/40 hover:bg-brand-soft/50 hover:text-brand focus-visible:ring-brand/30',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs font-semibold',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm font-semibold',
  lg: 'h-12 gap-2 rounded-xl px-6 text-sm font-semibold',
  icon: 'size-10 shrink-0 rounded-xl p-0',
  'icon-sm': 'size-8 shrink-0 rounded-lg p-0',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-55',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )
}
