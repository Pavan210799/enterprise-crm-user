import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, Laptop, Lock, LogOut, ShieldCheck } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { changePassword, logout } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { PasswordInput, PasswordStrength } from '@/components/auth/AuthCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { Badge } from '@/components/ui/Badge'
import { validatePasswordChange } from '@/lib/validation'
import { timeAgo } from '@/lib/format'
import type { AuthUser } from '@/types'

type Fields = { currentPassword: string; newPassword: string; confirmPassword: string }

const EMPTY: Fields = { currentPassword: '', newPassword: '', confirmPassword: '' }

const TIPS = ['At least 8 characters', 'Upper and lower case letters', 'A number or a symbol', 'Not the same as your current password']

function describeBrowser() {
  if (typeof navigator === 'undefined') return 'This browser'
  const ua = navigator.userAgent
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'your device'
  return `${browser} on ${os}`
}

export function SecurityPanel({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [values, setValues] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof Fields, value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, ...(key === 'newPassword' ? { confirmPassword: undefined } : {}) }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validatePasswordChange(values)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    try {
      await dispatch(changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })).unwrap()
      setValues(EMPTY)
      dispatch(pushToast({ tone: 'success', title: 'Password changed', message: 'Use your new password next time you sign in.' }))
    } catch (error) {
      setFormError(typeof error === 'string' ? error : 'Could not change your password. Try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleSignOut() {
    dispatch(logout())
    dispatch(pushToast({ tone: 'info', title: 'Signed out', message: 'You have been signed out of this browser.' }))
    navigate('/login', { replace: true })
  }

  return (
    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader
          title="Change password"
          description={user.passwordChangedAt ? `Last changed ${timeAgo(user.passwordChangedAt)}.` : 'You have not changed your password since joining.'}
        />
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {formError ? <FormAlert message={formError} /> : null}
          <PasswordInput
            label="Current password"
            name="currentPassword"
            autoComplete="current-password"
            leftIcon={<Lock />}
            value={values.currentPassword}
            onChange={(event) => set('currentPassword', event.target.value)}
            error={errors.currentPassword}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <PasswordInput
                label="New password"
                name="newPassword"
                autoComplete="new-password"
                leftIcon={<KeyRound />}
                value={values.newPassword}
                onChange={(event) => set('newPassword', event.target.value)}
                error={errors.newPassword}
              />
              <PasswordStrength value={values.newPassword} />
            </div>
            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              autoComplete="new-password"
              leftIcon={<KeyRound />}
              value={values.confirmPassword}
              onChange={(event) => set('confirmPassword', event.target.value)}
              error={errors.confirmPassword}
            />
          </div>
          <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end">
            <Button type="submit" loading={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-1 2xl:content-start">
        <Card>
          <CardHeader title="Password checklist" />
          <ul className="space-y-2">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-ink-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Active session" />
          <div className="flex min-w-0 items-center gap-3 rounded-xl bg-canvas/80 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Laptop className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{describeBrowser()}</p>
              <p className="truncate text-xs text-ink-subtle">{user.email}</p>
            </div>
            <Badge variant="success" dot>
              Current
            </Badge>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            Sign-in codes for password resets are sent to your work email and expire after 10 minutes.
          </p>
          <Button variant="outline" className="mt-4 w-full" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </Button>
        </Card>
      </div>
    </div>
  )
}
