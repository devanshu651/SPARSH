import { useEffect, useState } from 'react'
import { queuedScreenings } from '../services/offline'

export default function SyncStatus({ compact = true, className = '' }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [queueCount, setQueueCount] = useState(0)

  useEffect(() => {
    const update = async () => {
      setOnline(navigator.onLine)
      try { setQueueCount((await queuedScreenings()).length) } catch { setQueueCount(0) }
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    const interval = setInterval(update, 5000)
    update()
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      clearInterval(interval)
    }
  }, [])

  const label = queueCount > 0
    ? `Waiting to sync (${queueCount})`
    : online ? 'Network available' : 'Offline'

  if (!compact && queueCount === 0 && online) return null
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${online ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-amber-300 bg-amber-50 text-amber-900'} ${className}`}>
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-sky-500' : 'bg-amber-500'}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
