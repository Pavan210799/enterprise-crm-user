import { useEffect, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

type RouteLoaderProps = {
  fallback: ReactNode
  children: ReactNode
  delay?: number
}

export function RouteLoader({ fallback, children, delay = 450 }: RouteLoaderProps) {
  const skipDelay = prefersReducedMotion()
  const [ready, setReady] = useState(skipDelay)

  useEffect(() => {
    if (skipDelay) return
    const timer = window.setTimeout(() => setReady(true), delay)
    return () => window.clearTimeout(timer)
  }, [delay, skipDelay])

  return ready ? children : fallback
}
