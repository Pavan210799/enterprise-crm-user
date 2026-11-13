import { useState } from 'react'

export function usePagination<T>(items: T[], pageSize: number, resetKey: string) {
  const [state, setState] = useState({ page: 1, resetKey })
  const page = state.resetKey === resetKey ? state.page : 1
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize

  return {
    page: safePage,
    totalPages,
    total: items.length,
    rangeStart: items.length ? start + 1 : 0,
    rangeEnd: Math.min(start + pageSize, items.length),
    pageItems: items.slice(start, start + pageSize),
    goToPage(next: number) {
      setState({ page: next, resetKey })
    },
  }
}
