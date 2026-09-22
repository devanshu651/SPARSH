import { useEffect, useState } from 'react'
import { queuedScreenings } from '../services/offline'
import Icon from './Icon'

export default function SyncStatus({ compact = true, className = '' }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [queueCount, setQueueCount] = useState(() => queuedScreenings().length)

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine)
      setQueueCount(queuedScreenings().length)
    }

    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    const interval = setInterval(update, 5000)

    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      clearInterval(interval)
    }
  }, [])

  if (!online) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 ${className}`}>
        <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
        <span>Offline Mode ({queueCount} pending)</span>
      </div>
    )
  }

  if (queueCount > 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 ${className}`}>
        <Icon name="refresh" className="h-3.5 w-3.5 animate-spin text-sky-700" />
        <span>Syncing {queueCount} records</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-800 ${className}`}>
        <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
        <span>Live Sync Active</span>
      </div>
    )
  }

  return null
}
