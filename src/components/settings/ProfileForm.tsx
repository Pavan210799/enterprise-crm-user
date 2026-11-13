import { useState, type FormEvent } from 'react'
import { Briefcase, Globe2, Mail, MapPin, Phone, User } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { updateProfile } from '@/features/auth/authSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { BIO_LIMIT, validateProfile } from '@/lib/validation'
import { cn } from '@/lib/cn'
import type { AuthUser, ProfileInput } from '@/types'

const TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

function toValues(user: AuthUser): ProfileInput {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    jobTitle: user.jobTitle ?? '',
    location: user.location ?? '',
    bio: user.bio ?? '',
    timezone: user.timezone ?? TIMEZONES[0]!.value,
  }
}

function sameValues(a: ProfileInput, b: ProfileInput) {
  return (Object.keys(a) as (keyof ProfileInput)[]).every((key) => a[key] === b[key])
}

export function ProfileForm({ user }: { user: AuthUser }) {
  const dispatch = useAppDispatch()
  const saved = toValues(user)
  const [values, setValues] = useState<ProfileInput>(saved)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const dirty = !sameValues(values, saved)

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validateProfile(values)
    setErrors(next)
    if (Object.keys(next).length) return
    setSaving(true)
    setFormError(null)
    try {
      const trimmed: ProfileInput = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        jobTitle: values.jobTitle.trim(),
        location: values.location.trim(),
        bio: values.bio.trim(),
        timezone: values.timezone,
      }
      const updated = await dispatch(updateProfile(trimmed)).unwrap()
      setValues(toValues(updated))
      dispatch(pushToast({ tone: 'success', title: 'Profile updated', message: 'Your personal information was saved.' }))
    } catch (error) {
      setFormError(typeof error === 'string' ? error : 'Could not save your profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader title="Personal information" description="This is how teammates and customers see you across NexRel." />
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {formError ? <FormAlert message={formError} /> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" leftIcon={<User />} value={values.name} onChange={(event) => set('name', event.target.value)} error={errors.name} autoComplete="name" />
          <Input
            label="Work email"
            name="email"
            type="email"
            leftIcon={<Mail />}
            value={values.email}
            onChange={(event) => set('email', event.target.value)}
            error={errors.email}
            hint="You sign in with this email."
            autoComplete="email"
          />
          <Input label="Phone" name="phone" type="tel" leftIcon={<Phone />} value={values.phone} onChange={(event) => set('phone', event.target.value)} error={errors.phone} autoComplete="tel" placeholder="Optional" />
          <Input label="Job title" name="jobTitle" leftIcon={<Briefcase />} value={values.jobTitle} onChange={(event) => set('jobTitle', event.target.value)} autoComplete="organization-title" />
          <Input label="Location" name="location" leftIcon={<MapPin />} value={values.location} onChange={(event) => set('location', event.target.value)} autoComplete="address-level2" />
          <div className="relative">
            <Select label="Time zone" name="timezone" value={values.timezone} onChange={(event) => set('timezone', event.target.value)} options={TIMEZONES} className="pl-10" />
            <Globe2 className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-ink-subtle" aria-hidden />
          </div>
        </div>
        <div className="space-y-1.5">
          <Textarea label="Bio" name="bio" value={values.bio} onChange={(event) => set('bio', event.target.value)} error={errors.bio} rows={3} placeholder="A line or two about your focus" />
          <p className={cn('text-right text-xs tabular-nums', values.bio.length > BIO_LIMIT ? 'font-semibold text-danger' : 'text-ink-subtle')}>
            {values.bio.length}/{BIO_LIMIT}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:flex">
            <Button
              variant="outline"
              disabled={!dirty || saving}
              onClick={() => {
                setValues(saved)
                setErrors({})
                setFormError(null)
              }}
            >
              Discard
            </Button>
            <Button type="submit" loading={saving} disabled={!dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
