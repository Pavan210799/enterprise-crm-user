import { useAppSelector } from '@/app/hooks'

/** Whether chart series should animate, honouring the in-app and OS reduced-motion preferences. */
export function useChartAnimation(): boolean {
  const reduceMotion = useAppSelector((state) => state.settings.reduceMotion)
  if (reduceMotion) return false
  if (typeof window === 'undefined') return true
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
