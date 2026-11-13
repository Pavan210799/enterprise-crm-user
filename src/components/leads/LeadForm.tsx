import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { LEAD_SOURCES, LEAD_STATUSES } from '@/lib/leadStatus'
import { compactErrors, required, validateEmail, validatePhone } from '@/lib/validation'
import type { LeadInput } from '@/features/workspace/workspaceSlice'
import type { Lead } from '@/types'

const emptyLead = (): LeadInput => ({
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'new',
  source: 'Website',
  estimatedValue: 0,
  notes: '',
  nextFollowUp: '',
})

export function LeadForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save lead',
}: {
  initial?: Lead
  onSubmit: (values: LeadInput) => void | Promise<void>
  onCancel: () => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<LeadInput>(() => {
    if (!initial) return emptyLead()
    const { name, company, email, phone, status, source, estimatedValue, notes, nextFollowUp } = initial
    return { name, company, email, phone, status, source, estimatedValue, notes, nextFollowUp }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LeadInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) => {
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
      estimatedValue: values.estimatedValue < 0 ? 'Value cannot be negative' : undefined,
      nextFollowUp: values.nextFollowUp && !/^\d{4}-\d{2}-\d{2}$/.test(values.nextFollowUp) ? 'Enter a valid date' : undefined,
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
        notes: values.notes.trim(),
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the lead.')
      setSubmitting(false)
    }
  }

  const sources = [...new Set([...LEAD_SOURCES, values.source])].map((source) => ({ value: source, label: source }))

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <FormAlert message={formError} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" name="name" value={values.name} onChange={(event) => set('name', event.target.value)} error={errors.name} autoComplete="name" />
        <Input label="Company" name="company" value={values.company} onChange={(event) => set('company', event.target.value)} error={errors.company} autoComplete="organization" />
        <Input label="Email" name="email" type="email" value={values.email} onChange={(event) => set('email', event.target.value)} error={errors.email} autoComplete="email" />
        <Input label="Phone" name="phone" type="tel" value={values.phone} onChange={(event) => set('phone', event.target.value)} error={errors.phone} autoComplete="tel" />
        <Select label="Status" name="status" value={values.status} onChange={(event) => set('status', event.target.value as LeadInput['status'])} options={LEAD_STATUSES} />
        <Select label="Source" name="source" value={values.source} onChange={(event) => set('source', event.target.value)} options={sources} />
        <Input
          label="Estimated value (USD)"
          name="estimatedValue"
          type="number"
          inputMode="numeric"
          min={0}
          step={500}
          value={values.estimatedValue || ''}
          onChange={(event) => set('estimatedValue', Number(event.target.value) || 0)}
          error={errors.estimatedValue}
        />
        <Input label="Next follow-up" name="nextFollowUp" type="date" value={values.nextFollowUp} onChange={(event) => set('nextFollowUp', event.target.value)} error={errors.nextFollowUp} />
      </div>
      <Textarea label="Notes" name="notes" value={values.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Context, next steps, or objections…" />
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
