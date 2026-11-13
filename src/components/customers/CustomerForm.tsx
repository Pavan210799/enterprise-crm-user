import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { compactErrors, required, validateEmail, validatePhone } from '@/lib/validation'
import type { CustomerInput } from '@/features/workspace/workspaceSlice'
import type { Customer } from '@/types'

const emptyCustomer = (): CustomerInput => ({
  name: '',
  company: '',
  email: '',
  phone: '',
  jobTitle: '',
  location: '',
  status: 'active',
  notes: '',
})

export function CustomerForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save customer',
}: {
  initial?: Customer
  onSubmit: (values: CustomerInput) => void | Promise<void>
  onCancel: () => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<CustomerInput>(() => {
    if (!initial) return emptyCustomer()
    const { name, company, email, phone, jobTitle, location, status, notes } = initial
    return { name, company, email, phone, jobTitle, location, status, notes }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = compactErrors({
      name: required(values.name, 'Full name'),
      company: required(values.company, 'Company'),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        jobTitle: values.jobTitle.trim(),
        location: values.location.trim(),
        notes: values.notes.trim(),
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the customer.')
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <FormAlert message={formError} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" name="name" value={values.name} onChange={(event) => set('name', event.target.value)} error={errors.name} autoComplete="name" />
        <Input label="Company" name="company" value={values.company} onChange={(event) => set('company', event.target.value)} error={errors.company} autoComplete="organization" />
        <Input label="Email" name="email" type="email" value={values.email} onChange={(event) => set('email', event.target.value)} error={errors.email} autoComplete="email" />
        <Input label="Phone" name="phone" type="tel" value={values.phone} onChange={(event) => set('phone', event.target.value)} error={errors.phone} autoComplete="tel" />
        <Input label="Job title" name="jobTitle" value={values.jobTitle} onChange={(event) => set('jobTitle', event.target.value)} autoComplete="organization-title" />
        <Input label="Location" name="location" value={values.location} onChange={(event) => set('location', event.target.value)} />
        <Select
          label="Status"
          name="status"
          value={values.status}
          onChange={(event) => set('status', event.target.value as CustomerInput['status'])}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>
      <Textarea label="Notes" name="notes" value={values.notes} onChange={(event) => set('notes', event.target.value)} placeholder="How you work with this customer…" />
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 pt-2 sm:flex sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
