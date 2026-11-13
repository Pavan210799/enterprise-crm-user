import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useCreateParam(enabled: boolean, open: () => void) {
  const [params, setParams] = useSearchParams()
  const requested = enabled && params.get('new') === '1'
  const [seen, setSeen] = useState(false)
  if (requested !== seen) {
    setSeen(requested)
    if (requested) open()
  }

  useEffect(() => {
    if (params.get('new') !== '1') return
    const next = new URLSearchParams(params)
    next.delete('new')
    setParams(next, { replace: true })
  }, [params, setParams])
}
