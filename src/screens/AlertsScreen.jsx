import { useState, useEffect } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import { queuedScreenings } from '../services/offline'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { LoadingState, EmptyState } from '../components/AsyncState'

export default function AlertsScreen({ onNavigate }) {
  const { setCurrentChild } = useApp()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const fn = childrenApi.list()
      const raw = typeof fn === 'function' ? await fn() : await fn
      const children = Array.isArray(raw) ? raw : []
      const generated = []

      // 1. Generate urgent alerts for RED (High Risk) children
      const redChildren = children.filter((c) => c.latest_risk === 'RED')
      redChildren.forEach((child, index) => {
        generated.push({
          id: `alert-red-${child.id}`,
          child,
          title: `Urgent DEIC Referral Required: ${child.name}`,
          detail: `Patient (ID: ${child.child_identifier || '—'}) flagged with High Risk developmental delay. RBSK Form 3A referral docket recommended for specialized pediatric evaluation.`,
          time: 'Action Required Immediately',
          type: 'urgent',
          unread: true,
          targetScreen: 'referral'
        })
      })

      // 2. Generate clinical alerts for YELLOW (Moderate Delay) children
      const yellowChildren = children.filter((c) => c.latest_risk === 'YELLOW')
      yellowChildren.forEach((child) => {
        generated.push({
          id: `alert-yellow-${child.id}`,
          child,
          title: `Moderate Delay Follow-up: ${child.name}`,
          detail: `Observation markers flagged in moderate delay range (Age: ${child.age_months ?? '—'}m). Review parental stimulation exercises and schedule re-screening in 4 weeks.`,
          time: 'Scheduled Watch',
          type: 'clinical',
          unread: true,
          targetScreen: 'history'
        })
      })

      // 3. Generate scheduled screening checkpoint alerts for pending children
      const pendingChildren = children.filter((c) => !c.latest_risk)
      pendingChildren.slice(0, 5).forEach((child) => {
        generated.push({
          id: `alert-pending-${child.id}`,
          child,
          title: `Developmental Milestone Checkpoint Due: ${child.name}`,
          detail: `Enrolled child (Age: ${child.age_months ?? '—'} months) has not yet completed age-appropriate RBSK checkpoint observation.`,
          time: 'Routine Checkpoint',
          type: 'schedule',
          unread: false,
          targetScreen: 'screening'
        })
      })

      // 4. Offline sync alert if items in local queue
      const queue = queuedScreenings()
      if (queue.length > 0) {
        generated.unshift({
          id: 'alert-sync-offline',
          title: `${queue.length} Screenings Stored Offline Awaiting Sync`,
          detail: 'Screenings completed without internet connectivity are securely encrypted on this device. They will synchronize automatically when connection resumes.',
          time: 'Network Sync',
          type: 'clinical',
          unread: true,
          targetScreen: 'settings'
        })
      }

      // 5. System operational milestone if few alerts
      if (generated.length === 0) {
        generated.push({
          id: 'alert-system-good',
          title: 'All Ward Child Screenings Up to Date',
          detail: 'No high-risk delays or overdue milestone screenings detected in the active Anganwadi cohort.',
          time: 'Today',
          type: 'success',
          unread: false
        })
      }

      setAlerts(generated)
    } catch {
      // Fallback in case of network issue
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const unreadCount = alerts.filter((a) => a.unread).length
  const urgentCount = alerts.filter((a) => a.type === 'urgent').length

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })))
  }

  const handleAction = (alert) => {
    if (alert.child) {
      setCurrentChild(alert.child)
    }
    if (alert.targetScreen) {
      onNavigate?.(alert.targetScreen)
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return a.unread
    if (filter === 'urgent') return a.type === 'urgent'
    return true
  })

  return (
    <AppLayout
      active="alerts"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Clinical Notifications & Action Triage"
      subtitle={`${unreadCount} pending casework action items across assigned ward`}
      actions={
        unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
          >
            <Icon name="check" className="h-4 w-4" />
            <span>Mark All as Read</span>
          </Button>
        )
      }
    >
      <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">

        {/* SUMMARY KPI STRIP */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Urgent DEIC Escalations</span>
            <p className="mt-1 text-2xl font-bold text-red-800">{urgentCount}</p>
            <span className="text-[11px] text-red-600">Immediate specialist referral needed</span>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Unread Notices</span>
            <p className="mt-1 text-2xl font-bold text-teal-800">{unreadCount}</p>
            <span className="text-[11px] text-teal-600">Requiring caseworker attention</span>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Notifications</span>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{alerts.length}</p>
            <span className="text-[11px] text-neutral-400">Live clinical surveillance</span>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-card">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                filter === 'all'
                  ? 'bg-primary-800 text-white shadow-xs'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                filter === 'unread'
                  ? 'bg-primary-800 text-white shadow-xs'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('urgent')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                filter === 'urgent'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Urgent Referrals ({urgentCount})
            </button>
          </div>

          <span className="text-xs text-neutral-400 hidden sm:inline">
            Real-time RBSK clinical surveillance
          </span>
        </div>

        {/* ALERTS LIST CONTENT */}
        {loading ? (
          <LoadingState label="Auditing ward child records for clinical alerts..." />
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            title="No alerts in this category"
            detail={
              filter === 'urgent'
                ? 'No children currently require urgent DEIC specialist referrals.'
                : 'All enrolled children in your assigned centre have up-to-date milestone records or no triage alerts are active.'
            }
            icon="checkCircle"
            action={
              <div className="flex gap-2.5 justify-center">
                <Button variant="secondary" size="sm" onClick={() => onNavigate?.('children')}>
                  <Icon name="children" className="h-4 w-4" />
                  <span>Browse Cohort</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => onNavigate?.('screening')}>
                  <Icon name="screening" className="h-4 w-4" />
                  <span>Screen Child</span>
                </Button>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isUrgent = alert.type === 'urgent'
              const isSuccess = alert.type === 'success'

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-4 sm:p-5 transition shadow-card ${
                    isUrgent
                      ? 'border-red-200 bg-red-50/50'
                      : alert.unread
                      ? 'border-neutral-300 bg-white'
                      : 'border-neutral-200 bg-neutral-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                          isUrgent
                            ? 'bg-red-100 text-red-700'
                            : isSuccess
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-primary-50 text-primary-800'
                        }`}
                      >
                        <Icon
                          name={
                            isUrgent
                              ? 'hospital'
                              : isSuccess
                              ? 'checkCircle'
                              : alert.type === 'schedule'
                              ? 'children'
                              : 'alerts'
                          }
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-bold ${alert.unread ? 'text-neutral-900' : 'text-neutral-700'}`}>
                            {alert.title}
                          </h3>
                          {alert.unread && (
                            <span className="h-2 w-2 rounded-full bg-teal-600" aria-label="Unread" />
                          )}
                          {isUrgent && (
                            <BadgePill tone="high" dot>
                              RBSK Red Alert
                            </BadgePill>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-2xl">
                          {alert.detail}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-400">
                          <span>{alert.time}</span>
                          {alert.child && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-neutral-600">ID: {alert.child.child_identifier || '—'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {alert.targetScreen && (
                      <div className="flex shrink-0 items-center self-end sm:self-center mt-2 sm:mt-0">
                        <Button
                          variant={isUrgent ? 'destructive' : 'primary'}
                          size="sm"
                          onClick={() => handleAction(alert)}
                          className="text-xs font-bold"
                        >
                          <span>{isUrgent ? 'Generate Referral →' : alert.targetScreen === 'screening' ? 'Screen Now →' : 'View Record →'}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </AppLayout>
  )
}