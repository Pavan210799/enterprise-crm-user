import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { dismissToast, type Toast } from '@/features/toasts/toastsSlice'
import { cn } from '@/lib/cn'

const toneStyles = {
  success: { icon: CheckCircle2, ring: 'text-success', bar: 'bg-success' },
  error: { icon: XCircle, ring: 'text-danger', bar: 'bg-danger' },
  info: { icon: Info, ring: 'text-brand', bar: 'bg-brand' },
}

const DURATION = 3800

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()
  const tone = toneStyles[toast.tone]
  const Icon = tone.icon

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), DURATION)
    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto relative flex w-full animate-toast-in items-start gap-3 overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-4 pr-11 shadow-[0_20px_50px_-15px_rgb(26_11_46_/_0.35)] backdrop-blur-xl"
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0 animate-pop', tone.ring)} aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.message ? <p className="mt-0.5 text-sm text-ink-muted">{toast.message}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="absolute top-3 right-3 rounded-lg p-1 text-ink-subtle transition hover:bg-canvas-muted hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
      <span
        className={cn('absolute bottom-0 left-0 h-0.5 w-full origin-left', tone.bar)}
        style={{ animation: `grow-x ${DURATION}ms linear reverse both` }}
        aria-hidden
      />
    </div>
  )
}

export function Toaster() {
  const toasts = useAppSelector((s) => s.toasts.items)
  if (toasts.length === 0) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[90] flex flex-col gap-2 sm:inset-x-auto sm:top-5 sm:right-5 sm:w-96">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
