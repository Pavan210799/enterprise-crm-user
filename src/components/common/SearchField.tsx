import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}) {
  return (
    <Input
      type="search"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      leftIcon={<Search />}
      containerClassName={cn('w-full', className)}
      className="[&::-webkit-search-cancel-button]:hidden"
      rightSlot={
        value ? (
          <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="grid size-8 place-items-center rounded-lg text-ink-subtle transition hover:bg-canvas-muted hover:text-brand">
            <X className="size-4" />
          </button>
        ) : null
      }
    />
  )
}
