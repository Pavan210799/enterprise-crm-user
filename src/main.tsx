import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/app/store'
import './index.css'
import App from './App.tsx'

// After a redeploy, tabs on the old build request chunk files that no longer exist; reload once to pick up the new build.
const RELOAD_KEY = 'nexrel-user:chunk-reload'
window.addEventListener('vite:preloadError', (event) => {
  const last = Number(sessionStorage.getItem(RELOAD_KEY))
  if (last && Date.now() - last < 10_000) return
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  event.preventDefault()
  window.location.reload()
})

const markHostBadge = () => {
  if (!document.getElementById('nl-badge-frame')) return false
  document.documentElement.classList.add('host-badge')
  return true
}
if (!markHostBadge()) {
  new MutationObserver((_, observer) => {
    if (markHostBadge()) observer.disconnect()
  }).observe(document.body, { childList: true })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
