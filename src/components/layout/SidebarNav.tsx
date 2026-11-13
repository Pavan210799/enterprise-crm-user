import { LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_SECTIONS } from '@/lib/constants'
import { selectNavBadges } from '@/features/workspace/workspaceSelectors'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'

type SidebarNavProps = {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const badges = useAppSelector(selectNavBadges)
  const sections = NAV_SECTIONS

  function handleLogout() {
    onNavigate?.()
    dispatch(logout())
    dispatch(pushToast({ tone: 'info', title: 'Signed out', message: 'See you soon.' }))
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-[4.5rem] shrink-0 items-center border-b border-white/10', collapsed ? 'justify-center px-2' : 'px-5')}>
        <NavLink to="/" onClick={onNavigate} className="rounded-xl transition-transform duration-300 hover:scale-[1.03]" aria-label="NexRel home">
          <Logo compact={collapsed} />
        </NavLink>
      </div>

      <nav className="scrollbar-dark min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-5" aria-label="Main">
        {sections.map((section) => (
          <div key={section.title}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-8 bg-white/10" aria-hidden />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">{section.title}</p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const badge = badges[item.to as keyof typeof badges] ?? 0
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-300',
                          collapsed && 'justify-center px-2',
                          isActive
                            ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12)]'
                            : 'text-white/65 hover:translate-x-1 hover:bg-white/[0.07] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-linear-to-b from-aurora to-brand-glow transition-all duration-300',
                              isActive ? 'opacity-100' : 'scale-y-0 opacity-0',
                            )}
                            aria-hidden
                          />
                          <span
                            className={cn(
                              'relative flex size-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
                              isActive
                                ? 'bg-linear-to-br from-aurora/30 to-brand-glow/35 text-aurora shadow-[0_0_20px_-4px_rgb(34_211_238_/_0.6)]'
                                : 'bg-white/5 text-white/70 group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:text-aurora',
                            )}
                          >
                            <Icon className="size-[18px]" aria-hidden />
                            {collapsed && badge > 0 ? (
                              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-orchid ring-2 ring-plum-900" />
                            ) : null}
                          </span>
                          {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                          {!collapsed && badge > 0 ? (
                            <span className="rounded-full bg-orchid/90 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                              {badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 border-t border-white/10 p-3 max-lg:pb-[max(0.75rem,var(--host-badge-space))]', collapsed && 'px-2')}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/10 transition-colors hover:bg-white/10',
            collapsed && 'flex-col p-2',
          )}
        >
          <Avatar name={user?.name ?? 'Guest'} size="md" className="ring-white/20" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-white/60">{user?.roleLabel}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white/60 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
