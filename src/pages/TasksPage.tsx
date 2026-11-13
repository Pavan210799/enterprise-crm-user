import { useMemo, useState } from 'react'
import { AlarmClock, Building2, CheckCircle2, ClipboardList, ListTodo, Loader, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { IconAction } from '@/components/common/IconAction'
import { SearchField } from '@/components/common/SearchField'
import { StatTile } from '@/components/common/StatTile'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { selectTaskSummary, selectTasks } from '@/features/workspace/workspaceSelectors'
import { addTask, deleteTask, setTaskStatus, toggleTaskComplete, updateTask, type TaskInput } from '@/features/workspace/workspaceSlice'
import { pushToast } from '@/features/toasts/toastsSlice'
import { useCreateParam } from '@/hooks/useCreateParam'
import { usePagination } from '@/hooks/usePagination'
import { daysUntil, formatDueLabel } from '@/lib/format'
import { can } from '@/lib/permissions'
import { TASK_PRIORITIES, TASK_STATUSES, priorityMeta } from '@/lib/taskMeta'
import { cn } from '@/lib/cn'
import type { Task, TaskPriority, TaskStatus } from '@/types'

const PAGE_SIZE = 8
type TaskView = 'all' | 'overdue' | TaskStatus

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
const isOverdue = (task: Task) => task.status !== 'completed' && daysUntil(task.dueDate) < 0

export default function TasksPage() {
  const dispatch = useAppDispatch()
  const role = useAppSelector((state) => state.auth.user?.role)
  const tasks = useAppSelector(selectTasks)
  const summary = useAppSelector(selectTaskSummary)
  const customers = useAppSelector((state) => state.workspace.customers)
  const leads = useAppSelector((state) => state.workspace.leads)
  const canManage = can(role, 'tasks.manage')

  const [search, setSearch] = useState('')
  const [view, setView] = useState<TaskView>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  useCreateParam(canManage, () => openForm(null))

  const relatedOptions = useMemo(() => [...new Set([...customers.map((customer) => customer.company), ...leads.map((lead) => lead.company)])].sort(), [customers, leads])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return tasks
      .filter((task) => {
        const matchesView = view === 'all' ? true : view === 'overdue' ? isOverdue(task) : task.status === view
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
        const haystack = `${task.title} ${task.description} ${task.relatedTo}`.toLowerCase()
        return matchesView && matchesPriority && (!query || haystack.includes(query))
      })
      .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.dueDate.localeCompare(b.dueDate))
  }, [tasks, search, view, priorityFilter])

  const pager = usePagination(filtered, PAGE_SIZE, `${search}|${view}|${priorityFilter}`)
  const completion = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0

  const tabs: { value: TaskView; label: string; count: number }[] = [
    { value: 'all', label: 'All tasks', count: summary.total },
    { value: 'todo', label: 'To do', count: summary.open - summary.inProgress },
    { value: 'in_progress', label: 'In progress', count: summary.inProgress },
    { value: 'completed', label: 'Completed', count: summary.completed },
    { value: 'overdue', label: 'Overdue', count: summary.overdue },
  ]

  function openForm(task: Task | null) {
    setEditing(task)
    setFormOpen(true)
  }

  async function handleSave(values: TaskInput) {
    await wait(350)
    if (editing) {
      dispatch(updateTask({ id: editing.id, values }))
      dispatch(pushToast({ tone: 'success', title: 'Task updated', message: values.title }))
    } else {
      dispatch(addTask(values))
      dispatch(pushToast({ tone: 'success', title: 'Task created', message: `${values.title} · ${formatDueLabel(values.dueDate)}` }))
    }
    setFormOpen(false)
  }

  function handleToggle(task: Task) {
    dispatch(toggleTaskComplete(task.id))
    if (task.status !== 'completed') dispatch(pushToast({ tone: 'success', title: 'Task completed', message: task.title }))
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await wait(300)
    dispatch(deleteTask(deleteTarget.id))
    dispatch(pushToast({ tone: 'success', title: 'Task deleted', message: deleteTarget.title }))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <div className="stagger grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatTile icon={ListTodo} label="Open tasks" value={summary.open} hint={`${summary.dueToday} due today`} tone="brand" />
        <StatTile icon={Loader} label="In progress" value={summary.inProgress} tone="aurora" />
        <StatTile icon={AlarmClock} label="Overdue" value={summary.overdue} hint={summary.overdue ? 'Needs attention' : 'All on schedule'} tone="danger" />
        <StatTile icon={CheckCircle2} label="Completion" value={`${completion}%`} hint={`${summary.completed} completed`} tone="success" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField label="Search tasks" placeholder="Search title, details, or company…" value={search} onChange={setSearch} className="lg:max-w-sm lg:flex-1" />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 lg:ml-auto lg:flex">
          <Select
            aria-label="Filter by priority"
            name="priority-filter"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}
            options={[{ value: 'all', label: 'All priorities' }, ...TASK_PRIORITIES]}
            containerClassName="lg:w-44"
          />
          {canManage ? (
            <Button onClick={() => openForm(null)}>
              <Plus className="relative z-[2] size-4" aria-hidden />
              <span className="relative z-[2]">New task</span>
            </Button>
          ) : null}
        </div>
      </div>

      <FilterTabs tabs={tabs} value={view} onChange={setView} ariaLabel="Task views" />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={view === 'overdue' ? 'Nothing overdue' : 'No tasks found'}
          description={view === 'overdue' ? 'Every open task is on schedule.' : 'Adjust the filters or create a new task.'}
          actionLabel={canManage ? 'New task' : undefined}
          onAction={canManage ? () => openForm(null) : undefined}
        />
      ) : (
        <div className="space-y-5">
          <ul className="stagger space-y-3">
            {pager.pageItems.map((task) => {
              const priority = priorityMeta(task.priority)
              const done = task.status === 'completed'
              const overdue = isOverdue(task)
              const dueSoon = !done && !overdue && daysUntil(task.dueDate) <= 1
              return (
                <li
                  key={task.id}
                  className={cn(
                    'group relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border bg-surface p-3.5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:gap-4 sm:p-4',
                    overdue ? 'border-danger/30' : 'border-border/80 hover:border-brand/30',
                    done && 'bg-surface/70',
                  )}
                >
                  <span className={cn('absolute inset-y-0 left-0 w-1', priority.accent, done && 'opacity-30')} aria-hidden />
                  <div className="pt-0.5 pl-1">
                    {canManage ? <Checkbox checked={done} onChange={() => handleToggle(task)} label={`Mark ${task.title} as ${done ? 'not completed' : 'completed'}`} /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={cn('text-sm font-semibold break-words sm:text-[15px]', done ? 'text-ink-subtle line-through' : 'text-ink')}>{task.title}</p>
                        {task.description ? <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{task.description}</p> : null}
                      </div>
                      {canManage ? (
                        <div className="flex shrink-0 gap-0.5">
                          <IconAction icon={Pencil} label={`Edit ${task.title}`} onClick={() => openForm(task)} />
                          <IconAction icon={Trash2} label={`Delete ${task.title}`} tone="danger" onClick={() => setDeleteTarget(task)} />
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                      <Badge variant={priority.variant} dot>
                        {priority.label}
                      </Badge>
                      <span className={cn('inline-flex items-center gap-1 font-medium', done ? 'text-emerald-700' : overdue ? 'text-danger' : dueSoon ? 'text-amber-600' : 'text-ink-muted')}>
                        <AlarmClock className={cn('size-3.5', overdue && 'animate-pulse')} aria-hidden />
                        {done ? 'Completed' : formatDueLabel(task.dueDate)}
                      </span>
                      {task.relatedTo ? (
                        <span className="inline-flex min-w-0 items-center gap-1 text-ink-muted">
                          <Building2 className="size-3.5 shrink-0" aria-hidden />
                          <span className="max-w-[10rem] truncate">{task.relatedTo}</span>
                        </span>
                      ) : null}
                      {canManage ? (
                        <Select
                          aria-label={`Status for ${task.title}`}
                          value={task.status}
                          onChange={(event) => dispatch(setTaskStatus({ id: task.id, status: event.target.value as TaskStatus }))}
                          options={TASK_STATUSES}
                          containerClassName="ml-auto w-36"
                          className="h-8 text-xs"
                        />
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <Pagination page={pager.page} totalPages={pager.totalPages} totalItems={pager.total} rangeStart={pager.rangeStart} rangeEnd={pager.rangeEnd} onPageChange={pager.goToPage} label="tasks" />
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit task' : 'Create task'} description="Priority, deadline, and what it relates to." size="lg">
        {formOpen ? <TaskForm key={editing?.id ?? 'new'} initial={editing ?? undefined} relatedOptions={relatedOptions} onSubmit={handleSave} onCancel={() => setFormOpen(false)} /> : null}
      </Modal>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete task" message={`Delete "${deleteTarget?.title ?? ''}"? This cannot be undone.`} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
