import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from '@/components/ui/Input'
import { FormAlert as BaseFormAlert } from '@/components/ui/FormAlert'
import { cn } from '@/lib/cn'
import { passwordStrength } from '@/lib/validation'

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div>
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-[0_30px_80px_-30px_rgb(45_20_82_/_0.35)] backdrop-blur-xl sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
      {footer ? <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div> : null}
    </div>
  )
}

export function FormAlert({ message }: { message: string }) {
  return <BaseFormAlert message={message} className="mb-5" />
}

export function PasswordInput(props: Omit<InputProps, 'type' | 'rightSlot'>) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="grid size-8 place-items-center rounded-lg text-ink-subtle transition hover:bg-canvas-muted hover:text-brand"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  )
}

const strengthColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-aurora-deep', 'bg-success']

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const strength = passwordStrength(value)
  return (
    <div className="flex animate-fade-in items-center gap-3">
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              index < strength.score ? strengthColors[strength.score] : 'bg-border',
            )}
          />
        ))}
      </div>
      <span className="w-16 shrink-0 text-right text-xs font-semibold text-ink-muted">{strength.label}</span>
    </div>
  )
}
