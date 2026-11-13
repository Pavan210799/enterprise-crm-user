import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { AuthSkeleton } from '@/components/ui/Skeleton'
import { RouteLoader } from './RouteLoader'

const highlights = [
  { icon: UserRound, title: 'Your day at a glance', text: 'Leads, deals, tasks, and follow-ups together in one workspace.' },
  { icon: ShieldCheck, title: 'Built for your role', text: 'Employees, sales reps, and managers each get the actions their role allows.' },
  { icon: Sparkles, title: 'Insight as you work', text: 'Live reports on revenue, lead conversion, and task progress.' },
]

export function AuthLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-hero-gradient text-white lg:flex lg:flex-col">
        <div className="grid-pattern absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -top-24 -left-24 size-96 animate-float rounded-full bg-aurora/25 blur-3xl" aria-hidden />
        <div className="absolute right-[-6rem] bottom-[-6rem] size-[28rem] animate-float-slow rounded-full bg-orchid/30 blur-3xl" aria-hidden />

        <div className="relative flex flex-1 flex-col justify-between gap-10 p-10 xl:p-14">
          <Logo />

          <div className="max-w-lg">
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-aurora backdrop-blur">
              <Sparkles className="size-3.5" /> User workspace
            </span>
            <h2 className="mt-5 animate-fade-up font-display text-4xl leading-[1.1] font-bold tracking-tight [animation-delay:80ms] xl:text-5xl">
              The CRM your day actually runs on,{' '}
              <span className="text-gradient-brand">built for your role.</span>
            </h2>
            <ul className="stagger mt-10 space-y-4">
              {highlights.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition-all duration-300 hover:translate-x-1 hover:border-white/25 hover:bg-white/10"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-aurora transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-0.5 block text-sm text-white/65">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <span>
              <strong className="block font-display text-2xl text-white">3</strong> workspace roles
            </span>
            <span className="h-10 w-px bg-white/15" aria-hidden />
            <span>
              <strong className="block font-display text-2xl text-white">1</strong> shared design system
            </span>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-dvh items-center justify-center px-4 py-10 pb-24 sm:px-8 lg:pb-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden>
          <div className="absolute -top-32 -right-32 size-80 animate-float rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 size-80 animate-float-slow rounded-full bg-aurora/15 blur-3xl" />
        </div>
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <span className="rounded-2xl bg-plum-950 px-4 py-2.5 shadow-[var(--shadow-glow)]">
              <Logo />
            </span>
          </div>
          <Suspense fallback={<AuthSkeleton />}>
            <RouteLoader
              key={pathname}
              delay={350}
              fallback={
                <div className="animate-fade-in">
                  <AuthSkeleton />
                </div>
              }
            >
              <div className="animate-page-in">
                <Outlet />
              </div>
            </RouteLoader>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
