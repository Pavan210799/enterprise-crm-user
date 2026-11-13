import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useRouteScrollRestoration } from '@/hooks/useRouteScrollRestoration'
import { useRouteTitle } from '@/hooks/useRouteTitle'
import { useAppSelector } from '@/app/hooks'
import { APP_NAME } from '@/lib/constants'
import { Toaster } from '@/components/ui/Toaster'
import { BackToTop } from './BackToTop'

export function RootLayout() {
  useRouteScrollRestoration()
  const title = useRouteTitle()
  const reduceMotion = useAppSelector((s) => s.settings.reduceMotion)

  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME} CRM` : `${APP_NAME} | User Workspace`
  }, [title])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  return (
    <>
      <Outlet />
      <BackToTop />
      <Toaster />
    </>
  )
}
