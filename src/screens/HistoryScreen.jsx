import { useEffect, useState } from 'react'
import { childrenApi } from '../services/api'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Input from '../components/Input'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

export default function HistoryScreen({ onNavigate }) {
  const { currentChild, setCurrentChild } = useApp()
  const [history, setHistory] = useState(null)
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  // Cohort state for child selection precondition
  const [cohort, setCohort] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [cohortSearch, setCohortSearch] = useState('')

  useEffect(() => {
    if (!currentChild) {
      setLoadingCohort(true)
      const fetchCohort = async () => {
        try {
          const fn = childrenApi.list()
          const res = typeof fn === 'function' ? await fn() : await fn
          setCohort(Array.isArray(res) ? res : [])
        } catch {
          setCohort([])
        } finally {
          setLoadingCohort(false)
        }
      }
      fetchCohort()
    }
  }, [currentChild])

  const filteredCohort = (cohort || []).filter((c) => {
    const q = cohortSearch.toLowerCase().trim()
    if (!q) return true
    return (
      c.name?.toLowerCase().includes(q) ||
      c.child_identifier?.toLowerCase().includes(q) ||
      c.guardian_name?.toLowerCase().includes(q)
    )
  })

  // Vitals entry modal state
  const [showVitalsModal, setShowVitalsModal] = useState(false)
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

  const loadHistory = async () => {
    if (!currentChild) return
    setError(null)
    try {
      const hCall = childrenApi.history(currentChild.id)
      const mCall = childrenApi.healthHistory(currentChild.id)
      const [h, measurements] = await Promise.all([
        typeof hCall === 'function' ? hCall(currentChild.id) : hCall,
        typeof mCall === 'function' ? mCall(currentChild.id) : mCall
      ])
      setHistory(h && typeof h === 'object' ? h : null)
      setHealth(Array.isArray(measurements) ? measurements : [])
    } catch (e) {
      setError(e)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [currentChild?.id])

  const handleSaveVitals = async (e) => {
    e.preventDefault()
    if (!currentChild) return
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

      const hdCall = childrenApi.healthData(currentChild.id, payload)
      const newEntry = typeof hdCall === 'function' ? await hdCall(currentChild.id, payload) : await hdCall
      setHealth((prev) => [...(prev || []), newEntry])
      setVitalsSuccess('New anthropometric checkup recorded successfully!')

      setTimeout(() => {
        setShowVitalsModal(false)
        setVitalsSuccess('')
        setVitalsForm({
          weight_kg: '',
          height_cm: '',
          muac_mm: '',
          head_circumference_cm: '',
          notes: '',
          measured_on: new Date().toISOString().split('T')[0]
        })
      }, 1200)
    } catch (err) {
      setVitalsError(err.message || 'Failed to record health measurements.')
    } finally {
      setSavingVitals(false)
    }
  }

  // PRECONDITION STATE: When opened without a selected child
  if (!currentChild) {
    return (
      <AppLayout
        active="children"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Child Medical History"
        subtitle="Longitudinal screening records, anthropometric growth, and clinical timeline"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('register')}
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Register Child</span>
          </Button>
        }
      >
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* HEADER BANNER */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 ring-1 ring-inset ring-teal-700/10">
                    <Icon name="calendar" className="h-3.5 w-3.5" />
                    Longitudinal Child Records
                  </span>
                  <span className="text-xs text-neutral-400">
                    RBSK Growth & Milestone Surveillance
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                  Child Medical & Screening History
                </h1>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm max-w-2xl leading-relaxed">
                  Track individual child development over time. Review historical milestone checklists,
                  monitor weight/height/MUAC growth curves, and verify referral status.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => onNavigate?.('register')}
                className="shrink-0"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span>+ Register New Child</span>
              </Button>
            </div>
          </section>

          {/* CHILD SELECTION AREA */}
          <Card
            title="Select Child to View Medical History"
            subtitle={`${cohort.length} children enrolled in your assigned centre`}
          >
            {cohort.length > 0 && (
              <div className="mb-4 relative max-w-md">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="search"
                  value={cohortSearch}
                  onChange={(e) => setCohortSearch(e.target.value)}
                  placeholder="Filter by child name, ID, or guardian..."
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-neutral-50/50 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white"
                />
              </div>
            )}

            {loadingCohort ? (
              <LoadingState label="Loading ward child cohort records..." />
            ) : cohort.length === 0 ? (
              <EmptyState
                title="No children registered yet"
                detail="Longitudinal developmental and growth tracking requires registered children. Enrol children to monitor milestone progression over time."
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
            ) : filteredCohort.length === 0 ? (
              <EmptyState
                title="No matching children found"
                detail="No children match your search query. Clear search to view all enrolled children."
                icon="search"
                action={
                  <Button variant="secondary" size="sm" onClick={() => setCohortSearch('')}>
                    Clear Filter
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCohort.map((child) => (
                  <div
                    key={child.id}
                    className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card hover:border-neutral-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 font-bold text-xs text-primary-800">
                            {child.name?.charAt(0) || 'C'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-neutral-900 truncate">
                              {child.name || 'Unnamed Child'}
                            </h4>
                            <p className="text-[11px] text-neutral-500">
                              {child.age_months !== null && child.age_months !== undefined
                                ? `${child.age_months}m`
                                : 'Age not logged'}
                              {child.sex ? ` · ${child.sex}` : ''}
                            </p>
                          </div>
                        </div>

                        <BadgePill
                          tone={
                            child.latest_risk === 'RED'
                              ? 'high'
                              : child.latest_risk === 'YELLOW'
                              ? 'moderate'
                              : child.latest_risk === 'GREEN'
                              ? 'normal'
                              : 'neutral'
                          }
                          dot
                        >
                          {child.latest_risk === 'RED'
                            ? 'High Risk'
                            : child.latest_risk === 'YELLOW'
                            ? 'Moderate'
                            : child.latest_risk === 'GREEN'
                            ? 'On Track'
                            : 'Not Screened'}
                        </BadgePill>
                      </div>

                      <div className="mt-3 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 space-y-0.5">
                        <p>
                          <span className="text-neutral-400">ID:</span>{' '}
                          <span className="font-medium text-neutral-700">{child.child_identifier || '—'}</span>
                        </p>
                        <p className="truncate">
                          <span className="text-neutral-400">Guardian:</span>{' '}
                          <span className="font-medium text-neutral-700">{child.guardian_name || '—'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-neutral-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setCurrentChild(child)}
                      >
                        <Icon name="calendar" className="h-3.5 w-3.5 mr-1 text-primary-800" />
                        <span>View Medical Record</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* LONGITUDINAL PROTOCOL INFO */}
          <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-800">
                <Icon name="info" className="h-4 w-4" />
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed">
                <h4 className="font-bold text-neutral-900">Longitudinal Health Surveillance Guidelines</h4>
                <p className="mt-1">
                  Children under 5 should undergo milestone screening at scheduled intervals (6, 9, 12, 18, 24, 36, 48, 60 months).
                  Monthly anthropometric measurements (weight, height, and Mid-Upper Arm Circumference) are recorded to identify growth faltering and Moderate or Severe Acute Malnutrition (MAM/SAM).
                </p>
              </div>
            </div>
          </section>

        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout
        active="children"
        onNavigate={onNavigate}
        title="Child Medical History"
      >
        <div className="mx-auto max-w-lg p-6">
          <ErrorState error={error} onRetry={loadHistory} />
        </div>
      </AppLayout>
    )
  }

  if (!history || !health) {
    return (
      <AppLayout
        active="children"
        onNavigate={onNavigate}
        title="Child Medical History"
      >
        <LoadingState label={`Retrieving longitudinal records for ${currentChild?.name || 'child'}...`} />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="children"
      onNavigate={onNavigate}
      backTo="children"
      title="Longitudinal Child Record"
      subtitle={`${currentChild?.name || 'Child'} · Clinical Developmental History`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowVitalsModal(true)}
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Log Growth Vitals</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('screening')}
          >
            <Icon name="screening" className="h-4 w-4" />
            <span>New Screening</span>
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* CHILD PATIENT IDENTITY CARD */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-800 text-sm font-bold text-white shadow-xs">
                {currentChild?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-neutral-900">{currentChild?.name || 'Child'}</h2>
                  <BadgePill tone="teal">{currentChild?.age_months ?? '—'} Months</BadgePill>
                  {currentChild?.sex && (
                    <span className="text-xs text-neutral-500 font-medium">{currentChild.sex}</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ID: <span className="font-semibold text-neutral-700">{currentChild.child_identifier || 'AW-04821'}</span>
                  {' · '}
                  Guardian: <span className="font-semibold text-neutral-700">{currentChild.guardian_name || 'Primary Caregiver'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVitalsModal(true)}
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                <span>Add Measurements</span>
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={() => onNavigate('screening')}
              >
                <Icon name="screening" className="h-4 w-4" />
                <span>Start Milestone Screening</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ANTHROPOMETRIC MEASUREMENTS TABLE */}
        <Card
          title="Growth & Anthropometric Measurements"
          subtitle="Physical development and nutritional monitoring history"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVitalsModal(true)}
            >
              <Icon name="plus" className="h-3.5 w-3.5 text-neutral-600" />
              <span>Record Vitals</span>
            </Button>
          }
        >
          {health.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Weight (kg)</th>
                    <th className="py-2.5 px-3">Height (cm)</th>
                    <th className="py-2.5 px-3">MUAC (mm)</th>
                    <th className="py-2.5 px-3">Nutritional Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {health.slice(-8).reverse().map((entry) => {
                    const muacTone =
                      entry.muac_mm && entry.muac_mm < 115
                        ? 'high'
                        : entry.muac_mm && entry.muac_mm < 125
                        ? 'moderate'
                        : 'normal'

                    const muacStatus =
                      entry.muac_mm && entry.muac_mm < 115
                        ? 'SAM (Severe Acute Malnutrition)'
                        : entry.muac_mm && entry.muac_mm < 125
                        ? 'MAM (Moderate Acute Malnutrition)'
                        : entry.muac_mm
                        ? 'Normal Nutrition'
                        : 'Not Measured'

                    return (
                      <tr key={entry.id || entry.measured_on} className="hover:bg-neutral-50/60">
                        <td className="py-3 px-3 font-semibold text-neutral-800">
                          {new Date(entry.measured_on).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-3 text-neutral-700">{entry.weight_kg ?? '—'} kg</td>
                        <td className="py-3 px-3 text-neutral-700">{entry.height_cm ?? '—'} cm</td>
                        <td className="py-3 px-3 text-neutral-700">{entry.muac_mm ?? '—'} mm</td>
                        <td className="py-3 px-3">
                          <BadgePill tone={muacTone} dot>
                            {muacStatus}
                          </BadgePill>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-neutral-500">
                No physical growth measurements recorded for this child yet.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowVitalsModal(true)}
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                <span>Log First Measurement</span>
              </Button>
            </div>
          )}
        </Card>

        {/* SCREENING TIMELINE */}
        <Card
          title="Developmental Milestone Screenings"
          subtitle="Chronological audit of completed developmental assessments"
        >
          {history.screenings?.length ? (
            <div className="divide-y divide-neutral-100">
              {history.screenings.map((sc) => {
                const tone =
                  sc.risk_level === 'RED'
                    ? 'high'
                    : sc.risk_level === 'YELLOW'
                    ? 'moderate'
                    : 'normal'

                const label =
                  sc.risk_level === 'RED'
                    ? 'High Developmental Risk'
                    : sc.risk_level === 'YELLOW'
                    ? 'Moderate Delay'
                    : 'On Track'

                return (
                  <div
                    key={sc.screening_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600">
                        <Icon name="screening" className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-neutral-900">
                            {new Date(sc.screened_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <span className="text-[11px] text-neutral-400">· ID: {sc.screening_id}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Missed developmental weight: {sc.total_missed_weight ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <BadgePill tone={tone} dot>
                        {label}
                      </BadgePill>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-3">
              No previous developmental screenings completed for this child record.
            </p>
          )}
        </Card>

      </div>

      {/* RECORD VITALS MODAL */}
      {showVitalsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vitals-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-elevation">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div>
                <h3 id="vitals-modal-title" className="text-base font-bold text-neutral-900">
                  Log Growth & Vitals Check
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Patient: <span className="font-semibold text-neutral-800">{currentChild.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVitalsModal(false)}
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
                  />
                </div>

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
                        ? 'Severe Acute Malnutrition (SAM) < 115 mm'
                        : Number(vitalsForm.muac_mm) < 125
                        ? 'Moderate Acute Malnutrition (MAM) 115–124 mm'
                        : 'Normal Nutritional Status ≥ 125 mm'}
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
                  placeholder="Appetite test notes, illness history..."
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
                    onClick={() => setShowVitalsModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={savingVitals}
                    disabled={savingVitals}
                  >
                    Save Measurements
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}