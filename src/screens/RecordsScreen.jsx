import { useEffect, useMemo, useState } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Input from '../components/Input'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
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

      const healthPromises = childrenList.map(async (c) => {
        try {
          const mCall = childrenApi.healthHistory(c.id)
          const measurements = typeof mCall === 'function' ? await mCall(c.id) : await mCall
          if (Array.isArray(measurements) && measurements.length > 0) {
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

  const getMuacStatus = (muac) => {
    if (!muac && muac !== 0) return { label: 'No MUAC', tone: 'neutral', isAtRisk: false }
    const num = Number(muac)
    if (num < 115) return { label: 'SAM (<115mm)', tone: 'risk', isAtRisk: true }
    if (num < 125) return { label: 'MAM (115-124mm)', tone: 'followup', isAtRisk: true }
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
        (filter === 'At Risk' && c.latest_risk === 'RED') ||
        (filter === 'Follow Up' && c.latest_risk === 'YELLOW') ||
        (filter === 'Normal' && (c.latest_risk === 'GREEN' || !c.latest_risk))

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
      
      setHealthMap((prev) => ({
        ...prev,
        [activeChildForVitals.id]: newEntry
      }))

      setVitalsSuccess('Checkup recorded successfully!')
      setTimeout(() => {
        setActiveChildForVitals(null)
        setVitalsSuccess('')
      }, 1200)
    } catch (err) {
      setVitalsError(err.message || 'Failed to record health measurements.')
    } finally {
      setSavingVitals(false)
    }
  }

  return (
    <AppLayout
      active="more"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Health Records"
      subtitle="Nutritional anthropometry & growth tracking"
      actions={
        <Button variant="primary" size="sm" onClick={() => onNavigate?.('register')}>
          <Icon name="plus" className="h-4 w-4" />
          <span>Register Child</span>
        </Button>
      }
    >
      <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6660]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or guardian..."
              className="h-11 w-full rounded-xl border border-[#E5EBE7] bg-white pl-10 pr-4 text-xs sm:text-sm text-[#1A201E] placeholder:text-[#8E9C95] focus:border-[#1B4D3E] focus:outline-none transition shadow-2xs"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {['All', 'Nutritional Watch', 'At Risk', 'Follow Up', 'Normal'].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setFilter(x)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === x
                    ? 'bg-[#1B4D3E] text-white shadow-2xs'
                    : 'border border-[#E5EBE7] bg-white text-[#5A6660] hover:text-[#1A201E]'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* Records List Content */}
        {loading ? (
          <LoadingState label="Loading child health records..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : shown.length === 0 ? (
          <EmptyState
            title="No records found"
            detail={search ? 'No child records match your search criteria.' : 'Enrol children to track nutritional growth.'}
            icon="report"
            action={
              <Button variant="primary" onClick={() => onNavigate?.('register')}>
                <Icon name="plus" className="h-4 w-4 mr-1.5" />
                <span>Register Child</span>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {shown.map((child) => {
              const latestHealth = healthMap[child.id]
              const muac = getMuacStatus(latestHealth?.muac_mm)
              const ageDisplay = child.age_months !== null && child.age_months !== undefined
                ? `${Math.floor(child.age_months / 12)}y ${child.age_months % 12}m`
                : '—'

              return (
                <div
                  key={child.id}
                  className="rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs space-y-3 transition hover:border-[#1B4D3E]/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
                        {child.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#1A201E]">{child.name}</h4>
                          <span className="text-xs text-[#5A6660]">· {ageDisplay}</span>
                        </div>
                        <p className="text-xs text-[#5A6660]">
                          ID: {child.child_identifier || '—'} · Guardian: {child.guardian_name || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {child.latest_risk && (
                        <BadgePill tone={child.latest_risk === 'RED' ? 'risk' : child.latest_risk === 'YELLOW' ? 'followup' : 'normal'}>
                          {child.latest_risk === 'RED' ? 'At Risk' : child.latest_risk === 'YELLOW' ? 'Follow Up' : 'Normal'}
                        </BadgePill>
                      )}
                      <BadgePill tone={muac.tone}>
                        {muac.label}
                      </BadgePill>
                    </div>
                  </div>

                  {/* Vitals row & actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#F0F4F2]">
                    <div className="flex items-center gap-4 text-xs text-[#5A6660]">
                      <span>Weight: <strong className="text-[#1A201E]">{latestHealth?.weight_kg ? `${latestHealth.weight_kg} kg` : '—'}</strong></span>
                      <span>Height: <strong className="text-[#1A201E]">{latestHealth?.height_cm ? `${latestHealth.height_cm} cm` : '—'}</strong></span>
                      <span>MUAC: <strong className="text-[#1A201E]">{latestHealth?.muac_mm ? `${latestHealth.muac_mm} mm` : '—'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openVitalsModal(child)}>
                        Log Vitals
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => selectChild(child, 'history')}>
                        History
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => selectChild(child, 'screening')}>
                        Screen
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal for recording vitals */}
        {activeChildForVitals && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5EBE7] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1A201E]">Record Growth & Vitals</h3>
                  <p className="text-xs text-[#5A6660]">{activeChildForVitals.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChildForVitals(null)}
                  className="text-sm font-bold text-[#8E9C95] hover:text-[#1A201E]"
                >
                  ✕
                </button>
              </div>

              {vitalsSuccess ? (
                <div className="py-6 text-center text-sm font-semibold text-[#2D7A58]">
                  {vitalsSuccess}
                </div>
              ) : (
                <form onSubmit={handleSaveVitals} className="space-y-3.5">
                  <Input
                    label="Measurement Date"
                    type="date"
                    required
                    value={vitalsForm.measured_on}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, measured_on: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Weight (kg)"
                      type="number"
                      step="0.05"
                      placeholder="e.g. 9.4"
                      value={vitalsForm.weight_kg}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, weight_kg: e.target.value })}
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 78.5"
                      value={vitalsForm.height_cm}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, height_cm: e.target.value })}
                    />
                  </div>
                  <Input
                    label="MUAC (mm)"
                    type="number"
                    step="1"
                    placeholder="e.g. 128"
                    value={vitalsForm.muac_mm}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, muac_mm: e.target.value })}
                  />
                  <Input
                    label="Notes (Optional)"
                    type="text"
                    placeholder="Appetite, illness, remarks..."
                    value={vitalsForm.notes}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, notes: e.target.value })}
                  />

                  {vitalsError && (
                    <div className="rounded-xl bg-[#FDF0EB] p-2.5 text-xs text-[#D96B43]">
                      {vitalsError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E5EBE7]">
                    <Button type="button" variant="secondary" onClick={() => setActiveChildForVitals(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={savingVitals}>
                      Save Vitals
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