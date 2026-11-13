/** True when the user prefers reduced motion, from the OS setting or the in-app preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (document.documentElement.classList.contains('reduce-motion')) return true
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}
