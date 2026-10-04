import { useEffect, useState } from 'react'
import { referralsApi, childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Select from '../components/Select'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'

const facilities = [
  'District Early Intervention Centre (DEIC) - District Civil Hospital',
  'Sub-District Hospital (SDH) Pediatric Unit',
  'Community Health Centre (CHC) Specialized Child Clinic',
  'Tertiary Pediatric Medical College & Hospital'
]

const referralReasons = [
  'Developmental Delay: Multiple RBSK domain checkpoints missed',
  'Motor Impairment: Severe gross/fine motor developmental lag',
  'Sensory Observation: Auditory / visual pursuit concern noted',
  'Language & Speech: Significant communicative delay at age checkpoint',
  'Cognitive / Social: Persistent developmental milestones missed'
]

export default function ReferralScreen({ onNavigate }) {
  const { currentChild, setCurrentChild, screeningResult, currentWorker } = useApp()

  const [atRiskChildren, setAtRiskChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState(currentChild?.id || '')
  const [resolvedScreeningId, setResolvedScreeningId] = useState('')
  const [facility, setFacility] = useState(facilities[0])
  const [reason, setReason] = useState(referralReasons[0])
  const [notes, setNotes] = useState('')
  const [referralData, setReferralData] = useState(null)
  const [loadingCohort, setLoadingCohort] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      setLoadingCohort(true)
      setError(null)
      try {
        const fn = childrenApi.list()
        const raw = typeof fn === 'function' ? await fn() : await fn
        const children = Array.isArray(raw) ? raw : []

        if (!isMounted) return

        const redChildren = children.filter((c) => c.latest_risk === 'RED')
        setAtRiskChildren(redChildren)

        if (screeningResult?.risk_level === 'RED' && screeningResult?.screening_id) {
          setResolvedScreeningId(screeningResult.screening_id)
          if (currentChild?.id) setSelectedChildId(currentChild.id)
        } else if (redChildren.length > 0) {
          const defaultChild = (currentChild && redChildren.find((c) => c.id === currentChild.id)) || redChildren[0]
          setSelectedChildId(defaultChild.id)
          await loadScreeningIdForChild(defaultChild.id)
        }
      } catch (err) {
        if (isMounted) setError(err)
      } finally {
        if (isMounted) setLoadingCohort(false)
      }
    }

    init()
    return () => { isMounted = false }
  }, [screeningResult, currentChild])

  const loadScreeningIdForChild = async (childId) => {
    try {
      const hCall = childrenApi.history(childId)
      const h = typeof hCall === 'function' ? await hCall(childId) : await hCall
      if (h && Array.isArray(h.screenings) && h.screenings.length > 0) {
        const redScreening = h.screenings.find((s) => s.risk_level === 'RED') || h.screenings[0]
        setResolvedScreeningId(redScreening.screening_id)
      }
    } catch {
      // Best-effort history fetch
    }
  }

  const handleChildSelectChange = async (e) => {
    const cid = e.target.value
    setSelectedChildId(cid)
    const child = atRiskChildren.find((c) => c.id === cid)
    if (child) {
      setCurrentChild(child)
    }
    await loadScreeningIdForChild(cid)
  }

  const submitReferral = async () => {
    if (!facility) {
      setError('Please select a designated referral facility.')
      return
    }

    const scrId = resolvedScreeningId || screeningResult?.screening_id
    if (!scrId) {
      setError('No saved screening record found to attach to this referral.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        screening_id: scrId,
        facility_name: facility
      }

      const rCall = referralsApi.create(payload)
      const res = typeof rCall === 'function' ? await rCall(payload) : await rCall
      setReferralData(res)
    } catch (e) {
      setError(e.message || 'Failed to generate referral docket.')
    } finally {
      setSaving(false)
    }
  }

  const activePatient = screeningResult
    ? currentChild
    : atRiskChildren.find((c) => c.id === selectedChildId) || currentChild

  // Precondition: No child flagged as High Risk (RED)
  if (!loadingCohort && !screeningResult && atRiskChildren.length === 0) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Referral Records"
        subtitle="Child referral and follow-up support"
      >
        <div className="relative mx-auto max-w-xl p-6 text-center space-y-4">
          <SparshBotanicalCorner position="top-right" className="opacity-30" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E]">
            <Icon name="hospital" className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A201E]">No Referrals Pending</h2>
          <p className="text-xs text-[#5A6660] max-w-md mx-auto leading-relaxed">
            Referral records can be created for a child with a saved high risk screening result. All screened children in your ward cohort are currently meeting developmental milestones or undergoing routine community watch.
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
      subtitle="Specialized early intervention referral record"
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
                  High Risk Screening Result
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#1A201E]">
                Child: {activePatient?.name || 'Screened Child'}
              </h2>
              <p className="text-xs text-[#5A6660]">
                Age: {activePatient?.age_months ?? '—'} months · ID: {activePatient?.child_identifier || '—'} · Guardian: {activePatient?.guardian_name || '—'}
              </p>
              <p className="text-xs text-[#D96B43] font-medium pt-1">
                Screening Reference: {(screeningResult?.risk_level === 'RED' && screeningResult?.screening_id) || resolvedScreeningId || 'Pending Triage'}
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
                  <h3 className="text-base font-semibold text-[#1A201E]">Referral Record Saved</h3>
                  <p className="text-xs text-[#5A6660]">National Child Health Screening Program · Referral Docket</p>
                </div>

                <div className="rounded-xl border border-[#E5EBE7] bg-[#F9FBFA] p-4 text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Docket Number:</span>
                    <span className="font-bold text-[#1A201E]">{referralData.referral_id || 'Reference unavailable'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5EBE7] pb-2">
                    <span className="text-[#5A6660]">Designated Facility:</span>
                    <span className="font-semibold text-[#1A201E] text-right max-w-xs">{referralData.facility_name || facility}</span>
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
                    <span className="font-semibold text-[#1A201E]">{currentWorker?.name || 'Healthcare Worker'}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs text-teal-900 leading-relaxed">
                  <span className="font-bold">Caregiver Guidance: </span>
                  Review the referral details with the caregiver and follow the standard referral process used by your centre.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {screeningResult && (
                    <Button variant="outline" onClick={() => onNavigate?.('report')} className="flex-1">
                      Assessment Report
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => onNavigate?.('child-profile')} className="flex-1">
                    Child Profile
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
                      {typeof error === 'string' ? error : error?.message || 'Failed to submit referral'}
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
                      Save Referral Record
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
