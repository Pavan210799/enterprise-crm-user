import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuthError, readOtpChallenge, requestPasswordReset, verifyOtp } from '@/features/auth/authSlice'
import { AuthCard, FormAlert } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { validateOtp } from '@/lib/validation'

const LENGTH = 6

export default function VerifyOtpPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error } = useAppSelector((s) => s.auth)
  const challenge = readOtpChallenge()
  const state = location.state as { email?: string; code?: string } | null
  const email = challenge?.email ?? state?.email ?? ''
  const demoCode = challenge?.code ?? ''
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: LENGTH }, () => ''))
  const [fieldError, setFieldError] = useState<string>()
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  function setAt(index: number, value: string) {
    setDigits((current) => {
      const next = [...current]
      next[index] = value
      return next
    })
    setFieldError(undefined)
  }

  function onChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) {
      setAt(index, '')
      return
    }
    const chars = cleaned.slice(0, LENGTH - index).split('')
    setDigits((current) => {
      const next = [...current]
      chars.forEach((char, offset) => {
        next[index + offset] = char
      })
      return next
    })
    setFieldError(undefined)
    const focusIndex = Math.min(index + chars.length, LENGTH - 1)
    inputs.current[focusIndex]?.focus()
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
      setAt(index - 1, '')
    }
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (event.key === 'ArrowRight' && index < LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!text) return
    event.preventDefault()
    const next = Array.from({ length: LENGTH }, (_, index) => text[index] ?? '')
    setDigits(next)
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const code = digits.join('')
    const message = validateOtp(code)
    setFieldError(message)
    if (message) return
    const result = await dispatch(verifyOtp({ code }))
    if (verifyOtp.fulfilled.match(result)) {
      navigate('/reset-password', { replace: true })
    }
  }

  async function resend() {
    if (!email) return
    const result = await dispatch(requestPasswordReset({ email }))
    if (requestPasswordReset.fulfilled.match(result)) {
      setDigits(Array.from({ length: LENGTH }, () => ''))
      navigate('/verify-otp', { replace: true, state: { email: result.payload.email, code: result.payload.code } })
      inputs.current[0]?.focus()
    }
  }

  return (
    <AuthCard
      title="Enter your code"
      subtitle={email ? `We sent a 6-digit code to ${email}.` : 'Request a code to continue resetting your password.'}
      footer={
        <Link to="/forgot-password" className="inline-flex items-center gap-1.5 font-semibold text-brand transition hover:gap-2.5 hover:text-orchid">
          <ArrowLeft className="size-4" /> Use a different email
        </Link>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      {!email ? (
        <p className="text-sm text-ink-muted">
          There is no active code for this browser.{' '}
          <Link to="/forgot-password" className="font-semibold text-brand">
            Request one
          </Link>
          .
        </p>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {demoCode ? (
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/70 px-4 py-3 text-sm text-ink">
              <p className="font-medium">Workspace demo</p>
              <p className="mt-1 text-ink-muted">Mail is not connected yet. Use this code to continue:</p>
              <p className="mt-2 font-display text-2xl font-bold tracking-[0.28em] text-brand">{demoCode}</p>
            </div>
          ) : null}
          <div>
            <p id="otp-label" className="text-sm font-medium text-ink">
              Verification code
            </p>
            <div className="mt-2 grid grid-cols-6 gap-2" role="group" aria-labelledby="otp-label">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputs.current[index] = node
                  }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${index + 1}`}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => onChange(index, event.target.value)}
                  onKeyDown={(event) => onKeyDown(index, event)}
                  onPaste={onPaste}
                  className={cn(
                    'h-12 rounded-xl border bg-surface text-center font-display text-lg font-bold text-ink shadow-sm transition focus-visible:border-brand/50 focus-visible:ring-4 focus-visible:ring-brand/12 focus-visible:outline-none sm:h-14',
                    fieldError ? 'border-danger' : 'border-border',
                  )}
                />
              ))}
            </div>
            {fieldError ? (
              <p className="mt-2 text-xs font-medium text-danger" role="alert">
                {fieldError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-subtle">The code expires in 10 minutes.</p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" loading={status === 'loading'} disabled={!email}>
            <span className="relative z-[2]">{status === 'loading' ? 'Checking code…' : 'Verify code'}</span>
          </Button>
          <button
            type="button"
            onClick={resend}
            disabled={status === 'loading'}
            className="w-full text-sm font-semibold text-ink-muted transition hover:text-brand disabled:opacity-50"
          >
            Resend code
          </button>
        </form>
      )}
    </AuthCard>
  )
}
