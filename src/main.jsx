import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Read auth param from URL before React mounts and save to sessionStorage
const params = new URLSearchParams(window.location.search)
const authParam = params.get('auth')
if (authParam) {
  try {
    const userData = JSON.parse(decodeURIComponent(authParam))
    sessionStorage.setItem('vendor_user', JSON.stringify(userData))
  } catch { /* ignore */ }
  window.history.replaceState({}, '', window.location.pathname)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
