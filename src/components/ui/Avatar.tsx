import { cn } from '@/lib/cn'

type AvatarProps = {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-11 text-base',
  xl: 'size-16 text-xl',
}

const gradients = [
  'from-brand to-aurora-deep',
  'from-orchid to-brand',
  'from-aurora-deep to-emerald-500',
  'from-plum-700 to-orchid',
  'from-sky-500 to-brand',
  'from-amber-500 to-orchid',
]

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function hash(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br font-semibold text-white ring-2 ring-white',
        gradients[hash(name) % gradients.length],
        sizeStyles[size],
        className,
      )}
      title={name}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
