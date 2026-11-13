import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { dateInputFromOffset } from '@/data/workspace'
import { DEAL_STAGES, dealStageMeta } from '@/lib/dealStage'
import { compactErrors, required } from '@/lib/validation'
import type { DealInput } from '@/features/workspace/workspaceSlice'
import type { Customer, Deal, DealStage } from '@/types'

export function DealForm({
  initial,
  defaultStage = 'prospecting',
  customers,
  onSubmit,
  onCancel,
}: {
  initial?: Deal
  defaultStage?: DealStage
  customers: Customer[]
  onSubmit: (values: DealInput) => void | Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<DealInput>(() =>
    initial
      ? {
          title: initial.title,
          company: initial.company,
          customerId: initial.customerId,
          value: initial.value,
          stage: initial.stage,
          probability: initial.probability,
          expectedClose: initial.expectedClose,
        }
      : {
          title: '',
          company: '',
          customerId: undefined,
          value: 0,
          stage: defaultStage,
          probability: dealStageMeta(defaultStage).probability,
          expectedClose: dateInputFromOffset(30),
        },
  )
  const [errors, setErrors] = useState<Partial<Record<keyof DealInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof DealInput>(key: K, value: DealInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function chooseCustomer(id: string) {
    const customer = customers.find((item) => item.id === id)
    setValues((current) => ({ ...current, customerId: customer?.id, company: customer ? customer.company : current.company }))
    setErrors((current) => ({ ...current, company: undefined }))
  }

  function chooseStage(stage: DealStage) {
    setValues((current) => ({ ...current, stage, probability: dealStageMeta(stage).probability }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = compactErrors({
      title: required(values.title, 'Deal name'),
      company: required(values.company, 'Company'),
      value: values.value <= 0 ? 'Enter a deal value above zero' : undefined,
      probability: values.probability < 0 || values.probability > 100 ? 'Use a value between 0 and 100' : undefined,
      expectedClose: /^\d{4}-\d{2}-\d{2}$/.test(values.expectedClose) ? undefined : 'Expected close date is required',
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ ...values, title: values.title.trim(), company: values.company.trim() })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the deal.')
      setSubmitting(false)
    }
  }

  const customerOptions = [{ value: '', label: 'No linked customer' }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} · ${customer.company}` }))]

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <FormAlert message={formError} /> : null}
      <Input label="Deal name" name="title" value={values.title} onChange={(event) => set('title', event.target.value)} error={errors.title} placeholder="Annual platform renewal" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Customer" name="customerId" value={values.customerId ?? ''} onChange={(event) => chooseCustomer(event.target.value)} options={customerOptions} />
        <Input label="Company" name="company" value={values.company} onChange={(event) => set('company', event.target.value)} error={errors.company} autoComplete="organization" />
        <Input
          label="Deal value (USD)"
          name="value"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          value={values.value || ''}
          onChange={(event) => set('value', Number(event.target.value) || 0)}
          error={errors.value}
        />
        <Select label="Stage" name="stage" value={values.stage} onChange={(event) => chooseStage(event.target.value as DealStage)} options={DEAL_STAGES} />
        <Input
          label="Win probability (%)"
          name="probability"
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={5}
          value={values.probability}
          onChange={(event) => set('probability', Number(event.target.value))}
          error={errors.probability}
          hint="Set automatically from the stage. Adjust if needed."
        />
        <Input label="Expected close" name="expectedClose" type="date" value={values.expectedClose} onChange={(event) => set('expectedClose', event.target.value)} error={errors.expectedClose} />
      </div>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 pt-1 sm:flex sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? 'Save deal' : 'Create deal'}
        </Button>
      </div>
    </form>
  )
}
