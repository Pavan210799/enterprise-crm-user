import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PopoverProps = {
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  panelClassName?: string
  className?: string
}

export function Popover({ trigger, children, panelClassName, className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          className={cn(
            'scrollbar-thin fixed inset-x-3 top-[4.75rem] z-50 max-h-[calc(100dvh-5.75rem-var(--host-badge-space))] origin-top animate-scale-in overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-border/80 bg-surface/95 shadow-[0_24px_60px_-18px_rgb(26_11_46_/_0.35)] backdrop-blur-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2.5 sm:origin-top-right',
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  )
}
