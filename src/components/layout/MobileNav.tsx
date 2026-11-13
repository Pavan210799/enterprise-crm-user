import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { SidebarNav } from './SidebarNav'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setMobileNavOpen } from '@/features/ui/uiSlice'
import { useScrollLock } from '@/hooks/useScrollLock'

export function MobileNav() {
  const open = useAppSelector((s) => s.ui.mobileNavOpen)
  const dispatch = useAppDispatch()
  const { pathname } = useLocation()
  useScrollLock(open)

  useEffect(() => {
    dispatch(setMobileNavOpen(false))
  }, [pathname, dispatch])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setMobileNavOpen(false))
    }
    const onResize = () => {
      if (window.innerWidth >= 1024) dispatch(setMobileNavOpen(false))
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open, dispatch])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-plum-950/60 backdrop-blur-sm"
        aria-label="Close navigation"
        onClick={() => dispatch(setMobileNavOpen(false))}
      />
      <aside className="relative flex h-full w-[min(85vw,18rem)] animate-slide-in-left flex-col bg-sidebar-gradient shadow-sidebar">
        <button
          type="button"
          className="absolute top-4 right-3 z-10 grid size-9 place-items-center rounded-xl text-white/70 transition-all duration-300 hover:rotate-90 hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
          onClick={() => dispatch(setMobileNavOpen(false))}
        >
          <X className="size-5" />
        </button>
        <SidebarNav onNavigate={() => dispatch(setMobileNavOpen(false))} />
      </aside>
    </div>,
    document.body,
  )
}
