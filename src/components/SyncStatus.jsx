import { useEffect, useState } from 'react'
import { queuedScreenings } from '../services/offline'
import Icon from './Icon'

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

  if (!online) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-[#F7D4C8] bg-[#FDF0EB] px-2.5 py-0.5 text-xs font-medium text-[#D96B43] ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#D96B43]" aria-hidden="true" />
        <span>Offline ({queueCount} pending)</span>
      </div>
    )
  }

  if (queueCount > 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-[#D5E3DB] bg-[#EBF2EE] px-2.5 py-0.5 text-xs font-medium text-[#1B4D3E] ${className}`}>
        <Icon name="refresh" className="h-3 w-3 animate-spin text-[#1B4D3E]" />
        <span>Waiting to sync ({queueCount})</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-[#C6E7D5] bg-[#E8F5EE] px-2.5 py-0.5 text-xs font-medium text-[#2D7A58] ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#2D7A58]" aria-hidden="true" />
        <span>Online</span>
      </div>
    )
  }

  return null
}
