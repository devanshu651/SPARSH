import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { childrenApi } from '../services/api'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'

export default function HomeScreen({ onNavigate }) {
  const { currentWorker, setCurrentChild } = useApp()
  const [childrenList, setChildrenList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchCohort = async () => {
      try {
        const fn = childrenApi.list()
        const data = typeof fn === 'function' ? await fn() : await fn
        if (active) {
          setChildrenList(Array.isArray(data) ? data : [])
        }
      } catch {
        if (active) {
          setChildrenList([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    fetchCohort()
    return () => {
      active = false
    }
  }, [])

  const { screenedCount, atRiskCount, moderateCount, onTrackCount, queue } = useMemo(() => {
    const screened = childrenList.filter((c) => !!c.latest_risk)
    const atRisk = childrenList.filter((c) => c.latest_risk === 'RED')
    const moderate = childrenList.filter((c) => c.latest_risk === 'YELLOW')
    const onTrack = childrenList.filter((c) => c.latest_risk === 'GREEN')
    
    // Priority queue: RED first, then YELLOW, then un-screened
    const priority = [
      ...atRisk,
      ...moderate,
      ...childrenList.filter((c) => !c.latest_risk)
    ].slice(0, 5)

    return {
      screenedCount: screened.length,
      atRiskCount: atRisk.length,
      moderateCount: moderate.length,
      onTrackCount: onTrack.length,
      queue: priority
    }
  }, [childrenList])

  const metrics = [
    {
      id: 'screened',
      value: String(screenedCount),
      label: 'Children Screened',
      sub: `${childrenList.length} total enrolled`,
      icon: 'screening',
      tone: 'info',
    },
    {
      id: 'at_risk',
      value: String(atRiskCount),
      label: 'High Risk (RED)',
      sub: atRiskCount > 0 ? 'Requires immediate DEIC referral' : 'No urgent alerts',
      icon: 'alertTriangle',
      tone: 'high',
    },
    {
      id: 'moderate',
      value: String(moderateCount),
      label: 'Moderate Delay (YELLOW)',
      sub: moderateCount > 0 ? 'Under community stimulation watch' : 'No moderate delays',
      icon: 'alerts',
      tone: 'moderate',
    },
    {
      id: 'on_track',
      value: String(onTrackCount),
      label: 'Milestones On Track',
      sub: 'Meeting age-appropriate skills',
      icon: 'checkCircle',
      tone: 'normal',
    },
  ]

  const workerName = currentWorker?.name || 'Healthcare Worker'
  const centreName = currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Ward 4 Health Centre'

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date())

  return (
    <AppLayout
      active="dashboard"
      onNavigate={onNavigate}
      title="Centre Overview"
      subtitle={`${centreName} · Field Operations`}
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate?.('screening')}
          >
            <Icon name="screening" className="h-4 w-4 text-primary-800" />
            <span>Screening</span>
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
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* CLINICAL SHIFT BANNER */}
        <section className="rounded-xl border border-primary-900/10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-5 text-white shadow-card sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  Live Operational Shift
                </span>
                <span className="text-xs text-primary-200">
                  {todayFormatted}
                </span>
              </div>

              <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                Namaste, {workerName}
              </h1>

              <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-xl leading-relaxed">
                Early childhood milestone monitoring and developmental risk assessment platform.
                Review urgent alerts and screen children due for evaluation today.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:flex-nowrap">
              <Button
                variant="teal"
                onClick={() => onNavigate?.('register')}
                className="w-full sm:w-auto"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span>+ Register New Child</span>
              </Button>
            </div>
          </div>
        </section>

        {/* KPI METRIC TILES */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Centre Performance Metrics
            </h2>
            <span className="text-xs text-neutral-400">
              Updated Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card transition hover:border-neutral-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">
                    {metric.label}
                  </span>
                  <div className={`grid h-8 w-8 place-items-center rounded-lg ${
                    metric.tone === 'high'
                      ? 'bg-red-50 text-red-700'
                      : metric.tone === 'moderate'
                      ? 'bg-amber-50 text-amber-700'
                      : metric.tone === 'normal'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-primary-50 text-primary-800'
                  }`}>
                    <Icon name={metric.icon} className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-bold tracking-tight text-neutral-900">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-neutral-500">
                    {metric.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MAIN WORKFLOW GRID */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* PRIORITY FOLLOW-UPS (2 COLS ON DESKTOP) */}
          <div className="lg:col-span-2">
            <Card
              title="Priority Follow-up Queue"
              subtitle="Children with flagged delays or screenings due"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate?.('children')}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-900 hover:underline"
                >
                  View All Cohort ({childrenList.length}) →
                </button>
              }
            >
              {loading ? (
                <p className="text-xs text-neutral-500 py-4">Checking ward cohort status...</p>
              ) : queue.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-neutral-400">
                    <Icon name="checkCircle" className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-neutral-900">
                    {childrenList.length === 0
                      ? 'No children enrolled in cohort yet'
                      : 'No priority follow-ups pending'}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500 max-w-sm mx-auto">
                    {childrenList.length === 0
                      ? 'Enrol infants and children to start tracking growth anthropometrics and milestone screening.'
                      : 'All enrolled children in your assigned centre are currently on track or have completed initial evaluation.'}
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate?.('register')}
                    >
                      <Icon name="plus" className="h-3.5 w-3.5" />
                      <span>Register Child</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {queue.map((child) => {
                    const isRed = child.latest_risk === 'RED'
                    const isYellow = child.latest_risk === 'YELLOW'
                    const tone = isRed ? 'high' : isYellow ? 'moderate' : 'neutral'
                    const status = isRed ? 'High Risk' : isYellow ? 'Moderate' : 'Screening Due'
                    const detail = isRed
                      ? 'Flagged with High Risk developmental delay · DEIC referral recommended'
                      : isYellow
                      ? 'Moderate developmental delay marker flagged · Community review needed'
                      : 'Age milestone observation checkpoint due for evaluation'

                    return (
                      <div
                        key={child.id}
                        className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neutral-100 text-xs font-bold text-neutral-700">
                            {child.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-neutral-900">{child.name || 'Unnamed Child'}</p>
                              <span className="text-xs font-medium text-neutral-400">
                                · {child.age_months !== null && child.age_months !== undefined ? `${child.age_months}m` : 'Age not logged'}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-500">
                              {detail}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                          <BadgePill tone={tone} dot>
                            {status}
                          </BadgePill>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setCurrentChild(child)
                              onNavigate?.('screening')
                            }}
                            className="text-xs"
                          >
                            Start Check
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* SHIFT TARGET & PROGRESS (1 COL ON DESKTOP) */}
          <div className="space-y-6">
            <Card
              title="Screening Coverage Target"
              subtitle="Ward developmental surveillance progress"
            >
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-primary-900">{screenedCount}</span>
                  <span className="text-sm font-semibold text-neutral-400"> / {childrenList.length} children</span>
                  <p className="mt-1 text-xs text-neutral-500">
                    {childrenList.length === 0 ? 'No children registered in ward' : 'Evaluated in this centre'}
                  </p>
                </div>
                <BadgePill tone="teal">
                  {childrenList.length > 0 ? Math.round((screenedCount / childrenList.length) * 100) : 0}% Complete
                </BadgePill>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-300"
                  style={{
                    width: `${childrenList.length > 0 ? Math.round((screenedCount / childrenList.length) * 100) : 0}%`
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[11px] text-neutral-500">
                <span>{screenedCount} completed</span>
                <span>{childrenList.length - screenedCount} pending</span>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onNavigate?.('screening')}
                >
                  <Icon name="screening" className="h-4 w-4" />
                  <span>Continue Screening Workflow</span>
                </Button>
              </div>
            </Card>

            {/* QUICK PROTOCOL ACTIONS */}
            <Card title="Quick Tasks" subtitle="Common field tools">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.('register')}
                  className="flex flex-col items-start rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
                >
                  <Icon name="userPlus" className="h-4 w-4 text-primary-800" />
                  <span className="mt-2 text-xs font-bold text-neutral-900">New Registration</span>
                  <span className="text-[10px] text-neutral-500">Enrol new infant</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.('children')}
                  className="flex flex-col items-start rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
                >
                  <Icon name="children" className="h-4 w-4 text-primary-800" />
                  <span className="mt-2 text-xs font-bold text-neutral-900">Cohort Directory</span>
                  <span className="text-[10px] text-neutral-500">Browse ward records</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.('analytics')}
                  className="flex flex-col items-start rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
                >
                  <Icon name="analytics" className="h-4 w-4 text-primary-800" />
                  <span className="mt-2 text-xs font-bold text-neutral-900">Analytics</span>
                  <span className="text-[10px] text-neutral-500">Supervisor reports</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.('alerts')}
                  className="flex flex-col items-start rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-left transition hover:bg-neutral-100 hover:border-neutral-300"
                >
                  <Icon name="alerts" className="h-4 w-4 text-primary-800" />
                  <span className="mt-2 text-xs font-bold text-neutral-900">Clinical Alerts</span>
                  <span className="text-[10px] text-neutral-500">Triage notices</span>
                </button>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </AppLayout>
  )
}