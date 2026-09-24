import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { centresApi, childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'

const riskLabel = (risk) =>
  risk === 'RED' ? 'At risk' : risk === 'YELLOW' ? 'Moderate' : risk === 'GREEN' ? 'Normal' : '—'

const riskBadge = (risk) =>
  risk === 'RED'
    ? 'bg-red-50 text-red-600 ring-red-100'
    : risk === 'YELLOW'
    ? 'bg-amber-50 text-amber-600 ring-amber-100'
    : risk === 'GREEN'
    ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
    : 'bg-neutral-100 text-neutral-500'

const initials = (name) =>
  (name || '—')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const formatAge = (months) => {
  if (months === null || months === undefined) return '—'
  const years = Math.floor(months / 12)
  const remaining = months % 12
  return years > 0 ? `${years}y ${remaining}m` : `${remaining}m`
}

const timeOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen({ onNavigate }) {
  const { currentWorker, setCurrentChild } = useApp()
  const [centres, setCentres] = useState([])
  const [children, setChildren] = useState([])
  const [state, setState] = useState('idle')
  const [error, setError] = useState(null)

  const navigate = (screen) => onNavigate?.(screen)

  useEffect(() => {
    let active = true
    const load = async () => {
      setState('loading')
      setError(null)
      try {
        const [centreList, childList] = await Promise.all([centresApi.list(), childrenApi.list()])
        if (active) {
          setCentres(centreList)
          setChildren(childList)
          setState('idle')
        }
      } catch (e) {
        if (active) {
          setError(e)
          setState('error')
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const assignedCentre = useMemo(() => {
    const ids = currentWorker?.centre_ids || []
    if (!ids.length) return null
    return centres.find((centre) => ids.includes(centre.id))
  }, [centres, currentWorker?.centre_ids])

  const summary = useMemo(() => {
    const total = children.length
    const atRisk = children.filter((c) => c.latest_risk === 'RED').length
    const moderate = children.filter((c) => c.latest_risk === 'YELLOW').length
    const followUp = atRisk + moderate
    return { total, atRisk, moderate, followUp }
  }, [children])

  const recentChildren = useMemo(
    () =>
      children
        .slice()
        .sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
        .slice(0, 5),
    [children]
  )

  const workerName = currentWorker?.name || 'Anganwadi Worker'
  const isAdmin = currentWorker?.role === 'admin'

  return (
    <AppLayout active="dashboard" onNavigate={onNavigate}>
      <div className="bg-neutral-50 pb-12 text-slate-900">
        <header className="bg-gradient-to-r from-primary-700 to-teal-600 text-white">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70">{timeOfDay()}</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">{workerName}</h1>
                <p className="mt-0.5 text-xs text-white/70">
                  {assignedCentre ? `${assignedCentre.name}, ${assignedCentre.district || ''}`.trim().replace(/,\s*$/, '') : isAdmin ? 'Administrator' : 'Assigned Anganwadi Centre'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('alerts')}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm ring-1 ring-white/20 hover:bg-white/20"
                  aria-label="Alerts"
                >
                  🔔
                </button>
                <button
                  type="button"
                  onClick={() => navigate('settings')}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm ring-1 ring-white/20 hover:bg-white/20"
                  aria-label="Settings"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <section className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full flex-1 justify-center"
              onClick={() => navigate('register')}
              aria-label="Register a new child"
            >
              + Register Child
            </Button>
            <Button
              className="w-full flex-1 justify-center"
              variant="secondary"
              onClick={() => navigate('children')}
              aria-label="View registered children"
            >
              Children
            </Button>
            <Button
              className="w-full flex-1 justify-center"
              variant="secondary"
              onClick={() => navigate('screening')}
              aria-label="Start a screening"
            >
              Start Screening
            </Button>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700">Today's overview</h2>
            {state === 'loading' ? (
              <LoadingState label="Loading overview…" />
            ) : state === 'error' ? (
              <ErrorState error={error} onRetry={() => setState('idle')} />
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <OverviewCard title="Registered children" value={String(summary.total)} />
                {summary.followUp > 0 ? (
                  <OverviewCard title="Needs follow-up" value={String(summary.followUp)} variant="attention" />
                ) : summary.total > 0 ? (
                  <OverviewCard title="Needs follow-up" value="None" />
                ) : (
                  <OverviewCard title="Needs follow-up" value="—" />
                )}
                <OverviewCard
                  title="At-risk (RED)"
                  value={String(summary.atRisk)}
                  sub={summary.moderate > 0 ? `${summary.moderate} moderate` : undefined}
                />
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700">Recent children</h2>
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('children')}
                  className="text-xs font-bold text-primary-700 hover:underline"
                  aria-label="View all children"
                >
                  View all
                </button>
              )}
            </div>

            {state === 'loading' ? null : state === 'error' ? null : recentChildren.length === 0 ? (
              <EmptyState
                title={children.length === 0 ? 'No children registered yet' : 'No recent children'}
                detail={children.length === 0 ? 'Register the first child to begin screening.' : undefined}
                action={
                  <Button className="mt-4" onClick={() => navigate('register')}>
                    Register child
                  </Button>
                }
              />
            ) : (
              <ul className="mt-4 divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
                {recentChildren.map((child) => (
                  <li key={child.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentChild(child)
                        navigate('screening')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                        {initials(child.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900">{child.name}</p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500">
                          {formatAge(child.age_months)} · {child.child_identifier}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${riskBadge(child.latest_risk)}`}
                        aria-label={`Risk: ${riskLabel(child.latest_risk)}`}
                      >
                        {riskLabel(child.latest_risk)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isAdmin && (
            <section className="mt-8">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700">Admin tools</h2>
              </div>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => navigate('admin-console')}>
                  Admin console
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function OverviewCard({ title, value, sub, variant }) {
  const titleColor = variant === 'attention' ? 'text-red-600' : 'text-neutral-600'
  const valueColor = variant === 'attention' ? 'text-red-700' : 'text-primary-800'

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
      <p className={`text-xs font-semibold ${titleColor}`}>{title}</p>
      <p className={`mt-2 text-3xl font-extrabold ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-neutral-400">{sub}</p>}
    </div>
  )
}
