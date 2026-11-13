import { useId, useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { ACTIVITY_TYPES } from '@/lib/activityType'
import { compactErrors, required } from '@/lib/validation'
import { cn } from '@/lib/cn'
import type { ActivityInput } from '@/features/workspace/workspaceSlice'
import type { Activity, ActivityType, Customer } from '@/types'

function toLocalInput(iso: string) {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ActivityForm({
  initial,
  defaultType = 'call',
  customers,
  relatedOptions,
  onSubmit,
  onCancel,
}: {
  initial?: Activity
  defaultType?: ActivityType
  customers: Customer[]
  relatedOptions: string[]
  onSubmit: (values: ActivityInput) => void | Promise<void>
  onCancel: () => void
}) {
  const listId = useId()
  const [values, setValues] = useState<ActivityInput>(() =>
    initial
      ? {
          type: initial.type,
          title: initial.title,
          description: initial.description,
          customerId: initial.customerId,
          relatedTo: initial.relatedTo,
          occurredAt: toLocalInput(initial.occurredAt),
        }
      : { type: defaultType, title: '', description: '', customerId: undefined, relatedTo: '', occurredAt: toLocalInput(new Date().toISOString()) },
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ActivityInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof ActivityInput>(key: K, value: ActivityInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function chooseCustomer(id: string) {
    const customer = customers.find((item) => item.id === id)
    setValues((current) => ({ ...current, customerId: customer?.id, relatedTo: customer ? customer.company : current.relatedTo }))
    setErrors((current) => ({ ...current, relatedTo: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const when = new Date(values.occurredAt)
    const next = compactErrors({
      title: required(values.title, 'Title'),
      relatedTo: required(values.relatedTo, 'Related to'),
      occurredAt: !values.occurredAt || Number.isNaN(when.getTime()) ? 'Pick a date and time' : undefined,
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        relatedTo: values.relatedTo.trim(),
        occurredAt: when.toISOString(),
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the activity.')
      setSubmitting(false)
    }
  }

  const customerOptions = [{ value: '', label: 'No linked customer' }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} · ${customer.company}` }))]

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <FormAlert message={formError} /> : null}
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink">Type</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {ACTIVITY_TYPES.map((type) => {
            const active = values.type === type.value
            const Icon = type.icon
            return (
              <button
                key={type.value}
                type="button"
                aria-pressed={active}
                onClick={() => set('type', type.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  active ? 'border-brand/50 bg-brand-soft text-brand shadow-[var(--shadow-soft)]' : 'border-border text-ink-muted hover:border-brand/30',
                )}
              >
                <span className={cn('grid size-8 place-items-center rounded-lg', type.tint)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                {type.label}
              </button>
            )
          })}
        </div>
      </fieldset>
      <Input label="Title" name="title" value={values.title} onChange={(event) => set('title', event.target.value)} error={errors.title} placeholder="Discovery call" />
      <Textarea label="Details" name="description" value={values.description} onChange={(event) => set('description', event.target.value)} placeholder="What was said, decided, or promised…" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Customer" name="customerId" value={values.customerId ?? ''} onChange={(event) => chooseCustomer(event.target.value)} options={customerOptions} />
        <div>
          <Input label="Related to" name="relatedTo" list={listId} value={values.relatedTo} onChange={(event) => set('relatedTo', event.target.value)} error={errors.relatedTo} placeholder="Company or lead" />
          <datalist id={listId}>
            {relatedOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
        <Input
          label="Date and time"
          name="occurredAt"
          type="datetime-local"
          value={values.occurredAt}
          onChange={(event) => set('occurredAt', event.target.value)}
          error={errors.occurredAt}
          hint="Pick a future time to schedule it."
          containerClassName="sm:col-span-2"
        />
      </div>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 pt-1 sm:flex sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? 'Save activity' : 'Log activity'}
        </Button>
      </div>
    </form>
  )
}
