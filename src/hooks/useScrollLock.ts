import { useEffect } from 'react'

let locks = 0

// iOS Safari only stops background touch scrolling when the root element is locked too.
function setLocked(locked: boolean) {
  const value = locked ? 'hidden' : ''
  document.documentElement.style.overflow = value
  document.body.style.overflow = value
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    locks += 1
    setLocked(true)
    return () => {
      locks = Math.max(0, locks - 1)
      if (locks === 0) setLocked(false)
    }
  }, [active])
}
