import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import { ErrorState, LoadingState } from '../components/AsyncState'
import { assistantApi, childrenApi, referralsApi } from '../services/api'
import { useApp } from '../context/AppContext'

const domains = ['gross_motor', 'fine_motor', 'language', 'social_emotional', 'cognitive']
const label = (value) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const riskLabel = (level) => ({ GREEN: 'Follow-up threshold not reached', YELLOW: 'Review recommended', RED: 'Needs follow-up' }[level] || 'Unknown')

export default function ChildProfileScreen({ onNavigate }) {
  const { currentChild } = useApp()
  const [history, setHistory] = useState(null)
  const [referrals, setReferrals] = useState({})
  const [error, setError] = useState(null)
  const [assistantText, setAssistantText] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!currentChild) return
    let active = true
    const load = async () => {
      try {
        const data = await childrenApi.history(currentChild.id)
        if (!active) return
        const entries = [...(data?.screenings || [])].sort((a, b) => new Date(a.screened_at) - new Date(b.screened_at))
        setHistory(entries)
        const referralPairs = await Promise.all(entries.map(async (entry) => [
          entry.screening_id,
          await referralsApi.byScreening(entry.screening_id),
        ]))
        if (active) setReferrals(Object.fromEntries(referralPairs.filter(([, value]) => value)))
      } catch (err) { if (active) setError(err) }
    }
    load()
    return () => { active = false }
  }, [currentChild?.id])

  const trend = useMemo(() => (history || []).map((item, index) => {
    const row = { date: new Date(item.screened_at).toLocaleDateString(), screening: index + 1 }
    domains.forEach((domain) => {
      const score = item.domain_scores?.[domain]
      // Old records do not contain the denominator and are omitted from trend lines.
      row[domain] = score?.answered_count > 0 ? Math.round((score.missed_count / score.answered_count) * 100) : null
    })
    return row
  }), [history])

  const currentAgeMonths = currentChild.date_of_birth
    ? Math.max(0, Math.floor((Date.now() - new Date(currentChild.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30.4375)))
    : currentChild.age_months

  const explain = async (action) => {
    const latest = history?.at(-1)
    if (!latest) return
    setBusy(true); setAssistantText('')
    try {
      const answer = await assistantApi.respond({ screening_id: latest.screening_id, action, language: 'en' })
      setAssistantText(answer.text)
    } catch (err) { setAssistantText(err.message || 'Assistant is unavailable.') }
    finally { setBusy(false) }
  }

  if (!currentChild) return <AppLayout active="children" onNavigate={onNavigate} backTo="children" title="Child Development Profile"><div className="p-6">Select a child from the directory to view their profile.</div></AppLayout>
  if (error) return <AppLayout active="children" onNavigate={onNavigate} backTo="children" title="Child Development Profile"><ErrorState error={error} /></AppLayout>
  if (!history) return <AppLayout active="children" onNavigate={onNavigate} backTo="children" title="Child Development Profile"><LoadingState label="Loading screening history…" /></AppLayout>

  const latest = history.at(-1)
  return (
    <AppLayout active="children" onNavigate={onNavigate} backTo="children" title="Child Development Profile" subtitle="Screening and follow-up history">
      <main className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-xl font-bold">{currentChild.name}</h2><p className="text-sm text-neutral-600">ID: {currentChild.child_identifier} · {currentAgeMonths} months · {currentChild.sex || 'Sex not recorded'}</p><p className="mt-1 text-xs text-neutral-500">Anganwadi Centre: {currentChild.centre_name}</p></div>
            <Button variant="primary" onClick={() => { onNavigate?.('screening') }}>Start screening</Button>
          </div>
        </section>

        {latest ? <>
          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold">Latest screening</h2><BadgePill tone={latest.risk_level === 'RED' ? 'high' : latest.risk_level === 'YELLOW' ? 'moderate' : 'normal'}>{riskLabel(latest.risk_level)}</BadgePill></div>
            <p className="mt-1 text-xs text-neutral-500">{new Date(latest.screened_at).toLocaleString()} · {latest.checkpoint_age_months ?? '—'} month checkpoint</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(latest.domain_scores || {}).map(([domain, score]) => {
                const repeated = history.filter((entry) => entry.domain_scores?.[domain]?.status === 'WATCH').length
                return <article key={domain} className="rounded-lg bg-neutral-50 p-3"><h3 className="text-sm font-semibold">{label(domain)}</h3><p className="mt-1 text-xs text-neutral-600">{score.missed_count} responses marked “No” · {score.unsure_count} unsure</p><p className="text-xs font-semibold">{score.status === 'WATCH' ? 'Needs follow-up' : 'Follow-up threshold not reached'}</p>{repeated > 1 && <p className="mt-1 text-xs text-amber-800">Repeated follow-up indication in {repeated} recorded screenings</p>}</article>
              })}
            </div>
            {latest.red_flag_ids?.length > 0 && <p className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-900">Configured screening items require follow-up.</p>}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="font-bold">Responses marked “No”</h2>
            {latest.missed_milestones?.length ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">{latest.missed_milestones.map((item) => <li key={item.id}><span className="font-medium">{label(item.domain)}:</span> {item.text}</li>)}</ul> : latest.answers?.some((answer) => answer.response === 'NO') ? <p className="mt-2 text-sm text-neutral-600">The item text is unavailable for this screening record.</p> : <p className="mt-2 text-sm text-neutral-600">No responses were marked “No” in this screening.</p>}
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="font-bold">Screening trend</h2><span className="text-xs text-neutral-500">Missed responses as a share of answered items</span></div>
            {trend.some((row) => domains.some((domain) => row[domain] !== null)) ? <div className="mt-4 h-64 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="date"/><YAxis domain={[0, 100]} unit="%"/><Tooltip/><Line type="monotone" dataKey="gross_motor" name="Gross motor" stroke="#0f766e" connectNulls={false}/><Line type="monotone" dataKey="fine_motor" name="Fine motor" stroke="#2563eb" connectNulls={false}/><Line type="monotone" dataKey="language" name="Language" stroke="#9333ea" connectNulls={false}/><Line type="monotone" dataKey="social_emotional" name="Social-emotional" stroke="#ea580c" connectNulls={false}/><Line type="monotone" dataKey="cognitive" name="Cognitive" stroke="#db2777" connectNulls={false}/></LineChart></ResponsiveContainer></div> : <p className="mt-3 text-sm text-neutral-600">Trend data is unavailable for older records that do not store answered-item counts.</p>}
            <p className="mt-2 text-xs text-neutral-500">Changes between screenings are descriptive and do not establish a diagnosis.</p>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-5"><h2 className="font-bold">History and referrals</h2><ol className="mt-3 space-y-3">{[...history].reverse().map((item) => <li key={item.screening_id} className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-sm"><span>{new Date(item.screened_at).toLocaleDateString()} · {riskLabel(item.risk_level)} · {item.checkpoint_age_months ?? '—'} month checkpoint</span><span className="text-xs text-neutral-600">{referrals[item.screening_id] ? `Referral recorded: ${referrals[item.screening_id].facility_name}` : 'No referral record'}</span></li>)}</ol><p className="mt-3 text-xs text-neutral-500">The system does not currently store a separate follow-up completion status.</p></section>

          <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-5"><h2 className="font-bold text-teal-950">SPARSH Assistant</h2><p className="mt-1 text-xs text-teal-900">Grounded in this screening summary. It does not provide a diagnosis or make independent clinical decisions.</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={busy} onClick={() => explain('explain_result')}>Explain result</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => explain('explain_missed')}>Explain findings</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => explain('next_steps')}>Next steps</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => explain('parent_summary')}>Explain to parent</Button><Button size="sm" variant="secondary" disabled={busy} onClick={() => explain('history_summary')}>Summarize history</Button></div>{assistantText && <p role="status" className="mt-3 rounded-lg bg-white p-3 text-sm text-neutral-800">{assistantText}</p>}</section>
        </> : <section className="rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">No screening history is recorded for this child.</section>}
      </main>
    </AppLayout>
  )
}
