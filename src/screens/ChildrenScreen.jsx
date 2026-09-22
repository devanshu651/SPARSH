import { useEffect, useMemo, useState } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'

const riskFilters = [
  { id: 'All', label: 'All Children' },
  { id: 'RED', label: 'High Risk' },
  { id: 'YELLOW', label: 'Moderate' },
  { id: 'GREEN', label: 'On Track' },
]

export default function ChildrenScreen({ onNavigate }) {
  const { setCurrentChild } = useApp()
  const [childrenList, setChildrenList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const data = typeof fn === 'function' ? await fn() : await fn
      setChildrenList(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
      setChildrenList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredChildren = useMemo(() => {
    return childrenList.filter((child) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        !query ||
        child.name?.toLowerCase().includes(query) ||
        child.child_identifier?.toLowerCase().includes(query) ||
        child.guardian_name?.toLowerCase().includes(query)

      const matchesRisk =
        activeFilter === 'All' ||
        (activeFilter === 'RED' && child.latest_risk === 'RED') ||
        (activeFilter === 'YELLOW' && child.latest_risk === 'YELLOW') ||
        (activeFilter === 'GREEN' && (child.latest_risk === 'GREEN' || !child.latest_risk))

      return matchesSearch && matchesRisk
    })
  }, [childrenList, search, activeFilter])

  const calculateAge = (dob) => {
    if (!dob) return null
    const diffMs = Date.now() - new Date(dob).getTime()
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375)))
  }

  const handleSelectChild = (child, targetScreen = 'history') => {
    setCurrentChild(child)
    onNavigate?.(targetScreen)
  }

  return (
    <AppLayout
      active="children"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Child Cohort Directory"
      subtitle={`${childrenList.length} registered children in assigned ward`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={load}
          >
            <Icon name="refresh" className="h-4 w-4 text-neutral-600" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('register')}
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Register Child</span>
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">

        {/* IN-PAGE HEADER BANNER */}
        <section className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-800 ring-1 ring-inset ring-primary-700/10">
                  <Icon name="children" className="h-3.5 w-3.5 text-primary-800" />
                  Ward Cohort Registry
                </span>
                <span className="text-xs text-neutral-400">
                  Under-5 Milestone Surveillance
                </span>
              </div>
              <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                Child Cohort Directory
              </h1>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm max-w-2xl leading-relaxed">
                Complete roster of enrolled children under your health centre surveillance.
                Review developmental milestones, anthropometric nutrition vitals, and initiate periodic RBSK screenings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                onClick={() => onNavigate?.('register')}
                className="w-full sm:w-auto"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span>+ Register New Child</span>
              </Button>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="search"
              aria-label="Search children by name, ID, or guardian"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by child name, ID, or guardian..."
              className="h-10 w-full rounded-lg border border-neutral-300 bg-neutral-50/50 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {riskFilters.map((filter) => {
              const isActive = activeFilter === filter.id
              const count =
                filter.id === 'All'
                  ? childrenList.length
                  : filter.id === 'RED'
                  ? childrenList.filter((c) => c.latest_risk === 'RED').length
                  : filter.id === 'YELLOW'
                  ? childrenList.filter((c) => c.latest_risk === 'YELLOW').length
                  : childrenList.filter((c) => c.latest_risk === 'GREEN' || !c.latest_risk).length

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary-800 text-white shadow-xs'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  {filter.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* CONTENT STATES */}
        {loading ? (
          <LoadingState label="Loading registered child cohort records..." />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : childrenList.length === 0 ? (
          <EmptyState
            title="No children registered yet"
            detail="Your Anganwadi centre cohort directory is currently empty. Enrol children to monitor milestone progress, log growth anthropometrics, and identify developmental delays early."
            icon="children"
            action={
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Button
                  variant="primary"
                  onClick={() => onNavigate?.('register')}
                >
                  <Icon name="plus" className="h-4 w-4" />
                  <span>Register Child</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            }
          />
        ) : filteredChildren.length === 0 ? (
          <EmptyState
            title="No matching children found"
            detail="No children match your search query and risk filter criteria. Try adjusting search terms or resetting filters."
            icon="search"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setActiveFilter('All')
                }}
              >
                Reset Search & Filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChildren.map((child) => {
              const ageMonths = child.age_months ?? calculateAge(child.date_of_birth)
              const riskTone =
                child.latest_risk === 'RED'
                  ? 'high'
                  : child.latest_risk === 'YELLOW'
                  ? 'moderate'
                  : child.latest_risk === 'GREEN'
                  ? 'normal'
                  : 'neutral'

              const riskLabel =
                child.latest_risk === 'RED'
                  ? 'High Risk'
                  : child.latest_risk === 'YELLOW'
                  ? 'Moderate Delay'
                  : child.latest_risk === 'GREEN'
                  ? 'On Track'
                  : 'Not Screened'

              return (
                <div
                  key={child.id}
                  className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card transition hover:border-neutral-300"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 font-bold text-xs text-primary-800">
                          {child.name?.charAt(0) || 'C'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-neutral-900">
                            {child.name || 'Unnamed Child'}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {ageMonths !== null ? `${ageMonths} months` : 'Age not recorded'}
                            {child.sex ? ` · ${child.sex}` : ''}
                          </p>
                        </div>
                      </div>

                      <BadgePill tone={riskTone} dot>
                        {riskLabel}
                      </BadgePill>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-b border-neutral-100 py-2.5 text-[11px]">
                      <div>
                        <span className="text-neutral-400">ID:</span>{' '}
                        <span className="font-semibold text-neutral-700">{child.child_identifier || '—'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Guardian:</span>{' '}
                        <span className="truncate font-semibold text-neutral-700">{child.guardian_name || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleSelectChild(child, 'history')}
                    >
                      <span>Medical Record</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleSelectChild(child, 'screening')}
                    >
                      <Icon name="screening" className="h-3.5 w-3.5" />
                      <span>Screen Now</span>
                    </Button>
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