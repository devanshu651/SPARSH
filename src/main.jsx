import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './locales/i18n'
import App from './App'

try {
  for (let index = localStorage.length - 1; index >= 0; index--) {
    const key = localStorage.key(index)
    if (key === 'sparsh:demo-mode' || key?.startsWith('sparsh:demo:')) localStorage.removeItem(key)
  }
} catch {
  // Storage may be unavailable in restricted browser contexts.
}

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
