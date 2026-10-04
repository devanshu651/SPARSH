import { useState, useEffect, useMemo } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import { queuedScreenings } from '../services/offline'
import AppLayout from '../components/AppLayout'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { ErrorState, LoadingState } from '../components/AsyncState'

export default function AlertsScreen({ onNavigate }) {
  const { setCurrentChild } = useApp()
  const [children, setChildren] = useState([])
  const [offlineCount, setOfflineCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All') // 'All' | 'Follow Up' | 'At Risk' | 'Referrals'

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const raw = typeof fn === 'function' ? await fn() : await fn
      setChildren(Array.isArray(raw) ? raw : [])

      try {
        const queue = await queuedScreenings()
        setOfflineCount(Array.isArray(queue) ? queue.length : 0)
      } catch {
        setOfflineCount(0)
      }
    } catch (err) {
      setError(err)
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Generate alerts strictly from the actual cohort
  const alerts = useMemo(() => {
    const list = []

    // 1. High risk alerts
    children
      .filter((c) => c.latest_risk === 'RED')
      .forEach((child) => {
        list.push({
          id: `alert-risk-${child.id}`,
          child,
          name: child.name,
          age: child.age_months !== null && child.age_months !== undefined
            ? `${Math.floor(child.age_months / 12)} years ${child.age_months % 12} months`
            : 'Age not logged',
          desc: `Child (ID: ${child.child_identifier || '—'}) has a high risk screening indication and needs follow-up review.`,
          date: child.updated_at
            ? new Date(child.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Action Required',
          badge: 'At Risk',
          tone: 'risk',
          category: 'At Risk',
          targetScreen: 'referral'
        })
      })

    // 2. Follow Up alerts (Moderate / Yellow)
    children
      .filter((c) => c.latest_risk === 'YELLOW')
      .forEach((child) => {
        list.push({
          id: `alert-followup-${child.id}`,
          child,
          name: child.name,
          age: child.age_months !== null && child.age_months !== undefined
            ? `${Math.floor(child.age_months / 12)} years ${child.age_months % 12} months`
            : 'Age not logged',
          desc: `Review recommended: developmental domain checkpoint needs follow-up re-evaluation.`,
          date: child.updated_at
            ? new Date(child.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Review Recommended',
          badge: 'Follow Up',
          tone: 'followup',
          category: 'Follow Up',
          targetScreen: 'child-profile'
        })
      })

    // 3. Children with screening due
    children
      .filter((c) => !c.latest_risk)
      .slice(0, 5)
      .forEach((child) => {
        list.push({
          id: `alert-due-${child.id}`,
          child,
          name: child.name,
          age: child.age_months !== null && child.age_months !== undefined
            ? `${Math.floor(child.age_months / 12)} years ${child.age_months % 12} months`
            : 'Age not logged',
          desc: 'Developmental screening checkpoint is due for observation.',
          date: child.created_at
            ? new Date(child.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Due Checkpoint',
          badge: 'Follow Up',
          tone: 'followup',
          category: 'Follow Up',
          targetScreen: 'screening'
        })
      })

    // 4. Offline sync alert if queued
    if (offlineCount > 0) {
      list.unshift({
        id: 'alert-offline-queue',
        child: null,
        name: 'Offline Screenings Pending Sync',
        age: `${offlineCount} saved records`,
        desc: 'Screenings saved offline are ready to sync with the server.',
        date: 'Awaiting Connection',
        badge: 'Follow Up',
        tone: 'followup',
        category: 'Follow Up',
        targetScreen: 'settings'
      })
    }

    return list
  }, [children, offlineCount])

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'All') return alerts
    if (activeFilter === 'Follow Up') return alerts.filter((a) => a.badge === 'Follow Up')
    if (activeFilter === 'At Risk') return alerts.filter((a) => a.badge === 'At Risk')
    if (activeFilter === 'Referrals') return alerts.filter((a) => a.targetScreen === 'referral')
    return alerts
  }, [alerts, activeFilter])

  const handleAlertClick = (alert) => {
    if (alert.child) {
      setCurrentChild(alert.child)
    }
    onNavigate?.(alert.targetScreen || 'children')
  }

  const filters = ['All', 'Follow Up', 'At Risk', 'Referrals']

  return (
    <AppLayout
      active="alerts"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Alerts"
      actions={
        <div className="relative">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#D96B43] hover:bg-[#FDF0EB] transition">
            <Icon name="bell" className="h-5 w-5" />
          </span>
          {alerts.some((a) => a.badge === 'At Risk') && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D96B43]" />
          )}
        </div>
      }
    >
      <div className="relative mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Filter Pills (Matches Screen 9) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((filter) => {
            const isActive = activeFilter === filter

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'border border-[#E5EBE7] bg-white text-[#5A6660] hover:border-[#CBD5D0] hover:text-[#1A201E]'
                }`}
              >
                {filter}
              </button>
            )
          })}
        </div>

        {/* Alerts List */}
        {loading ? (
          <LoadingState label="Loading alerts..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E] mb-3">
              <Icon name="bell" className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A201E]">No alerts in this category</h3>
            <p className="mt-1 text-xs text-[#5A6660]">
              All children in this filter currently have normal development status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs transition hover:border-[#1B4D3E]/30 hover:shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
                    {alert.name?.charAt(0) || 'C'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#1A201E]">{alert.name}</h4>
                    </div>
                    <p className="text-xs text-[#5A6660]">{alert.age}</p>
                    <p className="text-xs text-[#1A201E] pt-0.5 leading-snug">{alert.desc}</p>
                    <p className="text-[11px] text-[#8E9C95] pt-1">{alert.date}</p>
                  </div>
                </div>

                <BadgePill tone={alert.tone}>
                  {alert.badge}
                </BadgePill>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
