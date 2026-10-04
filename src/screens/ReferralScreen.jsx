import { useState, useEffect } from 'react'
import { referralsApi, childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import Select from '../components/Select'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { LoadingState } from '../components/AsyncState'

const facilities = [
  'District Early Intervention Centre (DEIC) — District Civil Hospital',
  'Sub-District Hospital / Community Health Centre (CHC) Pediatric Unit',
  'Government Medical College & Tertiary Care Hospital',
  'Primary Health Centre (PHC) Medical Officer Review'
]

const referralReasons = [
  'Severe multi-domain developmental delay identified under RBSK observation',
  'Gross motor & posture control failure (suspected cerebral palsy / motor delay)',
  'Suspected speech / auditory impairment requiring specialized audiometry',
  'Vision tracking deficit / suspected strabismus requiring pediatric ophthalmology',
  'Severe cognitive / social communication delay requiring developmental pediatrician'
]

export default function ReferralScreen({ onNavigate }) {
  const { screeningResult, currentChild, setCurrentChild, currentWorker } = useApp()
  const [facility, setFacility] = useState(facilities[0])
  const [reason, setReason] = useState(referralReasons[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [referralData, setReferralData] = useState(null)

  const [atRiskChildren, setAtRiskChildren] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState(currentChild?.id || '')
  const [resolvedScreeningId, setResolvedScreeningId] = useState(screeningResult?.screening_id || '')

  useEffect(() => {
    if (screeningResult?.screening_id) {
      setResolvedScreeningId(screeningResult.screening_id)
      if (currentChild?.id) setSelectedChildId(currentChild.id)
      return
    }

    const loadAtRiskCohort = async () => {
      setLoadingCohort(true)
      try {
        const fn = childrenApi.list()
        const raw = typeof fn === 'function' ? await fn() : await fn
        const list = Array.isArray(raw) ? raw : []
        const redList = list.filter((c) => c.latest_risk === 'RED')
        setAtRiskChildren(redList)

        if (redList.length > 0) {
          const first = currentChild?.latest_risk === 'RED' ? currentChild : redList[0]
          setSelectedChildId(first.id)
          setCurrentChild(first)
          resolveChildScreening(first.id)
        }
      } catch {
        // Fallback
      } finally {
        setLoadingCohort(false)
      }
    }

    loadAtRiskCohort()
  }, [screeningResult?.screening_id])

  useEffect(() => {
    const checkExisting = async (sId) => {
      if (!sId) return
      try {
        const rCall = referralsApi.byScreening(sId)
        const existing = typeof rCall === 'function' ? await rCall(sId) : await rCall
        if (existing) {
          setReferralData(existing)
        }
      } catch {
        // Proceed
      }
    }
    const sId = screeningResult?.screening_id || resolvedScreeningId
    if (sId) {
      checkExisting(sId)
    }
  }, [screeningResult?.screening_id, resolvedScreeningId])

  const resolveChildScreening = async (childId) => {
    try {
      const hCall = childrenApi.history(childId)
      const history = typeof hCall === 'function' ? await hCall(childId) : await hCall
      if (history?.screenings?.length > 0) {
        const latest = history.screenings[history.screenings.length - 1]
        setResolvedScreeningId(latest.screening_id)
      } else {
        setResolvedScreeningId(`SR-${childId.slice(-5).toUpperCase()}`)
      }
    } catch {
      setResolvedScreeningId(`SR-${Date.now().toString().slice(-5)}`)
    }
  }

  const handleChildSelectChange = (e) => {
    const childId = e.target.value
    setSelectedChildId(childId)
    const found = atRiskChildren.find((c) => c.id === childId)
    if (found) {
      setCurrentChild(found)
      resolveChildScreening(found.id)
    }
  }

  const activePatient = currentChild || atRiskChildren.find((c) => c.id === selectedChildId)

  const submitReferral = async () => {
    const targetScreeningId = resolvedScreeningId || screeningResult?.screening_id
    if (!targetScreeningId) {
      setError('A valid screening ID is required to generate a formal RBSK referral.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        screening_id: targetScreeningId,
        facility_name: facility,
        clinical_reason: reason
      }
      const refCall = referralsApi.create(payload)
      const response = typeof refCall === 'function' ? await refCall(payload) : await refCall
      setReferralData(response)
    } catch (e) {
      if (e?.status === 409 || e?.message?.includes('already')) {
        try {
          const rCall = referralsApi.byScreening(targetScreeningId)
          const existing = typeof rCall === 'function' ? await rCall(targetScreeningId) : await rCall
          if (existing) {
            setReferralData(existing)
            setError('')
            return
          }
        } catch {}
      }
      setError(e?.message || 'Failed to generate referral slip.')
    } finally {
      setSaving(false)
    }
  }

  // Handle case where no screening exists and no RED children in cohort
  if (!screeningResult && !loadingCohort && atRiskChildren.length === 0) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="DEIC Referral"
        subtitle="National Health Mission · District Early Intervention Centre"
      >
        <div className="relative mx-auto max-w-xl p-8 text-center space-y-4">
          <SparshBotanicalCorner position="top-right" className="opacity-30" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E]">
            <Icon name="checkCircle" className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A201E]">No High-Risk Referrals Pending</h2>
          <p className="text-xs text-[#5A6660] max-w-md mx-auto">
            Referral generation (RBSK Form 3A) is reserved for children categorized with High Risk developmental delays.
            All screened children in your active cohort are currently meeting developmental milestones.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="primary" onClick={() => onNavigate?.('screening')}>
              <Icon name="screening" className="h-4 w-4 mr-1.5" />
              <span>Start Screening</span>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate?.('children')}>
              <span>View Children</span>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo={screeningResult ? 'report' : 'alerts'}
      title="DEIC Referral"
      subtitle="RBSK Form 3A Specialized Early Intervention Referral"
      actions={
        referralData && (
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Icon name="report" className="h-4 w-4 text-[#1B4D3E]" />
            <span>Print Slip</span>
          </Button>
        )
      }
    >
      <div className="relative mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {loadingCohort ? (
          <LoadingState label="Verifying high-risk referral records..." />
        ) : (
          <>
            {/* Clinical Triage Notice */}
            <div className="rounded-2xl border border-[#F7D4C8] bg-[#FDF0EB] p-4 sm:p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <BadgePill tone="risk">
                  Urgent DEIC Referral Required
                </BadgePill>
                <span className="text-xs text-[#5A6660]">
                  RBSK Form 3A
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#1A201E]">
                Patient: {activePatient?.name || 'Screened Child'}
              </h2>
              <p className="text-xs text-[#5A6660]">
                Age: {activePatient?.age_months ?? '—'} months · ID: {activePatient?.child_identifier || '—'} · Guardian: {activePatient?.guardian_name || '—'}
              </p>
              <p className="text-xs text-[#D96B43] font-medium pt-1">
                Screening Ref: {resolvedScreeningId || screeningResult?.screening_id || 'Pending Triage'}
              </p>
            </div>

            {/* Child Selector if multiple at risk */}
            {!screeningResult && atRiskChildren.length > 1 && !referralData && (
              <div className="rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs">
                <Select
                  label="Select Flagged Child"
                  value={selectedChildId}
                  onChange={handleChildSelectChange}
                >
                  {atRiskChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.child_identifier || 'No ID'}) — {c.age_months ?? '—'} months
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Issued Docket or Form */}
            {referralData ? (
              <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                <div className="text-center space-y-1">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF2EE] text-[#1B4D3E]">
                    <Icon name="checkCircle" className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1A201E]">Official DEIC Referral Slip Issued</h3>
                  <p className="text-xs text-[#5A6660]">National Child Health Screening Program · Referral Docket</p>
                </div>

                <div className="rounded-xl border border-[#E5EBE7] bg-[#F9FBFA] p-4 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Docket Number:</span>
                    <span className="font-bold text-[#1A201E]">{referralData.referral_id || `REF-${Date.now().toString().slice(-6)}`}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Designated Facility:</span>
                    <span className="font-semibold text-[#1A201E] text-right max-w-xs">{facility}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Patient Name:</span>
                    <span className="font-bold text-[#1A201E]">{activePatient?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Primary Justification:</span>
                    <span className="font-semibold text-[#1A201E] text-right max-w-xs">{reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5A6660]">Referring Worker:</span>
                    <span className="font-semibold text-[#1A201E]">{currentWorker?.name || 'Anita'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button variant="secondary" onClick={() => onNavigate?.('history')} className="flex-1">
                    Child Record
                  </Button>
                  <Button variant="primary" onClick={() => onNavigate?.('dashboard')} className="flex-1">
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-semibold text-[#1A201E]">DEIC Facility Routing</h3>

                <form onSubmit={(e) => { e.preventDefault(); submitReferral(); }} className="space-y-4">
                  <Select
                    label="Designated Referral Facility"
                    required
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                  >
                    {facilities.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Select>

                  <Select
                    label="Primary Clinical Justification"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {referralReasons.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>

                  {error && (
                    <div className="rounded-xl bg-[#FDF0EB] p-3 text-xs text-[#D96B43] border border-[#F7D4C8]">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-[#E5EBE7]">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onNavigate?.(screeningResult ? 'report' : 'dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1 bg-[#1B4D3E]"
                      disabled={saving}
                      loading={saving}
                    >
                      Issue Official RBSK Referral (Form 3A)
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}