import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, Mail, MapPin, Shield, User, UserCog, type LucideIcon } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectKpis } from '@/features/workspace/workspaceSelectors'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { AccountPanel } from '@/components/settings/AccountPanel'
import { NotificationPreferences } from '@/components/settings/NotificationPreferences'
import { SecurityPanel } from '@/components/settings/SecurityPanel'
import { formatCompactCurrency } from '@/lib/format'
import { cn } from '@/lib/cn'

type Tab = 'profile' | 'account' | 'notifications' | 'security'

const TABS: { value: Tab; label: string; shortLabel: string; description: string; icon: LucideIcon }[] = [
  { value: 'profile', label: 'Profile', shortLabel: 'Profile', description: 'Name, contact, and bio', icon: User },
  { value: 'account', label: 'Account', shortLabel: 'Account', description: 'Role, access, and display', icon: UserCog },
  { value: 'notifications', label: 'Notifications', shortLabel: 'Alerts', description: 'Alerts and email digest', icon: Bell },
  { value: 'security', label: 'Security', shortLabel: 'Security', description: 'Password and sessions', icon: Shield },
]

/** Matches the sticky nav's `lg:top-24`, so the panel lands just under the topbar. */
const PANEL_OFFSET = 96

function isTab(value: string | null): value is Tab {
  return TABS.some((tab) => tab.value === value)
}

export default function SettingsPage() {
  const user = useAppSelector((s) => s.auth.user)
  const kpis = useAppSelector(selectKpis)
  const [params, setParams] = useSearchParams()
  const panelsRef = useRef<HTMLDivElement>(null)
  const requested = params.get('tab')
  const tab: Tab = isTab(requested) ? requested : 'profile'

  if (!user) return null

  function selectTab(next: Tab) {
    const query = new URLSearchParams(params)
    if (next === 'profile') query.delete('tab')
    else query.set('tab', next)
    setParams(query, { replace: true })
    const top = panelsRef.current?.getBoundingClientRect().top ?? 0
    if (top < PANEL_OFFSET) {
      const reduce = document.documentElement.classList.contains('reduce-motion') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: window.scrollY + top - PANEL_OFFSET, behavior: reduce ? 'instant' : 'smooth' })
    }
  }

  const highlights = [
    { label: 'Leads', value: kpis.assignedLeads },
    { label: 'Deals won', value: kpis.completedDeals },
    { label: 'Revenue', value: formatCompactCurrency(kpis.wonRevenue) },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl bg-hero-gradient p-5 text-white shadow-[0_24px_60px_-24px_rgb(45_20_82_/_0.7)] sm:p-7">
        <div className="grid-pattern absolute inset-0 -z-10" aria-hidden />
        <div className="absolute -top-24 right-0 -z-10 size-72 animate-float rounded-full bg-aurora/25 blur-3xl" aria-hidden />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={user.name} size="xl" className="ring-4 ring-white/20 sm:size-20 sm:text-2xl" />
            <div className="min-w-0">
              <h2 className="truncate font-display text-xl font-bold sm:text-2xl">{user.name}</h2>
              <p className="text-sm text-white/75">
                {user.jobTitle ? `${user.jobTitle} · ` : ''}
                <span className="text-aurora">{user.roleLabel}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/65">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{user.email}</span>
                </span>
                {user.location ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{user.location}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:w-[24rem] lg:shrink-0">
            {highlights.map((item) => (
              <li key={item.label} className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition-colors duration-300 hover:bg-white/15">
                <p className="truncate font-display text-xl font-bold tabular-nums sm:text-2xl">{item.value}</p>
                <p className="truncate text-xs text-white/65">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div ref={panelsRef} className="grid grid-cols-1 gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="grid grid-cols-4 gap-1 rounded-2xl border border-border/80 bg-surface/80 p-1.5 shadow-[var(--shadow-soft)] backdrop-blur lg:hidden">
          {TABS.map(({ value, shortLabel, icon: Icon }) => {
            const active = value === tab
            return (
              <button
                key={value}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(value)}
                className={cn(
                  'flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-all duration-200 sm:flex-row sm:justify-center sm:gap-2 sm:text-sm',
                  active ? 'bg-brand-gradient text-white shadow-[0_6px_16px_-8px_rgb(124_58_237_/_0.8)]' : 'text-ink-muted hover:bg-brand-soft/70 hover:text-brand',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{shortLabel}</span>
              </button>
            )
          })}
        </nav>
        <Card padding="sm" className="hidden self-start lg:sticky lg:top-24 lg:block">
          <nav aria-label="Settings sections" className="space-y-1">
            {TABS.map(({ value, label, description, icon: Icon }) => {
              const active = value === tab
              return (
                <button
                  key={value}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => selectTab(value)}
                  className={cn(
                    'group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                    active ? 'bg-brand-soft/70 text-brand' : 'text-ink-muted hover:bg-canvas-muted hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-300 group-hover:scale-105',
                      active ? 'bg-brand-gradient text-white shadow-[0_6px_16px_-6px_rgb(124_58_237_/_0.7)]' : 'bg-canvas-muted text-ink-subtle',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-ink-subtle">{description}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </Card>

        <div key={tab} className="min-w-0 animate-fade-up">
          {tab === 'profile' ? <ProfileForm key={user.id} user={user} /> : null}
          {tab === 'account' ? <AccountPanel user={user} /> : null}
          {tab === 'notifications' ? <NotificationPreferences /> : null}
          {tab === 'security' ? <SecurityPanel user={user} /> : null}
        </div>
      </div>
    </div>
  )
}
