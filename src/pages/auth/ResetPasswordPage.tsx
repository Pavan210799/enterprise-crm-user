import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearAuthError, readResetGrant, resetPassword } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { AuthCard, FormAlert, PasswordInput, PasswordStrength } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { compactErrors, validateConfirmPassword, validateNewPassword } from '@/lib/validation'

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const grant = readResetGrant()
  const { status, error } = useAppSelector((s) => s.auth)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  if (!grant) {
    return <Navigate to="/forgot-password" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!grant) return
    const next = compactErrors({
      password: validateNewPassword(password),
      confirm: validateConfirmPassword(confirm, password),
    })
    setErrors(next)
    if (Object.keys(next).length) return
    const result = await dispatch(resetPassword({ token: grant.token, password }))
    if (resetPassword.fulfilled.match(result)) {
      dispatch(pushToast({ tone: 'success', title: 'Password updated', message: 'Sign in with your new password.' }))
      navigate('/login', { replace: true })
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle={`Updating the password for ${grant.email}.`}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-brand transition hover:gap-2.5 hover:text-orchid">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      }
    >
      {error ? <FormAlert message={error} /> : null}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            leftIcon={<Lock />}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setErrors((prev) => ({ ...prev, password: undefined, confirm: undefined }))
            }}
            error={errors.password}
            hint="At least 8 characters with a mix of letters, numbers & symbols."
          />
          <PasswordStrength value={password} />
        </div>
        <PasswordInput
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          leftIcon={<Lock />}
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value)
            setErrors((prev) => ({ ...prev, confirm: undefined }))
          }}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" loading={status === 'loading'}>
          <span className="relative z-[2]">{status === 'loading' ? 'Updating password…' : 'Update password'}</span>
        </Button>
      </form>
    </AuthCard>
  )
}
