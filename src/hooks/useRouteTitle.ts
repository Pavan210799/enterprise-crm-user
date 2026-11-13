import { useMatches } from 'react-router-dom'

export type RouteHandle = { title?: string }

export function useRouteTitle() {
  const matches = useMatches()
  const handle = [...matches].reverse().find((match) => (match.handle as RouteHandle | undefined)?.title)?.handle as
    | RouteHandle
    | undefined
  return handle?.title
}
