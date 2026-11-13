import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuthError, DEMO_ACCOUNTS, login } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { AuthCard, FormAlert, PasswordInput } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ROLE_LABEL } from '@/lib/constants'
import { compactErrors, validateEmail } from '@/lib/validation'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const next = compactErrors({
      email: validateEmail(email),
      password: password ? undefined : 'Password is required',
    })
    setErrors(next)
    if (Object.keys(next).length) return
    const result = await dispatch(login({ email, password, remember }))
    if (login.fulfilled.match(result)) {
      dispatch(pushToast({ tone: 'success', title: `Welcome back, ${result.payload.name.split(' ')[0]}!` }))
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your NexRel workspace to continue."
      footer={<span>Accounts are created by your NexRel admin.</span>}
    >
      {error ? <FormAlert message={error} /> : null}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@nexrel.io"
          leftIcon={<Mail />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          error={errors.email}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          leftIcon={<Lock />}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: undefined }))
          }}
          error={errors.password}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox checked={remember} onChange={setRemember} label="Remember me" showLabel size="sm" />
          <Link to="/forgot-password" className="text-sm font-semibold text-brand transition hover:text-orchid">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="group w-full" loading={status === 'loading'}>
          <span className="relative z-[2]">{status === 'loading' ? 'Signing in…' : 'Sign in'}</span>
          {status !== 'loading' ? (
            <ArrowRight className="relative z-[2] size-4 transition-transform duration-300 group-hover:translate-x-1" />
          ) : null}
        </Button>
      </form>

      <div className="mt-6 border-t border-border/80 pt-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-subtle uppercase">Demo account</p>
        <ul className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(account.email)
                  setPassword(account.password)
                  setErrors({})
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-left transition hover:border-brand/40 hover:bg-brand-soft/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{account.name}</span>
                  <span className="block truncate text-xs text-ink-subtle">{ROLE_LABEL[account.role]}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">{account.password}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthCard>
  )
}
