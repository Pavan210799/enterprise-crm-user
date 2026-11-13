import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, CalendarCheck, CheckSquare, CircleDollarSign, GitBranch, ListTodo, Percent, UserPlus, Users } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectKpis, selectTodayFocus } from '@/features/workspace/workspaceSelectors'
import { StatCard } from '@/components/dashboard/StatCard'
import { SalesPerformanceChart } from '@/components/dashboard/SalesPerformanceChart'
import { LeadConversionChart } from '@/components/dashboard/LeadConversionChart'
import { PipelineStages } from '@/components/dashboard/PipelineStages'
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks'
import { RecentActivityList } from '@/components/dashboard/RecentActivityList'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { formatCompactCurrency, greeting } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)
  const kpis = useAppSelector(selectKpis)
  const focus = useAppSelector(selectTodayFocus)
  const firstName = user?.name.split(' ')[0] ?? 'there'

  const heroStats = [
    { icon: CalendarCheck, label: 'Due today', value: focus.dueToday },
    { icon: ListTodo, label: 'Overdue', value: focus.overdue },
    { icon: CheckSquare, label: 'Pending tasks', value: focus.open },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl bg-hero-gradient p-5 text-white shadow-[0_24px_60px_-24px_rgb(45_20_82_/_0.7)] sm:p-7">
        <div className="grid-pattern absolute inset-0 -z-10" aria-hidden />
        <div className="absolute -top-20 right-0 -z-10 size-72 animate-float rounded-full bg-aurora/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 left-1/3 -z-10 size-72 animate-float-slow rounded-full bg-orchid/30 blur-3xl" aria-hidden />

        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-aurora uppercase">Your workspace</p>
            <h2 className="mt-2 font-display text-2xl leading-tight font-bold sm:text-3xl">
              {greeting()}, <span className="text-gradient-brand">{firstName}</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              {kpis.completedDeals} deals closed · {formatWhole(kpis.conversion)}% lead conversion · {formatWhole(kpis.taskCompletion)}% of tasks done
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/tasks" className={buttonStyles({ className: 'group bg-none bg-white text-plum-900 shadow-none hover:bg-white' })}>
                <span className="relative z-[2]">Review tasks</span>
                <ArrowRight className="relative z-[2] size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/pipeline"
                className={buttonStyles({ variant: 'outline', className: 'border-white/25 bg-white/10 text-white backdrop-blur hover:border-white/40 hover:bg-white/15 hover:text-white' })}
              >
                <GitBranch className="size-4" /> Open pipeline
              </Link>
            </div>
          </div>

          <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 xl:w-[26rem] xl:shrink-0">
            {heroStats.map(({ icon: Icon, label, value }) => (
              <li key={label} className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
                <Icon className="size-5 text-aurora" />
                <p className="mt-2 font-display text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
                <p className="truncate text-xs text-white/65">{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <StatCard label="Assigned leads" value={kpis.assignedLeads} format={formatWhole} change={kpis.changes.assignedLeads} icon={UserPlus} color="#0891B2" gradient="from-aurora-deep to-aurora" to="/leads" />
        <StatCard label="Active customers" value={kpis.activeCustomers} format={formatWhole} change={kpis.changes.activeCustomers} icon={Users} color="#7C3AED" gradient="from-brand to-violet-400" to="/customers" />
        <StatCard label="Ongoing deals" value={kpis.ongoingDeals} format={formatWhole} change={kpis.changes.ongoingDeals} icon={Briefcase} color="#C026D3" gradient="from-orchid to-fuchsia-400" to="/pipeline" />
        <StatCard label="Pending tasks" value={kpis.pendingTasks} format={formatWhole} change={kpis.changes.pendingTasks} icon={CheckSquare} color="#F59E0B" gradient="from-amber-500 to-warning" to="/tasks" improveWhen="down" />
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Performance metrics">
        <PerformanceTile icon={CircleDollarSign} label="Won this month" value={formatCompactCurrency(kpis.wonRevenue)} />
        <PerformanceTile icon={Percent} label="Lead conversion" value={`${formatWhole(kpis.conversion)}%`} />
        <PerformanceTile icon={GitBranch} label="Completed deals" value={String(kpis.completedDeals)} />
        <PerformanceTile icon={CheckSquare} label="Tasks completed" value={`${formatWhole(kpis.taskCompletion)}%`} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SalesPerformanceChart className="xl:col-span-2" />
        <LeadConversionChart />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PipelineStages />
        <UpcomingTasks />
      </section>

      <RecentActivityList />
    </div>
  )
}

function formatWhole(value: number) {
  return Math.round(value).toString()
}

function PerformanceTile({ icon: Icon, label, value }: { icon: typeof Percent; label: string; value: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/80 bg-surface px-4 py-3 shadow-[var(--shadow-card)]')}>
      <Icon className="size-4 text-brand" />
      <p className="mt-2 font-display text-xl font-bold text-ink tabular-nums">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  )
}
