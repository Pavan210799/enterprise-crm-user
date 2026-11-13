import { Link, useNavigate } from 'react-router-dom'
import { Bell, CalendarPlus, CheckCheck, CheckSquare, ChevronDown, GitBranch, LogOut, Plus, Settings, UserPlus, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { timeAgo } from '@/lib/format'
import { Popover } from '@/components/ui/Popover'
import { Avatar } from '@/components/ui/Avatar'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { logout } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { selectNotifications, selectUnreadCount } from '@/features/workspace/workspaceSelectors'
import { markAllNotificationsRead, setNotificationRead } from '@/features/workspace/workspaceSlice'
import { navItemForPath } from '@/lib/constants'
import { notificationMeta } from '@/lib/notificationKind'
import { cn } from '@/lib/cn'
import type { UserRole } from '@/types'
import type { LucideIcon } from 'lucide-react'

const QUICK_CREATE: { label: string; description: string; icon: LucideIcon; to: string; tint: string }[] = [
  { label: 'New lead', description: 'Capture an opportunity', icon: UserPlus, to: '/leads?new=1', tint: 'bg-aurora-soft text-aurora-deep' },
  { label: 'New deal', description: 'Add to the pipeline', icon: GitBranch, to: '/pipeline?new=1', tint: 'bg-brand-soft text-brand' },
  { label: 'New task', description: 'Set a priority and deadline', icon: CheckSquare, to: '/tasks?new=1', tint: 'bg-warning-soft text-amber-700' },
  { label: 'New customer', description: 'Create a profile', icon: Users, to: '/customers?new=1', tint: 'bg-success-soft text-emerald-700' },
  { label: 'Log activity', description: 'Call, email, meeting', icon: CalendarPlus, to: '/activities?new=1', tint: 'bg-fuchsia-100 text-orchid' },
]

function allowed(role: UserRole | undefined, to: string) {
  if (!role) return false
  const item = navItemForPath(to.split('?')[0] ?? to)
  return Boolean(item?.roles.includes(role))
}

export function QuickCreateMenu() {
  const navigate = useNavigate()
  const role = useAppSelector((s) => s.auth.user?.role)
  const items = QUICK_CREATE.filter((item) => allowed(role, item.to))

  return (
    <Popover
      className="hidden sm:block"
      panelClassName="sm:w-72"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          className={buttonStyles({ variant: 'primary', size: 'md', className: 'px-3.5' })}
        >
          <Plus className={cn('relative z-[2] size-4 transition-transform duration-300', open && 'rotate-45')} aria-hidden />
          <span className="relative z-[2] hidden md:inline">Create</span>
        </button>
      )}
    >
      {(close) => (
        <div className="p-2" role="menu">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.to}
                type="button"
                role="menuitem"
                onClick={() => {
                  close()
                  navigate(item.to)
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all hover:bg-canvas-muted"
              >
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-110', item.tint)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block truncate text-xs text-ink-subtle">{item.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </Popover>
  )
}

const MENU_LIMIT = 8

export function NotificationsMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectNotifications)
  const unread = useAppSelector(selectUnreadCount)

  return (
    <Popover
      panelClassName="sm:w-96"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
          className={cn(
            'group relative grid size-9 place-items-center rounded-xl text-ink-muted transition-all duration-200 hover:bg-brand-soft hover:text-brand sm:size-10',
            open && 'bg-brand-soft text-brand',
          )}
        >
          <Bell className="size-5 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 grid size-4.5 place-items-center rounded-full bg-orchid text-[10px] font-bold text-white ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-ink">Notifications</p>
              <p className="text-xs text-ink-subtle">{unread ? `${unread} unread` : 'You are all caught up'}</p>
            </div>
            {unread ? (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-soft"
              >
                <CheckCheck className="size-4" aria-hidden /> Mark all read
              </button>
            ) : null}
          </div>
          {items.length === 0 ? <p className="px-4 py-8 text-center text-sm text-ink-muted">No notifications yet.</p> : null}
          <ul className="scrollbar-thin max-h-[min(24rem,60dvh)] overflow-y-auto p-2">
            {items.slice(0, MENU_LIMIT).map((item) => {
              const meta = notificationMeta(item.kind)
              const Icon = meta.icon
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      close()
                      if (!item.read) dispatch(setNotificationRead({ id: item.id, read: true }))
                      if (item.link) navigate(item.link)
                    }}
                    className="flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-canvas-muted"
                  >
                    <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', meta.tint)}>
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn('truncate text-sm text-ink', item.read ? 'font-medium' : 'font-bold')}>{item.title}</span>
                        {!item.read ? <span className="size-2 shrink-0 rounded-full bg-orchid" /> : null}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-ink-muted">{item.message}</span>
                      <span className="mt-1 block text-[11px] font-medium text-ink-subtle">{timeAgo(item.createdAt)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-border/70 p-2">
            <Link
              to="/notifications"
              onClick={close}
              className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand-soft"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </Popover>
  )
}

export function UserMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const name = user?.name ?? 'Guest'

  function handleLogout(close: () => void) {
    close()
    dispatch(logout())
    dispatch(pushToast({ tone: 'info', title: 'Signed out', message: 'See you soon.' }))
    navigate('/login', { replace: true })
  }

  return (
    <Popover
      panelClassName="sm:w-72"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Account menu"
          className={cn(
            'flex items-center gap-2 rounded-2xl p-1 transition-all duration-200 hover:bg-canvas-muted xl:pr-2.5',
            open && 'bg-canvas-muted',
          )}
        >
          <span className="relative">
            <Avatar name={name} size="sm" className="sm:size-9" />
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-white" aria-hidden />
          </span>
          <span className="hidden max-w-36 text-left leading-tight xl:block">
            <span className="block truncate text-sm font-semibold text-ink">{name}</span>
            <span className="block truncate text-xs text-ink-subtle">{user?.roleLabel}</span>
          </span>
          <ChevronDown className={cn('hidden size-4 text-ink-subtle transition-transform duration-300 xl:block', open && 'rotate-180')} aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="relative overflow-hidden bg-hero-gradient px-4 py-4 text-white">
            <div className="grid-pattern absolute inset-0 opacity-50" aria-hidden />
            <div className="relative flex items-center gap-3">
              <Avatar name={name} size="lg" className="ring-white/30" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-xs text-white/70">{user?.email}</p>
                <p className="mt-0.5 truncate text-xs text-aurora">{user?.roleLabel}</p>
              </div>
            </div>
          </div>
          <div className="p-2" role="menu">
            <Link
              to="/settings"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas-muted"
            >
              <Settings className="size-4 text-ink-subtle" /> Profile & settings
            </Link>
            <Link
              to="/notifications"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas-muted"
            >
              <Bell className="size-4 text-ink-subtle" /> Notifications
            </Link>
            <div className="my-1 h-px bg-border/70" />
            <button
              type="button"
              role="menuitem"
              onClick={() => handleLogout(close)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-danger transition hover:bg-danger-soft"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </Popover>
  )
}
