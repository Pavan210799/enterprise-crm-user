import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCommandOpen, setMobileNavOpen, toggleSidebar } from '@/features/ui/uiSlice'
import { navItemForPath } from '@/lib/constants'
import { greeting } from '@/lib/format'
import { cn } from '@/lib/cn'
import { NotificationsMenu, QuickCreateMenu, UserMenu } from './TopbarMenus'

type TopbarProps = {
  title: string
}

const iconButton =
  'grid size-9 shrink-0 place-items-center rounded-xl text-ink-muted transition-all duration-200 hover:bg-brand-soft hover:text-brand active:scale-95 sm:size-10'

export function Topbar({ title }: TopbarProps) {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed)
  const user = useAppSelector((s) => s.auth.user)
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const PageIcon = navItemForPath(pathname)?.icon
  const isDashboard = pathname === '/'
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b bg-surface/75 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300',
        scrolled ? 'border-border/80 shadow-[0_10px_30px_-18px_rgb(45_20_82_/_0.35)]' : 'border-transparent',
      )}
    >
      <div className="flex h-[4.5rem] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className={cn(iconButton, 'lg:hidden')}
          aria-label="Open navigation menu"
          onClick={() => dispatch(setMobileNavOpen(true))}
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          className={cn(iconButton, 'hidden lg:grid')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => dispatch(toggleSidebar())}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          {PageIcon ? (
            <span
              key={pathname}
              className="hidden size-10 shrink-0 animate-pop place-items-center rounded-xl bg-brand-gradient text-white shadow-[var(--shadow-glow)] sm:grid"
              aria-hidden
            >
              <PageIcon className="size-5" />
            </span>
          ) : null}
          <h1 key={title} className="min-w-0 animate-fade-in truncate font-display text-base font-bold tracking-tight text-ink sm:text-xl">
            {isDashboard && user ? (
              <>
                <span className="2xl:hidden">Dashboard</span>
                <span className="hidden 2xl:inline">
                  {greeting()},{' '}
                  <span className="bg-linear-to-r from-brand to-orchid bg-clip-text text-transparent">
                    {user.name.split(' ')[0]}
                  </span>
                </span>
              </>
            ) : (
              title
            )}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setCommandOpen(true))}
          className="group hidden h-10 w-52 shrink-0 items-center gap-2.5 rounded-xl border border-border bg-surface-raised/80 px-3 text-sm text-ink-subtle transition-all duration-200 hover:border-brand/40 hover:bg-surface hover:shadow-[var(--shadow-soft)] md:flex lg:w-60 xl:w-72"
          aria-label="Search"
        >
          <Search className="size-4 shrink-0 transition-colors group-hover:text-brand" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left">Search pages…</span>
          <kbd className="shrink-0 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink-subtle">
            {isMac ? '⌘' : 'Ctrl'} K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <button
            type="button"
            className={cn(iconButton, 'md:hidden')}
            aria-label="Search"
            onClick={() => dispatch(setCommandOpen(true))}
          >
            <Search className="size-5" />
          </button>
          <QuickCreateMenu />
          <NotificationsMenu />
          <span className="mx-1 hidden h-7 w-px bg-border sm:block" aria-hidden />
          <UserMenu />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand/40 to-transparent" aria-hidden />
    </header>
  )
}
