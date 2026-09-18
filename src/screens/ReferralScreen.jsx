import { useEffect, useState } from 'react'
import { referralsApi } from '../services/api'
import { useApp } from '../context/AppContext'
import Button from '../components/Button'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import BadgePill from '../components/BadgePill'

const facilities = [
  'District Early Intervention Centre',
  'Community Health Centre',
  'Government Medical College',
]

const colors = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-red-100 text-red-800',
}

export default function ReferralScreen({ onNavigate }) {
  const { screeningResult } = useApp()
  const [facility, setFacility] = useState(facilities[0])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function checkExisting() {
      if (!screeningResult) {
        setLoading(false)
        return
      }
      try {
        const existing = await referralsApi.byScreening(screeningResult.screening_id)
        if (existing) {
          setReferral(existing)
        }
      } catch (e) {
        // Ignore 404 or network errors, just proceed to create
      } finally {
        setLoading(false)
      }
    }
    checkExisting()
  }, [screeningResult])

  const submit = async () => {
    if (!screeningResult || submitting) return
    setSubmitting(true)
    setError('')
    setStatus('')
    try {
      const r = await referralsApi.create({
        screening_id: screeningResult.screening_id,
        facility_name: facility,
      })
      setReferral(r)
      setStatus(`Referral ${r.referral_id} generated successfully.`)
    } catch (e) {
      if (e.status === 409 && e.message?.includes('already')) {
        // Referral already exists, try to fetch it
        try {
          const existing = await referralsApi.byScreening(screeningResult.screening_id)
          if (existing) {
            setReferral(existing)
            setStatus(`Referral ${existing.referral_id} already exists.`)
          }
        } catch {
          setError(e.message)
        }
      } else {
        setError(e.message)
      }
      setStatus('')
    } finally {
      setSubmitting(false)
    }
  }

  if (!screeningResult) {
    return null
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 p-5">
        <div className="mx-auto max-w-lg">
          <LoadingState label="Checking for existing referral…" />
        </div>
      </main>
    )
  }

  if (referral) {
    return (
      <main className="min-h-screen bg-neutral-50 p-5">
        <div className="mx-auto max-w-lg space-y-4">
          <button onClick={() => onNavigate('report')} className="text-sm font-bold text-primary-800">
            ← Report
          </button>

          <section className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-extrabold">Referral Created</h1>
              <BadgePill tone={referral.risk_level.toLowerCase()}>{referral.risk_level}</BadgePill>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{referral.risk_label}</p>

            <div className="mt-4 space-y-3 text-sm">
              <p><b>Referral ID:</b> {referral.referral_id}</p>
              <p><b>Child:</b> {referral.child_name} ({referral.child_identifier})</p>
              <p><b>Age:</b> {referral.age_months} months</p>
              <p><b>Facility:</b> {referral.facility_name}</p>
              <p><b>Referred by:</b> {referral.worker_name}</p>
              <p><b>Generated:</b> {new Date(referral.generated_at).toLocaleString()}</p>
            </div>

            {status && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{status}</p>}
          </section>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => onNavigate('report')}>
              Back to Report
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => onNavigate('history')}>
              View History
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-5">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-card">
        <button onClick={() => onNavigate('report')} className="text-sm font-bold text-primary-800">
          ← Report
        </button>
        <h1 className="mt-3 text-xl font-extrabold">Generate referral</h1>
        <p className="mt-2 text-sm text-neutral-600">{screeningResult.risk_label}</p>

        <label className="mt-5 block text-sm font-medium">
          Referral facility
          <select
            className="mt-2 min-h-11 w-full rounded-xl border p-2"
            value={facility}
            onChange={e => setFacility(e.target.value)}
          >
            {facilities.map(x => <option key={x}>{x}</option>)}
          </select>
        </label>

        {error && <p className="mt-3 text-sm text-risk-high">{error}</p>}
        {status && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{status}</p>}

        <Button disabled={submitting} className="mt-5 w-full" onClick={submit}>
          {submitting ? 'Generating…' : 'Generate referral'}
        </Button>
      </div>
    </main>
  )
}