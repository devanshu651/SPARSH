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
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${online ? 'border-risk-normal-border bg-risk-normal-bg text-risk-normal' : 'border-risk-moderate-border bg-risk-moderate-bg text-risk-moderate'} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-risk-normal' : 'bg-risk-moderate'}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
