import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setCommandOpen } from '@/features/ui/uiSlice'
import { NAV_SECTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { useScrollLock } from '@/hooks/useScrollLock'
import type { LucideIcon } from 'lucide-react'

type CommandItem = {
  id: string
  group: string
  label: string
  icon: LucideIcon
  to: string
}

export function CommandPalette() {
  const open = useAppSelector((s) => s.ui.commandOpen)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        dispatch(setCommandOpen(!open))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dispatch, open])

  if (!open) return null
  return <CommandPaletteDialog onClose={() => dispatch(setCommandOpen(false))} />
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useScrollLock(true)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = NAV_SECTIONS.flatMap((section) =>
      section.items.map((item) => ({
        id: `page-${item.to}`,
        group: section.title,
        label: item.label,
        icon: item.icon,
        to: item.to,
      })),
    )
    const q = query.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((page) => page.label.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function go(item: CommandItem | undefined) {
    if (!item) return
    onClose()
    navigate(item.to)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((index) => Math.min(results.length - 1, index + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((index) => Math.max(0, index - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search and commands">
      <button type="button" tabIndex={-1} className="absolute inset-0 animate-fade-in bg-plum-950/55 backdrop-blur-sm" aria-label="Close search" onClick={onClose} />
      <div className="relative flex max-h-[75dvh] w-full max-w-xl animate-scale-in flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_40px_90px_-20px_rgb(26_11_46_/_0.55)]">
        <div className="flex items-center gap-3 border-b border-border/70 px-4">
          <Search className="size-5 shrink-0 text-brand" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search your workspace…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `command-${results[active].id}` : undefined}
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-canvas-muted px-1.5 py-0.5 text-[11px] font-semibold text-ink-subtle sm:inline">
            ESC
          </kbd>
        </div>
        <div ref={listRef} id="command-results" role="listbox" className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-muted">No pages match “{query}”.</p>
          ) : (
            results.map((item, index) => {
              const showGroup = index === 0 || results[index - 1]?.group !== item.group
              const Icon = item.icon
              return (
                <div key={item.id}>
                  {showGroup ? (
                    <p className="px-3 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.16em] text-ink-subtle uppercase">{item.group}</p>
                  ) : null}
                  <button
                    type="button"
                    id={`command-${item.id}`}
                    role="option"
                    data-index={index}
                    aria-selected={index === active}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      index === active ? 'bg-brand-soft text-brand' : 'text-ink',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-lg transition-colors',
                        index === active ? 'bg-brand text-white' : 'bg-canvas-muted text-ink-muted',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                    </span>
                    {index === active ? <ArrowRight className="size-4 shrink-0 animate-fade-in" aria-hidden /> : null}
                  </button>
                </div>
              )
            })
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-border/70 bg-surface-raised px-4 py-2.5 text-xs text-ink-subtle sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-surface px-1">↑</kbd>
            <kbd className="rounded border border-border bg-surface px-1">↓</kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CornerDownLeft className="size-3.5" /> open
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
