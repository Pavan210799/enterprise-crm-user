import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { compactErrors, required } from '@/lib/validation'

export function FollowUpForm({
  initialDate,
  onSubmit,
  onCancel,
}: {
  initialDate: string
  onSubmit: (values: { nextFollowUp: string; note: string }) => void | Promise<void>
  onCancel: () => void
}) {
  const [nextFollowUp, setNextFollowUp] = useState(initialDate)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ nextFollowUp?: string; note?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const next = compactErrors({
      nextFollowUp: required(nextFollowUp, 'Follow-up date'),
      note: required(note, 'Note'),
    })
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    await onSubmit({ nextFollowUp, note: note.trim() })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Input label="Next follow-up" name="nextFollowUp" type="date" value={nextFollowUp} onChange={(event) => setNextFollowUp(event.target.value)} error={errors.nextFollowUp} />
      <Textarea label="What happened" name="note" value={note} onChange={(event) => setNote(event.target.value)} error={errors.note} placeholder="Call summary, email sent, or the next ask…" />
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 pt-2 sm:flex sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save follow-up
        </Button>
      </div>
    </form>
  )
}
