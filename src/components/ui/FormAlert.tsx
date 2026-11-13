import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

export function FormAlert({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex animate-slide-down items-start gap-2.5 rounded-xl border border-danger/25 bg-danger-soft/70 px-3.5 py-3 text-sm text-red-800',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="min-w-0">{message}</span>
    </div>
  )
}
