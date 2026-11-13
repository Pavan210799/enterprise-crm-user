import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/RouteGuards'
import { NotFoundPage, RouteErrorPage } from '@/pages/NotFoundPage'
import {
  ActivitiesPage,
  CustomerDetailPage,
  CustomersPage,
  DashboardPage,
  ForgotPasswordPage,
  LeadsPage,
  LoginPage,
  NotificationsPage,
  PipelinePage,
  ReportsPage,
  ResetPasswordPage,
  SettingsPage,
  TasksPage,
  VerifyOtpPage,
} from './lazyPages'

const appRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage />, handle: { title: 'Dashboard' } },
  { path: 'dashboard', element: <Navigate to="/" replace /> },
  { path: 'leads', element: <LeadsPage />, handle: { title: 'Leads' } },
  { path: 'pipeline', element: <PipelinePage />, handle: { title: 'Pipeline' } },
  { path: 'customers', element: <CustomersPage />, handle: { title: 'Customers' } },
  { path: 'customers/:id', element: <CustomerDetailPage />, handle: { title: 'Customer profile' } },
  { path: 'tasks', element: <TasksPage />, handle: { title: 'Tasks' } },
  { path: 'activities', element: <ActivitiesPage />, handle: { title: 'Activities' } },
  { path: 'reports', element: <ReportsPage />, handle: { title: 'Reports & analytics' } },
  { path: 'notifications', element: <NotificationsPage />, handle: { title: 'Notifications' } },
  { path: 'settings', element: <SettingsPage />, handle: { title: 'Profile & settings' } },
]

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage />, handle: { title: 'Sign in' } },
              { path: 'forgot-password', element: <ForgotPasswordPage />, handle: { title: 'Forgot password' } },
              { path: 'verify-otp', element: <VerifyOtpPage />, handle: { title: 'Verify code' } },
              { path: 'reset-password', element: <ResetPasswordPage />, handle: { title: 'Reset password' } },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/', element: <DashboardLayout />, children: appRoutes }],
      },
      { path: '*', element: <NotFoundPage />, handle: { title: 'Page not found' } },
    ],
  },
]

export const router = createBrowserRouter(routes)
