import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import Button from '../components/Button'
import { EmptyState } from '../components/AsyncState'

const colors = {
  GREEN: 'bg-emerald-100 text-emerald-800',
  YELLOW: 'bg-amber-100 text-amber-800',
  RED: 'bg-red-100 text-red-800',
}

export default function ReportScreen({ onNavigate }) {
  const { screeningResult, currentChild } = useApp()

  if (!screeningResult) {
    return (
      <main className="p-6">
        <EmptyState title="No report available" detail="Complete a screening to see its report." />
      </main>
    )
  }

  const chart = Object.entries(screeningResult.domain_scores).map(([domain, value]) => ({
    domain: domain.replace('_', ' '),
    score: Math.max(0, 100 - (value.missed_weight || 0) * 20),
  }))

  const isRed = screeningResult.risk_level === 'RED'

  return (
    <main className="min-h-screen bg-neutral-50 p-5 pb-24">
      <header className="mx-auto max-w-xl">
        <button className="text-sm font-bold text-primary-800" onClick={() => onNavigate('dashboard')}>
          ← Dashboard
        </button>
        <h1 className="mt-3 text-2xl font-extrabold">Screening report</h1>
        <p className="text-sm text-neutral-500">{currentChild?.name}</p>
      </header>

      <div className="mx-auto mt-5 max-w-xl space-y-4">
        <section className="rounded-2xl bg-white p-5 shadow-card">
          <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${colors[screeningResult.risk_level]}`}>
            {screeningResult.risk_level} RISK
          </span>
          <h2 className="mt-4 text-lg font-bold">{screeningResult.risk_label}</h2>
          <p className="mt-2 text-sm text-neutral-600">{screeningResult.recommendation}</p>

          {isRed && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-semibold text-red-800">High developmental risk identified</p>
              <p className="mt-1 text-xs text-red-700">
                A referral to a higher facility is recommended for further evaluation.
              </p>
              <Button variant="danger" className="mt-3 w-full" onClick={() => onNavigate('referral')}>
                Create Referral
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Domain profile</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <RadarChart data={chart}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <Radar dataKey="score" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="font-bold">Clinical notes</h2>
          <textarea
            className="mt-3 w-full rounded-xl border p-3 text-sm"
            rows="4"
            placeholder="Add observations for the child's follow-up record…"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Notes are currently local to this report; the API has not yet exposed a notes field.
          </p>
        </section>

        {!isRed && (
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="font-bold">Next steps</h2>
            <div className="mt-3 space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => onNavigate('history')}>
                View child history
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => onNavigate('dashboard')}>
                Return to dashboard
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}