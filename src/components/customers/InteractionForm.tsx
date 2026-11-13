import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ACTIVITY_TYPES } from '@/lib/activityType'
import { compactErrors, required } from '@/lib/validation'
import type { ActivityType } from '@/types'

export function InteractionForm({
  onSubmit,
}: {
  onSubmit: (values: { type: ActivityType; title: string; description: string }) => void | Promise<void>
}) {
  const [type, setType] = useState<ActivityType>('call')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = compactErrors({
      title: required(title, 'Title'),
      description: required(description, 'Details'),
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      await onSubmit({ type, title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
      setType('call')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr]">
        <Select label="Type" name="type" value={type} onChange={(event) => setType(event.target.value as ActivityType)} options={ACTIVITY_TYPES} />
        <Input label="Title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} error={errors.title} placeholder="Discovery call" />
      </div>
      <Textarea label="Details" name="description" value={description} onChange={(event) => setDescription(event.target.value)} error={errors.description} placeholder="What was said, decided, or promised…" />
      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>
          Log interaction
        </Button>
      </div>
    </form>
  )
}
