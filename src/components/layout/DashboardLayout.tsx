import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useAppSelector } from '@/app/hooks'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { RouteLoader } from './RouteLoader'
import { SidebarNav } from './SidebarNav'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { CommandPalette } from './CommandPalette'
import { useRouteTitle } from '@/hooks/useRouteTitle'

export function DashboardLayout() {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed)
  const title = useRouteTitle() ?? 'Dashboard'
  const { pathname } = useLocation()
  const skeleton = <PageSkeleton />

  return (
    <div className="mesh-bg min-h-dvh">
      <MobileNav />
      <CommandPalette />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden bg-sidebar-gradient shadow-sidebar transition-[width] duration-300 ease-[var(--ease-out-expo)] lg:block',
          collapsed ? 'w-[5.25rem]' : 'w-64',
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>

      <div
        className={cn(
          'flex min-h-dvh min-w-0 flex-col transition-[padding] duration-300 ease-[var(--ease-out-expo)]',
          collapsed ? 'lg:pl-[5.25rem]' : 'lg:pl-64',
        )}
      >
        <Topbar title={title} />
        <main data-app-shell className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 px-4 pt-5 pb-[calc(6rem+var(--host-badge-space))] sm:px-6 sm:pt-6 lg:px-8">
          <Suspense fallback={skeleton}>
            <RouteLoader key={pathname} fallback={<div className="animate-fade-in">{skeleton}</div>}>
              <div className="animate-page-in">
                <Outlet />
              </div>
            </RouteLoader>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
