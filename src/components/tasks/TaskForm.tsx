import { useId, useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FormAlert } from '@/components/ui/FormAlert'
import { dateInputFromOffset } from '@/data/workspace'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/taskMeta'
import { compactErrors, required } from '@/lib/validation'
import { cn } from '@/lib/cn'
import type { TaskInput } from '@/features/workspace/workspaceSlice'
import type { Task } from '@/types'

export function TaskForm({
  initial,
  relatedOptions,
  onSubmit,
  onCancel,
}: {
  initial?: Task
  relatedOptions: string[]
  onSubmit: (values: TaskInput) => void | Promise<void>
  onCancel: () => void
}) {
  const listId = useId()
  const [values, setValues] = useState<TaskInput>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description,
          priority: initial.priority,
          status: initial.status,
          dueDate: initial.dueDate,
          relatedTo: initial.relatedTo,
        }
      : { title: '', description: '', priority: 'medium', status: 'todo', dueDate: dateInputFromOffset(2), relatedTo: '' },
  )
  const [errors, setErrors] = useState<Partial<Record<keyof TaskInput, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = compactErrors({
      title: required(values.title, 'Task title'),
      dueDate: !values.dueDate ? 'Deadline is required' : !initial && values.dueDate < dateInputFromOffset(0) ? 'Deadline cannot be in the past' : undefined,
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ ...values, title: values.title.trim(), description: values.description.trim(), relatedTo: values.relatedTo.trim() })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save the task.')
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {formError ? <FormAlert message={formError} /> : null}
      <Input label="Task title" name="title" value={values.title} onChange={(event) => set('title', event.target.value)} error={errors.title} placeholder="Send renewal proposal" />
      <Textarea label="Description" name="description" value={values.description} onChange={(event) => set('description', event.target.value)} placeholder="Details, links, or the expected outcome…" />
      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-ink">Priority</legend>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-4">
          {TASK_PRIORITIES.map((priority) => {
            const active = values.priority === priority.value
            return (
              <button
                key={priority.value}
                type="button"
                aria-pressed={active}
                onClick={() => set('priority', priority.value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  active ? 'border-brand/50 bg-brand-soft text-brand shadow-[var(--shadow-soft)]' : 'border-border text-ink-muted hover:border-brand/30',
                )}
              >
                <span className={cn('size-2.5 rounded-full transition-transform', priority.accent, active && 'scale-125')} />
                {priority.label}
              </button>
            )
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Status" name="status" value={values.status} onChange={(event) => set('status', event.target.value as TaskInput['status'])} options={TASK_STATUSES} />
        <Input
          label="Deadline"
          name="dueDate"
          type="date"
          min={initial ? undefined : dateInputFromOffset(0)}
          value={values.dueDate}
          onChange={(event) => set('dueDate', event.target.value)}
          error={errors.dueDate}
        />
        <div className="sm:col-span-2">
          <Input label="Related to" name="relatedTo" list={listId} value={values.relatedTo} onChange={(event) => set('relatedTo', event.target.value)} placeholder="Company, lead, or deal" />
          <datalist id={listId}>
            {relatedOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 pt-1 sm:flex sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initial ? 'Save task' : 'Create task'}
        </Button>
      </div>
    </form>
  )
}
