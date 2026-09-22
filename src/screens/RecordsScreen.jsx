import { useEffect, useMemo, useState } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Input from '../components/Input'
import Card from '../components/Card'
import Icon from '../components/Icon'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'

export default function RecordsScreen({ onNavigate, alertsOnly = false }) {
  const { setCurrentChild } = useApp()
  const [items, setItems] = useState([])
  const [healthMap, setHealthMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(alertsOnly ? 'Nutritional Watch' : 'All')

  // State for recording new health measurement modal
  const [activeChildForVitals, setActiveChildForVitals] = useState(null)
  const [vitalsForm, setVitalsForm] = useState({
    weight_kg: '',
    height_cm: '',
    muac_mm: '',
    head_circumference_cm: '',
    notes: '',
    measured_on: new Date().toISOString().split('T')[0]
  })
  const [savingVitals, setSavingVitals] = useState(false)
  const [vitalsError, setVitalsError] = useState('')
  const [vitalsSuccess, setVitalsSuccess] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const raw = typeof fn === 'function' ? await fn() : await fn
      const childrenList = Array.isArray(raw) ? raw : []
      setItems(childrenList)

      // Concurrently fetch latest health measurements for the cohort
      const healthPromises = childrenList.map(async (c) => {
        try {
          const mCall = childrenApi.healthHistory(c.id)
          const measurements = typeof mCall === 'function' ? await mCall(c.id) : await mCall
          if (Array.isArray(measurements) && measurements.length > 0) {
            // Sort by measured_on ascending, pick the latest
            const sorted = [...measurements].sort((a, b) => new Date(b.measured_on || b.created_at) - new Date(a.measured_on || a.created_at))
            return { id: c.id, latest: sorted[0] }
          }
          return { id: c.id, latest: null }
        } catch {
          return { id: c.id, latest: null }
        }
      })

      const healthResults = await Promise.all(healthPromises)
      const map = {}
      for (const res of healthResults) {
        map[res.id] = res.latest
      }
      setHealthMap(map)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate nutritional status from MUAC (mm)
  const getMuacStatus = (muac) => {
    if (!muac && muac !== 0) return { label: 'No MUAC', tone: 'neutral', isAtRisk: false }
    const num = Number(muac)
    if (num < 115) return { label: 'SAM (Severe Acute Malnutrition)', tone: 'high', isAtRisk: true }
    if (num < 125) return { label: 'MAM (Moderate Acute Malnutrition)', tone: 'moderate', isAtRisk: true }
    return { label: 'Normal Nutrition', tone: 'normal', isAtRisk: false }
  }

  const shown = useMemo(() => {
    return items.filter((c) => {
      const query = search.toLowerCase().trim()
      const match =
        !query ||
        c.name?.toLowerCase().includes(query) ||
        c.child_identifier?.toLowerCase().includes(query) ||
        c.guardian_name?.toLowerCase().includes(query)

      const latestHealth = healthMap[c.id]
      const muacStatus = getMuacStatus(latestHealth?.muac_mm)

      const matchesFilter =
        filter === 'All' ||
        (filter === 'Nutritional Watch' && (muacStatus.isAtRisk || c.latest_risk === 'RED' || c.latest_risk === 'YELLOW')) ||
        (filter === 'At Risk (Delays)' && c.latest_risk === 'RED') ||
        (filter === 'Moderate' && c.latest_risk === 'YELLOW') ||
        (filter === 'On Track' && (c.latest_risk === 'GREEN' || !c.latest_risk))

      return match && matchesFilter
    })
  }, [items, search, filter, healthMap])

  const selectChild = (child, destination = 'history') => {
    setCurrentChild(child)
    onNavigate?.(destination)
  }

  const openVitalsModal = (child) => {
    setActiveChildForVitals(child)
    setVitalsError('')
    setVitalsSuccess('')
    setVitalsForm({
      weight_kg: '',
      height_cm: '',
      muac_mm: '',
      head_circumference_cm: '',
      notes: '',
      measured_on: new Date().toISOString().split('T')[0]
    })
  }

  const handleSaveVitals = async (e) => {
    e.preventDefault()
    if (!activeChildForVitals) return
    setSavingVitals(true)
    setVitalsError('')

    try {
      const payload = {
        measured_on: vitalsForm.measured_on ? new Date(vitalsForm.measured_on).toISOString() : new Date().toISOString(),
        weight_kg: vitalsForm.weight_kg ? parseFloat(vitalsForm.weight_kg) : null,
        height_cm: vitalsForm.height_cm ? parseFloat(vitalsForm.height_cm) : null,
        muac_mm: vitalsForm.muac_mm ? parseFloat(vitalsForm.muac_mm) : null,
        head_circumference_cm: vitalsForm.head_circumference_cm ? parseFloat(vitalsForm.head_circumference_cm) : null,
        notes: vitalsForm.notes || null
      }

      const hdCall = childrenApi.healthData(activeChildForVitals.id, payload)
      const newEntry = typeof hdCall === 'function' ? await hdCall(activeChildForVitals.id, payload) : await hdCall
      
      // Update local health map immediately
      setHealthMap((prev) => ({
        ...prev,
        [activeChildForVitals.id]: newEntry
      }))

      setVitalsSuccess(`Anthropometric vitals recorded for ${activeChildForVitals.name}!`)
      setTimeout(() => {
        setActiveChildForVitals(null)
        setVitalsSuccess('')
      }, 1200)
    } catch (err) {
      setVitalsError(err.message || 'Failed to save health measurements.')
    } finally {
      setSavingVitals(false)
    }
  }

  // Summary counts
  const nutritionalAttentionCount = useMemo(() => {
    return items.filter((c) => {
      const h = healthMap[c.id]
      return getMuacStatus(h?.muac_mm).isAtRisk
    }).length
  }, [items, healthMap])

  return (
    <AppLayout
      active="records"
      onNavigate={onNavigate}
      backTo="dashboard"
      title={alertsOnly ? 'Priority Attention Cohort' : 'Child Health Records & Growth Registry'}
      subtitle={alertsOnly ? 'Children flagged with developmental delays and nutritional risks' : `${items.length} registered children · Longitudinal anthropometric monitoring`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
          >
            <Icon name="refresh" className="h-4 w-4 text-neutral-600" />
            <span>Refresh</span>
          </Button>
          {!alertsOnly && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate?.('register')}
            >
              <Icon name="plus" className="h-4 w-4" />
              <span>Register Child</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">

        {/* CLINICAL SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Total Registered</span>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{items.length}</p>
            <span className="text-[11px] text-neutral-400">Ward Cohort</span>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Nutritional Watch</span>
            <p className="mt-1 text-2xl font-bold text-red-800">{nutritionalAttentionCount}</p>
            <span className="text-[11px] text-red-600">SAM / MAM (MUAC &lt;125mm)</span>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Developmental Delays</span>
            <p className="mt-1 text-2xl font-bold text-amber-800">
              {items.filter(c => c.latest_risk === 'RED' || c.latest_risk === 'YELLOW').length}
            </p>
            <span className="text-[11px] text-amber-600">Flagged in RBSK screening</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">On Track / Healthy</span>
            <p className="mt-1 text-2xl font-bold text-emerald-800">
              {items.filter(c => c.latest_risk === 'GREEN').length}
            </p>
            <span className="text-[11px] text-emerald-600">Meeting all milestones</span>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="search"
              aria-label="Search children records"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by child name, ID, or guardian..."
              className="h-10 w-full rounded-lg border border-neutral-300 bg-neutral-50/50 pl-10 pr-4 text-xs sm:text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Nutritional Watch', 'At Risk (Delays)', 'Moderate', 'On Track'].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setFilter(x)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === x
                    ? 'bg-primary-800 text-white shadow-xs'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* RECORDS LIST CONTENT */}
        {loading ? (
          <LoadingState label="Loading child health records and growth measurements..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : shown.length === 0 ? (
          <EmptyState
            title="No records found"
            detail={search ? 'No child records match your search criteria.' : 'Enrol children to track nutritional growth and developmental milestones.'}
            icon="report"
            action={
              <Button onClick={() => onNavigate?.('register')}>
                <Icon name="plus" className="h-4 w-4" />
                <span>Register New Child</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {shown.map((child) => {
              const latestHealth = healthMap[child.id]
              const muac = getMuacStatus(latestHealth?.muac_mm)

              const delayTone =
                child.latest_risk === 'RED'
                  ? 'high'
                  : child.latest_risk === 'YELLOW'
                  ? 'moderate'
                  : child.latest_risk === 'GREEN'
                  ? 'normal'
                  : 'neutral'

              const delayLabel =
                child.latest_risk === 'RED'
                  ? 'High Risk Delay'
                  : child.latest_risk === 'YELLOW'
                  ? 'Moderate Delay'
                  : child.latest_risk === 'GREEN'
                  ? 'Milestones On Track'
                  : 'Screening Pending'

              return (
                <div
                  key={child.id}
                  className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card transition hover:border-neutral-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    
                    {/* Child Identity & Demographics */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-xs font-bold text-primary-800 border border-primary-100">
                        {child.name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-neutral-900 truncate">{child.name || 'Unnamed Child'}</h3>
                          <span className="text-xs text-neutral-500 font-medium">
                            · {child.age_months !== null && child.age_months !== undefined ? `${child.age_months}m` : 'Age not logged'}
                            {child.sex ? ` · ${child.sex}` : ''}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          ID: <span className="font-semibold text-neutral-700">{child.child_identifier || '—'}</span>
                          {' · '}
                          Guardian: <span className="font-semibold text-neutral-700">{child.guardian_name || '—'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Vitals Snapshot */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg border border-neutral-100 bg-neutral-50/70 p-2.5 text-xs sm:gap-4 sm:px-4">
                      <div>
                        <span className="block text-[10px] font-semibold text-neutral-400 uppercase">Weight</span>
                        <span className="font-bold text-neutral-800">
                          {latestHealth?.weight_kg ? `${latestHealth.weight_kg} kg` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold text-neutral-400 uppercase">Height</span>
                        <span className="font-bold text-neutral-800">
                          {latestHealth?.height_cm ? `${latestHealth.height_cm} cm` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold text-neutral-400 uppercase">MUAC</span>
                        <span className="font-bold text-neutral-800">
                          {latestHealth?.muac_mm ? `${latestHealth.muac_mm} mm` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badges & Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <BadgePill tone={delayTone} dot>
                        {delayLabel}
                      </BadgePill>

                      {latestHealth?.muac_mm ? (
                        <BadgePill tone={muac.tone} dot>
                          {muac.label}
                        </BadgePill>
                      ) : (
                        <BadgePill tone="neutral">
                          No Anthropometry
                        </BadgePill>
                      )}

                      <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openVitalsModal(child)}
                          title="Record Growth Measurements"
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" />
                          <span>Log Vitals</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => selectChild(child, 'history')}
                          title="View Full Medical & Growth History"
                        >
                          <span>Full History</span>
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => selectChild(child, 'screening')}
                        >
                          <Icon name="screening" className="h-3.5 w-3.5" />
                          <span>Screen</span>
                        </Button>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* QUICK RECORD VITALS MODAL */}
        {activeChildForVitals && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-elevation">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
                <div>
                  <h3 id="modal-title" className="text-base font-bold text-neutral-900">
                    Record Growth & Vitals Check
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Patient: <span className="font-semibold text-neutral-800">{activeChildForVitals.name}</span> (ID: {activeChildForVitals.child_identifier || '—'})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChildForVitals(null)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close modal"
                >
                  <Icon name="cross" className="h-4 w-4" />
                </button>
              </div>

              {vitalsSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon name="check" className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-emerald-800">{vitalsSuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleSaveVitals} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Measurement Date"
                      type="date"
                      required
                      value={vitalsForm.measured_on}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, measured_on: e.target.value })}
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="40"
                      placeholder="e.g. 9.4"
                      value={vitalsForm.weight_kg}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, weight_kg: e.target.value })}
                      helperText="Digital infant / beam scale"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Height / Length (cm)"
                      type="number"
                      step="0.1"
                      min="20"
                      max="140"
                      placeholder="e.g. 78.5"
                      value={vitalsForm.height_cm}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, height_cm: e.target.value })}
                      helperText="Infantometer or stadiometer"
                    />
                    <Input
                      label="MUAC (mm)"
                      type="number"
                      step="1"
                      min="50"
                      max="250"
                      placeholder="e.g. 128"
                      value={vitalsForm.muac_mm}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, muac_mm: e.target.value })}
                      helperText="Mid-upper arm circumference"
                    />
                  </div>

                  {/* Real-time MUAC Guidance Notice */}
                  {vitalsForm.muac_mm && (
                    <div className={`rounded-lg p-3 text-xs border ${
                      Number(vitalsForm.muac_mm) < 115
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : Number(vitalsForm.muac_mm) < 125
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      <span className="font-bold">
                        {Number(vitalsForm.muac_mm) < 115
                          ? 'RED FLAG: Severe Acute Malnutrition (SAM) < 115 mm'
                          : Number(vitalsForm.muac_mm) < 125
                          ? 'YELLOW ALERT: Moderate Acute Malnutrition (MAM) 115–124 mm'
                          : 'GREEN: Normal Nutritional Circumference ≥ 125 mm'}
                      </span>
                    </div>
                  )}

                  <Input
                    label="Head Circumference (cm)"
                    type="number"
                    step="0.1"
                    min="20"
                    max="60"
                    placeholder="e.g. 45.2 (Optional)"
                    value={vitalsForm.head_circumference_cm}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, head_circumference_cm: e.target.value })}
                  />

                  <Input
                    label="Caseworker Notes"
                    type="text"
                    placeholder="Observations on appetite, illness, or feeding..."
                    value={vitalsForm.notes}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                  />

                  {vitalsError && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200" role="alert">
                      {vitalsError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveChildForVitals(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={savingVitals}
                      disabled={savingVitals}
                    >
                      Save Growth Vitals
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}