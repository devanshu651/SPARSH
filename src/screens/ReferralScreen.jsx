import { useState, useEffect } from 'react'
import { referralsApi, childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import Card from '../components/Card'
import Select from '../components/Select'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
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

  // Direct access support: list of RED flagged children in cohort
  const [atRiskChildren, setAtRiskChildren] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState(currentChild?.id || '')
  const [resolvedScreeningId, setResolvedScreeningId] = useState(
    screeningResult?.risk_level === 'RED' ? screeningResult?.screening_id || '' : ''
  )

  useEffect(() => {
    // If we already have a RED screeningResult in context, use it directly
    if (screeningResult?.screening_id && screeningResult?.risk_level === 'RED') {
      setResolvedScreeningId(screeningResult.screening_id)
      if (currentChild?.id) setSelectedChildId(currentChild.id)
      return
    }

    // Otherwise load at-risk children from the cohort
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
        // Fallback gracefully
      } finally {
        setLoadingCohort(false)
      }
    }

    loadAtRiskCohort()
  }, [screeningResult?.screening_id, screeningResult?.risk_level])

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
    const sId = (screeningResult?.risk_level === 'RED' && screeningResult?.screening_id) || resolvedScreeningId
    if (sId) {
      checkExisting(sId)
    }
  }, [screeningResult?.screening_id, screeningResult?.risk_level, resolvedScreeningId])

  const resolveChildScreening = async (childId) => {
    try {
      const hCall = childrenApi.history(childId)
      const history = typeof hCall === 'function' ? await hCall(childId) : await hCall
      if (history?.screenings?.length > 0) {
        const redScreenings = history.screenings.filter((s) => s.risk_level === 'RED')
        const target = redScreenings.length > 0 ? redScreenings[redScreenings.length - 1] : history.screenings[history.screenings.length - 1]
        setResolvedScreeningId(target.screening_id)
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
    const targetScreeningId = (screeningResult?.risk_level === 'RED' && screeningResult?.screening_id) || resolvedScreeningId
    if (!targetScreeningId) {
      setError('A valid RED risk screening ID is required to generate a formal RBSK referral.')
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

  const isEligibleRed = (screeningResult?.risk_level === 'RED') || (atRiskChildren.length > 0) || Boolean(resolvedScreeningId)

  // Handle case where no RED screening exists and no RED children in cohort
  if (!isEligibleRed && !loadingCohort) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="DEIC Referral Escalation (RBSK Form 3A)"
        subtitle="National Health Mission · District Early Intervention Centre Specialized Care"
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate?.('screening')}
          >
            <Icon name="screening" className="h-4 w-4" />
            <span>Screening</span>
          </Button>
        }
      >
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* REFERRAL PROTOCOL HEADER BANNER */}
          <section className="rounded-xl border border-primary-900/10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-5 text-white shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-400/30">
                    <Icon name="hospital" className="h-3.5 w-3.5" />
                    Specialist Escalation
                  </span>
                  <span className="text-xs text-primary-200">
                    RBSK Form 3A Protocol
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  DEIC Referral Escalation
                </h1>
                <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-2xl leading-relaxed">
                  Formal medical handover to District Early Intervention Centres (DEIC) for specialized pediatric,
                  audiometric, and neuromotor evaluation of infants flagged with severe developmental delay.
                </p>
              </div>

              <Button
                variant="teal"
                onClick={() => onNavigate?.('screening')}
                className="shrink-0"
              >
                <Icon name="screening" className="h-4 w-4" />
                <span>+ Start Screening</span>
              </Button>
            </div>
          </section>

          {/* EMPTY ELIGIBLE CASES STATE */}
          <Card title="Referral Case Triage" subtitle="Active ward high-risk surveillance">
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon name="checkCircle" className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-neutral-900">
                No High-Risk (RED) Referrals Pending
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-lg mx-auto leading-relaxed">
                Referral generation (RBSK Form 3A) is reserved for children categorized with High Risk developmental delays or acute sensory impairments.
                All screened children in your ward cohort are currently meeting developmental milestones or undergoing routine community watch.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => onNavigate?.('screening')}
                >
                  <Icon name="screening" className="h-4 w-4" />
                  <span>Screen Another Child</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onNavigate?.('children')}
                >
                  <Icon name="children" className="h-4 w-4" />
                  <span>Browse Cohort Directory</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </Card>

          {/* REFERRAL PATHWAY SPECIFICATION */}
          <Card title="National Health Mission DEIC Referral Protocol" subtitle="Mandatory operational guidelines">
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-4">
                <span className="font-bold text-neutral-900 block mb-1">1. Referral Threshold</span>
                <p className="text-neutral-600 leading-relaxed">
                  Infants failing 3 or more milestones across Gross Motor, Fine Motor, Language, or Cognitive domains, or failing sensory tests.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-4">
                <span className="font-bold text-neutral-900 block mb-1">2. Target Facilities</span>
                <p className="text-neutral-600 leading-relaxed">
                  District Civil Hospital DEIC, Pediatric Neurology clinics, or Government Medical College Early Intervention Units.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-4">
                <span className="font-bold text-neutral-900 block mb-1">3. Caregiver Handover</span>
                <p className="text-neutral-600 leading-relaxed">
                  Printed Form 3A slip contains unique screening reference, domain breakdown, and Anganwadi worker endorsement.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo={screeningResult ? 'report' : 'alerts'}
      title="DEIC Referral Escalation (RBSK Form 3A)"
      subtitle="National Health Mission Specialized Early Intervention Referral"
      actions={
        referralData && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            <Icon name="report" className="h-4 w-4 text-neutral-600" />
            <span>Print Official Slip</span>
          </Button>
        )
      }
    >
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">

        {loadingCohort ? (
          <LoadingState label="Verifying high-risk screening triage records..." />
        ) : (
          <>
            {/* CLINICAL TRIAGE NOTICE */}
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-100 text-red-700">
                  <Icon name="hospital" className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BadgePill tone="high" dot>
                      Urgent DEIC Referral Required
                    </BadgePill>
                    <span className="text-xs font-semibold text-neutral-500">
                      RBSK Protocol v2.4 · Form 3A
                    </span>
                  </div>

                  <h2 className="mt-1.5 text-base font-bold text-neutral-900">
                    Patient: {activePatient?.name || 'Screened Child'}
                  </h2>

                  <p className="text-xs text-neutral-600 mt-0.5">
                    Age: {activePatient?.age_months ?? '—'} months · ID: {activePatient?.child_identifier || '—'} · Guardian: {activePatient?.guardian_name || '—'}
                  </p>

                  <p className="mt-1 text-xs text-red-700 font-semibold">
                    Screening Reference: {(screeningResult?.risk_level === 'RED' && screeningResult?.screening_id) || resolvedScreeningId || 'Pending Triage'}
                  </p>
                </div>
              </div>
            </div>

            {/* CHILD SELECTOR IF NAVIGATED DIRECTLY */}
            {!screeningResult && atRiskChildren.length > 1 && !referralData && (
              <Card title="Select Patient for Referral" subtitle="Children categorized as High Risk (RED) in this ward">
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
              </Card>
            )}

            {/* REFERRAL CONFIRMATION SLIP OR ISSUANCE FORM */}
            {referralData ? (
              <Card className="p-6">
                <div className="text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon name="checkCircle" className="h-6 w-6" />
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-neutral-900">
                    Official DEIC Referral Slip Issued
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    National Child Health Screening Program · Referral Docket
                  </p>
                </div>

                {/* Formal RBSK Form 3A Docket */}
                <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Docket Number:</span>
                    <span className="font-bold text-neutral-900">{referralData.referral_id || `REF-${Date.now().toString().slice(-6)}`}</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Designated Facility:</span>
                    <span className="font-bold text-neutral-900 text-right max-w-xs">{facility}</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Patient Name:</span>
                    <span className="font-bold text-neutral-900">{activePatient?.name}</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Child Identifier:</span>
                    <span className="font-bold text-neutral-900">{activePatient?.child_identifier || 'AWW-CH-2025'}</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Primary Justification:</span>
                    <span className="font-semibold text-neutral-800 text-right max-w-xs">{reason}</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="text-neutral-500 font-sans font-semibold">Referring Worker:</span>
                    <span className="font-semibold text-neutral-800">{currentWorker?.name || 'Healthcare Worker'} (Centre: {currentWorker?.centre_ids?.[0] || 'Ward Sub-centre'})</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-sans font-semibold">Issuance Date:</span>
                    <span className="font-semibold text-neutral-800">
                      {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-teal-50 p-3 text-xs text-teal-800 border border-teal-200">
                  <span className="font-bold">Caregiver Guidance Instructions:</span>
                  <p className="mt-0.5 leading-relaxed">
                    Advise parent/caregiver to report to the District Early Intervention Centre (DEIC) within 7 business days. All diagnostic scans, occupational therapy, and speech evaluations are provided free of cost under the National Health Mission.
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  {screeningResult && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate?.('report')}
                    >
                      <span>← Return to Assessment Report</span>
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => onNavigate?.('history')}
                  >
                    <span>View Child Medical Record</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onNavigate?.('dashboard')}
                  >
                    <span>Return to Centre Dashboard</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card title="DEIC Facility Routing & Justification" subtitle="Select designated public intervention center and clinical findings">
                <form onSubmit={(e) => { e.preventDefault(); submitReferral(); }} className="space-y-4">
                  <Select
                    label="Designated Referral Facility"
                    required
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    helperText="Select the nearest DEIC with pediatric multi-disciplinary unit"
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
                    helperText="Diagnostic delay reason from developmental screening"
                  >
                    {referralReasons.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 border border-neutral-200">
                    <span className="font-bold text-neutral-800">Caregiver Advisory Notice:</span>
                    <p className="mt-0.5">
                      DEIC evaluations, audiology tests, physical therapy, and early sensory stimulation are covered under government health programs at zero cost to families.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onNavigate?.(screeningResult ? 'report' : 'dashboard')}
                    >
                      <span>Cancel</span>
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      className="flex-1"
                      disabled={saving}
                      loading={saving}
                    >
                      <Icon name="hospital" className="h-4 w-4" />
                      <span>Issue Official RBSK Referral Slip (Form 3A)</span>
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        )}

      </div>
    </AppLayout>
  )
}