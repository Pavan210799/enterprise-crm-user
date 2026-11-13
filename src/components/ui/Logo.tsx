import { useId } from 'react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/constants'

type LogoProps = {
  compact?: boolean
  tone?: 'light' | 'dark'
  className?: string
}

export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <span
      className={cn(
        'relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-plum-950 ring-1 ring-white/15',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="size-7" fill="none">
        <circle cx="20" cy="20" r="5" fill={`url(#core-${id})`} />
        <g className="origin-center animate-spin-slow" style={{ transformBox: 'fill-box' }}>
          <ellipse cx="20" cy="20" rx="14" ry="6" stroke={`url(#ring-${id})`} strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="14" ry="6" stroke={`url(#ring-${id})`} strokeWidth="1.5" transform="rotate(60 20 20)" />
          <ellipse cx="20" cy="20" rx="14" ry="6" stroke={`url(#ring-${id})`} strokeWidth="1.5" transform="rotate(-60 20 20)" />
        </g>
        <circle cx="31" cy="11" r="1.75" fill="#A78BFA" />
        <defs>
          <linearGradient id={`core-${id}`} x1="15" y1="15" x2="25" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id={`ring-${id}`} x1="6" y1="20" x2="34" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#C4B5FD" stopOpacity="0.6" />
            <stop offset="1" stopColor="#A855F7" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-aurora/20 to-brand-glow/10" />
    </span>
  )
}

export function Logo({ compact = false, tone = 'light', className }: LogoProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-3', className)}>
      <LogoMark />
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className={cn('block font-display text-lg font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
            {APP_NAME}
          </span>
          <span
            className={cn(
              'block truncate text-[10px] font-semibold tracking-[0.22em] uppercase',
              tone === 'light' ? 'text-white/60' : 'text-ink-subtle',
            )}
          >
            User workspace
          </span>
        </span>
      )}
    </span>
  )
}
