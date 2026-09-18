import { useEffect, useState } from 'react'
import { childrenApi, referralsApi } from '../services/api'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import Button from '../components/Button'
import { useApp } from '../context/AppContext'
import BadgePill from '../components/BadgePill'

export default function HistoryScreen({ onNavigate }) {
  const { currentChild } = useApp()
  const [history, setHistory] = useState(null)
  const [health, setHealth] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [error, setError] = useState(null)

  const load = async () => {
    if (!currentChild) return
    setError(null)
    try {
      const [h, measurements] = await Promise.all([
        childrenApi.history(currentChild.id),
        childrenApi.healthHistory(currentChild.id),
      ])
      setHistory(h)
      setHealth(measurements)

      // Fetch referrals for each screening
      if (h.screenings.length > 0) {
        const referralData = await Promise.all(
          h.screenings.map(async (s) => {
            try {
              const r = await referralsApi.byScreening(s.screening_id)
              return r
            } catch {
              return null
            }
          })
        )
        setReferrals(referralData.filter(Boolean))
      }
    } catch (e) {
      setError(e)
    }
  }

  useEffect(() => {
    load()
  }, [currentChild?.id])

  if (!currentChild) {
    return (
      <main className="p-6">
        <EmptyState title="No child selected" detail="Choose a child record first." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-5">
        <ErrorState error={error} onRetry={load} />
      </main>
    )
  }

  if (!history || !health) {
    return <LoadingState label="Loading child history…" />
  }

  return (
    <main className="min-h-screen bg-neutral-50 p-5">
      <div className="mx-auto max-w-lg">
        <button onClick={() => onNavigate('records')} className="text-sm font-bold text-primary-800">
          ← Child records
        </button>
        <h1 className="mt-3 text-2xl font-extrabold">{currentChild.name}</h1>
        <p className="text-sm text-neutral-500">
          {currentChild.age_months} months · {currentChild.child_identifier}
        </p>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Health measurements</h2>
          {health.length ? (
            <div className="mt-3 space-y-2">
              {health.slice(-3).reverse().map(x => (
                <p key={x.id} className="text-sm">
                  {x.measured_on}: {x.weight_kg ?? '—'} kg · {x.height_cm ?? '—'} cm · MUAC {x.muac_mm ?? '—'} mm
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No measurements recorded yet.</p>
          )}
        </section>

        <section className="mt-4 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Screening history</h2>
          {history.screenings.length ? (
            <div className="mt-3 space-y-3">
              {history.screenings.map((x, idx) => {
                const referral = referrals.find(r => r.screening_id === x.screening_id)
                return (
                  <div key={x.screening_id} className="rounded-xl bg-neutral-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <BadgePill tone={x.risk_level.toLowerCase()}>{x.risk_level}</BadgePill>
                      <span>{new Date(x.screened_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-600">Total missed weight: {x.total_missed_weight}</p>
                    {referral && (
                      <p className="mt-1 text-xs text-primary-700">
                        📋 Referral: {referral.referral_id} → {referral.facility_name}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">No screening history yet.</p>
          )}
        </section>

        {referrals.length > 0 && (
          <section className="mt-4 rounded-2xl bg-white p-5 shadow-card">
            <h2 className="font-bold">Referrals</h2>
            <div className="mt-3 space-y-3">
              {referrals.map(r => (
                <div key={r.referral_id} className="rounded-xl bg-primary-50 p-3 text-sm border border-primary-100">
                  <div className="flex items-center justify-between">
                    <BadgePill tone={r.risk_level.toLowerCase()}>{r.risk_level}</BadgePill>
                    <span className="text-xs text-primary-700">{r.referral_id}</span>
                  </div>
                  <p className="mt-1"><b>Facility:</b> {r.facility_name}</p>
                  <p className="text-xs text-neutral-600">Referred by {r.worker_name} on {new Date(r.generated_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => onNavigate('records')}>
            Back to Records
          </Button>
          <Button className="flex-1" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}