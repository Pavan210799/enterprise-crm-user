import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

export function useCountUp(target: number, duration = 900) {
  const reduce = prefersReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)
  const fromRef = useRef(reduce ? target : 0)

  useEffect(() => {
    if (reduce) return
    const from = fromRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 4
      const next = from + (target - from) * eased
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduce])

  return reduce ? target : value
}
