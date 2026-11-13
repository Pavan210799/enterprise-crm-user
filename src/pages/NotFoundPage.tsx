import type { ReactNode } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ArrowLeft, Compass, RefreshCw } from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { buttonStyles } from '@/components/ui/buttonStyles'

function Shell({ code, title, message, children }: { code: string; title: string; message: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-hero-gradient px-4 py-16 text-white">
      <div className="grid-pattern absolute inset-0 opacity-60" aria-hidden />
      <div className="absolute -top-24 -left-24 size-96 animate-float rounded-full bg-aurora/25 blur-3xl" aria-hidden />
      <div className="absolute -right-24 -bottom-24 size-96 animate-float-slow rounded-full bg-orchid/30 blur-3xl" aria-hidden />
      <div className="relative max-w-lg animate-fade-up text-center">
        <LogoMark className="mx-auto size-14" />
        <p className="mt-8 font-display text-7xl font-extrabold tracking-tight sm:text-8xl">
          <span className="text-gradient-brand">{code}</span>
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-3 text-white/70">{message}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <Shell code="404" title="This page drifted out of orbit" message="The page you are looking for does not exist or has been moved.">
      <Link to="/" className={buttonStyles({ size: 'lg' })}>
        <Compass className="relative z-[2] size-4" /> <span className="relative z-[2]">Go to dashboard</span>
      </Link>
      <button
        type="button"
        onClick={() => window.history.back()}
        className={buttonStyles({ variant: 'outline', size: 'lg', className: 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white' })}
      >
        <ArrowLeft className="size-4" /> Go back
      </button>
    </Shell>
  )
}

export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  if (notFound) return <NotFoundPage />

  return (
    <Shell code="Oops" title="Something went wrong" message="An unexpected error occurred. Reload the page to try again.">
      <button type="button" onClick={() => window.location.reload()} className={buttonStyles({ size: 'lg' })}>
        <RefreshCw className="relative z-[2] size-4" /> <span className="relative z-[2]">Reload page</span>
      </button>
      <Link
        to="/"
        className={buttonStyles({ variant: 'outline', size: 'lg', className: 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white' })}
      >
        Back to dashboard
      </Link>
    </Shell>
  )
}
