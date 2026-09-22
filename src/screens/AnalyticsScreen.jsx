import { useState, useEffect, useMemo } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { LoadingState, ErrorState } from '../components/AsyncState'

export default function AnalyticsScreen({ onNavigate }) {
  const { currentWorker, setCurrentChild } = useApp()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const data = typeof fn === 'function' ? await fn() : await fn
      setChildren(Array.isArray(data) ? data : [])
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

  // Derive real statistics from cohort
  const stats = useMemo(() => {
    const total = children.length
    const screened = children.filter((c) => !!c.latest_risk).length
    const red = children.filter((c) => c.latest_risk === 'RED').length
    const yellow = children.filter((c) => c.latest_risk === 'YELLOW').length
    const green = children.filter((c) => c.latest_risk === 'GREEN').length
    const pending = total - screened

    const compliance = total > 0 ? Math.round((screened / total) * 100) : 0
    const redPct = screened > 0 ? Math.round((red / screened) * 100) : 0
    const yellowPct = screened > 0 ? Math.round((yellow / screened) * 100) : 0
    const greenPct = screened > 0 ? Math.round((green / screened) * 100) : 0

    return {
      total,
      screened,
      red,
      yellow,
      green,
      pending,
      compliance,
      redPct,
      yellowPct,
      greenPct
    }
  }, [children])

  // Children flagged for priority follow-up
  const priorityChildren = useMemo(() => {
    return children
      .filter((c) => c.latest_risk === 'RED' || c.latest_risk === 'YELLOW' || !c.latest_risk)
      .sort((a, b) => {
        const order = { RED: 0, YELLOW: 1 }
        const rA = order[a.latest_risk] ?? 2
        const rB = order[b.latest_risk] ?? 2
        return rA - rB
      })
  }, [children])

  const handleInspectChild = (child) => {
    setCurrentChild(child)
    if (child.latest_risk === 'RED') {
      onNavigate?.('referral')
    } else {
      onNavigate?.('history')
    }
  }

  const centreTitle = currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Ward 4 Sub-centre'

  return (
    <AppLayout
      active="analytics"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Supervisor Population Surveillance & Analytics"
      subtitle={`${centreTitle} · RBSK Developmental Screening Coverage & Triage`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
        >
          <Icon name="report" className="h-4 w-4 text-neutral-600" />
          <span>Export Monthly Audit</span>
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        {loading ? (
          <LoadingState label="Computing cohort population analytics..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : (
          <>
            {/* TOP LEVEL KPI STRIP */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              
              {/* Total Cohort */}
              <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">Total Registered Cohort</span>
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-800">
                    <Icon name="children" className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="mt-1 text-[11px] text-neutral-500">Under-5 children in assigned ward</p>
              </div>

              {/* Compliance */}
              <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600">Screening Compliance</span>
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-800">
                    <Icon name="checkCircle" className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-teal-700">{stats.compliance}%</p>
                <p className="mt-1 text-[11px] text-neutral-500">{stats.screened} of {stats.total} evaluated</p>
              </div>

              {/* High Risk Cases */}
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800">High Risk Delays (RED)</span>
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-100 text-red-700">
                    <Icon name="hospital" className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-red-700">{stats.red}</p>
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {stats.redPct}% of evaluated children
                </p>
              </div>

              {/* Moderate Delays */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Moderate Watch (YELLOW)</span>
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <Icon name="alerts" className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-amber-700">{stats.yellow}</p>
                <p className="mt-1 text-[11px] text-amber-600 font-medium">
                  {stats.yellowPct}% under community follow-up
                </p>
              </div>
            </div>

            {/* CHARTS GRID */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* POPULATION RISK DISTRIBUTION */}
              <Card
                title="Developmental Risk Profile"
                subtitle="RBSK triage distribution across screened children in this centre"
              >
                <div className="mt-2 flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                  
                  {/* Conic Ring Chart */}
                  <div
                    className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full shadow-inner"
                    style={{
                      background: stats.screened > 0
                        ? `conic-gradient(#16a34a 0% ${stats.greenPct}%, #d97706 ${stats.greenPct}% ${stats.greenPct + stats.yellowPct}%, #dc2626 ${stats.greenPct + stats.yellowPct}% 100%)`
                        : '#e2e8f0'
                    }}
                  >
                    <div className="grid h-26 w-26 place-items-center rounded-full bg-white shadow-xs">
                      <div className="text-center">
                        <span className="text-2xl font-extrabold text-neutral-900">{stats.screened}</span>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-neutral-400">Screened</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend & Breakdown */}
                  <div className="w-full max-w-xs space-y-2.5 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 p-2.5 border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                        <span className="font-semibold text-emerald-950">On Track (GREEN)</span>
                      </div>
                      <span className="font-bold text-emerald-900">{stats.green} ({stats.greenPct}%)</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-amber-50/70 p-2.5 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="font-semibold text-amber-950">Moderate Delay (YELLOW)</span>
                      </div>
                      <span className="font-bold text-amber-900">{stats.yellow} ({stats.yellowPct}%)</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-red-50/70 p-2.5 border border-red-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                        <span className="font-semibold text-red-950">High Risk Delay (RED)</span>
                      </div>
                      <span className="font-bold text-red-900">{stats.red} ({stats.redPct}%)</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-neutral-100/70 p-2.5 border border-neutral-200">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                        <span className="font-semibold text-neutral-700">Screening Pending</span>
                      </div>
                      <span className="font-bold text-neutral-800">{stats.pending}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* CLINICAL PROTOCOL ADHERENCE & TARGETS */}
              <Card
                title="Supervisory Operational Standards"
                subtitle="Frontline milestone delivery targets and referral tracking"
              >
                <div className="mt-2 space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                      <span>Under-5 Cohort Screening Coverage</span>
                      <span>{stats.compliance}% / 100% Target</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-teal-600 transition-all duration-500"
                        style={{ width: `${stats.compliance}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500 font-medium">Assigned Anganwadi Centre:</span>
                      <span className="font-bold text-neutral-900">{currentWorker?.centre_ids?.[0] || 'AWC-MH-2847'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500 font-medium">Lead Health Caseworker:</span>
                      <span className="font-bold text-neutral-900">{currentWorker?.name || 'Healthcare Worker'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500 font-medium">RBSK Dataset Version:</span>
                      <span className="font-bold text-teal-800">Version 2.4 (2025 Standard)</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-teal-50 p-3 text-[11px] text-teal-800 border border-teal-200">
                    <span className="font-bold">Supervisor Guidance:</span>
                    <p className="mt-0.5 leading-relaxed">
                      Children flagged with RED high risk require immediate DEIC referral documentation. Moderate cases should be re-evaluated at the 4-week nutritional checkpoint visit.
                    </p>
                  </div>
                </div>
              </Card>

            </div>

            {/* PRIORITY ATTENTION TABLE */}
            <Card
              title="Ward Priority Attention Roster"
              subtitle="Children requiring immediate specialist referral or developmental follow-up"
            >
              {priorityChildren.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4">
                  No children currently require priority intervention in this ward.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Child Name & Identifier</th>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Guardian</th>
                        <th className="py-2.5 px-3">Clinical Triage</th>
                        <th className="py-2.5 px-3 text-right">Caseworker Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {priorityChildren.map((c) => {
                        const tone =
                          c.latest_risk === 'RED'
                            ? 'high'
                            : c.latest_risk === 'YELLOW'
                            ? 'moderate'
                            : 'neutral'

                        const label =
                          c.latest_risk === 'RED'
                            ? 'High Risk (RED)'
                            : c.latest_risk === 'YELLOW'
                            ? 'Moderate Delay'
                            : 'Pending Initial Screening'

                        return (
                          <tr key={c.id} className="hover:bg-neutral-50/60">
                            <td className="py-3 px-3 font-semibold text-neutral-900">
                              <div className="flex items-center gap-2">
                                <span>{c.name || 'Unnamed Child'}</span>
                                <span className="text-[10px] text-neutral-400 font-normal">({c.child_identifier || '—'})</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-neutral-700">
                              {c.age_months !== null && c.age_months !== undefined ? `${c.age_months}m` : '—'}
                            </td>
                            <td className="py-3 px-3 text-neutral-600">
                              {c.guardian_name || '—'}
                            </td>
                            <td className="py-3 px-3">
                              <BadgePill tone={tone} dot>
                                {label}
                              </BadgePill>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant={c.latest_risk === 'RED' ? 'destructive' : 'secondary'}
                                onClick={() => handleInspectChild(c)}
                              >
                                <span>{c.latest_risk === 'RED' ? 'Issue Referral →' : !c.latest_risk ? 'Screen →' : 'View Record →'}</span>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

          </>
        )}

      </div>
    </AppLayout>
  )
}