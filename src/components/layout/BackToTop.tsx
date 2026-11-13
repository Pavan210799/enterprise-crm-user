import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'

const SHOW_AFTER = 360
const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setVisible(window.scrollY > SHOW_AFTER)
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible || undefined}
      onClick={() => {
        const reduce = document.documentElement.classList.contains('reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })
      }}
      className={cn(
        'group fixed right-4 bottom-[calc(1rem+var(--host-badge-space))] z-40 grid size-12 place-items-center rounded-full bg-plum-900 text-white shadow-[0_14px_34px_-8px_rgb(45_20_82_/_0.6)] transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:bg-brand sm:right-6 sm:bottom-[calc(1.5rem+var(--host-badge-space))]',
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 scale-75 opacity-0',
      )}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="2.5" />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
      <ArrowUp className="relative size-5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
    </button>
  )
}
