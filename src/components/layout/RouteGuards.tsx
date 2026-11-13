import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export function ProtectedRoute() {
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  return <Outlet />
}

export function PublicOnlyRoute() {
  const user = useAppSelector((s) => s.auth.user)
  const location = useLocation()
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from && from !== '/login' ? from : '/'} replace />
  }
  return <Outlet />
}
