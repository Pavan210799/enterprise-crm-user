import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuthError, requestPasswordReset } from '@/features/auth/authSlice'
import { AuthCard, FormAlert } from '@/components/auth/AuthCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { validateEmail } from '@/lib/validation'

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { status, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string>()

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const message = validateEmail(email)
    setFieldError(message)
    if (message) return
    const result = await dispatch(requestPasswordReset({ email }))
    if (requestPasswordReset.fulfilled.match(result)) {
      navigate('/verify-otp', { state: { email: result.payload.email, code: result.payload.code } })
    }
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter your work email and we will send a one-time code."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand transition hover:gap-2.5 hover:text-orchid">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
            setFieldError(undefined)
          }}
          error={fieldError}
        />
        <Button type="submit" size="lg" className="w-full" loading={status === 'loading'}>
          <span className="relative z-[2]">{status === 'loading' ? 'Sending code…' : 'Send verification code'}</span>
        </Button>
      </form>
    </AuthCard>
  )
}
