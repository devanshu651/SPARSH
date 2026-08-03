import { useState } from 'react'
import BadgePill from '../components/BadgePill'
import BottomNav from '../components/BottomNav'
import Button from '../components/Button'
import Card from '../components/Card'

const metrics = [
  { value: '1,296', label: 'Children enrolled', tone: 'text-primary-800', symbol: '◉' },
  { value: '47', label: 'High-risk children', tone: 'text-risk-high', symbol: '!' },
  { value: '23', label: 'Due for screening', tone: 'text-risk-moderate', symbol: '◷' },
  { value: '198', label: 'Screened this month', tone: 'text-risk-normal', symbol: '✓' }
]

export default function HomeScreen({ onNavigate }) {
  const [notice, setNotice] = useState('')
  const navigate = (screen) => onNavigate?.(screen)
  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      <header className="bg-health-gradient text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10"><div><p className="text-sm text-white/75">Good morning,</p><h1 className="mt-0.5 text-xl font-bold">Sunita Devi <span className="font-medium text-white/70">· Anganwadi Worker</span></h1></div><button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg ring-1 ring-white/25" aria-label="Notifications">♧</button></div></header>
      <div className="mx-auto max-w-7xl px-4 pt-5 lg:px-10 lg:pt-8">
        <section className="rounded-card bg-health-gradient p-5 text-white shadow-floating"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-white/75">Ready for today&apos;s visits?</p><h2 className="mt-1 text-xl font-bold">Screen a child in minutes.</h2></div><Button onClick={() => navigate('register')} className="bg-white text-primary-800 shadow-none hover:bg-primary-50 focus:ring-white">+ Register child</Button></div></section>
        <section className="mt-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold text-neutral-900">Overview</h2><span className="text-xs font-medium text-neutral-500">Updated today</span></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="p-4"><div className={`grid h-8 w-8 place-items-center rounded-lg bg-neutral-50 text-sm font-extrabold ${metric.tone}`}>{metric.symbol}</div><p className={`mt-3 text-2xl font-extrabold ${metric.tone}`}>{metric.value}</p><p className="mt-1 text-xs font-medium leading-4 text-neutral-500">{metric.label}</p></Card>)}</div></section>
        <section className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
          <Card><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-neutral-900">Priority follow-ups</h2><p className="mt-1 text-sm text-neutral-500">Children requiring attention today</p></div><button type="button" className="text-sm font-bold text-primary-700">View all</button></div><div className="mt-4 divide-y divide-neutral-100"><FollowUp name="Meera Kumari" detail="18 months · Screening due today" tone="moderate" label="Follow-up" /><FollowUp name="Aarav Singh" detail="30 months · Growth check overdue" tone="high" label="High risk" /><FollowUp name="Riya Sharma" detail="12 months · Nutrition review" tone="normal" label="On track" /></div></Card>
          <Card><h2 className="text-base font-bold text-neutral-900">Today&apos;s progress</h2><p className="mt-1 text-sm text-neutral-500">Keep the momentum going.</p><div className="mt-6 flex items-end justify-between"><div><p className="text-3xl font-extrabold text-primary-800">3<span className="text-base text-neutral-400">/5</span></p><p className="mt-1 text-xs font-medium text-neutral-500">Screenings completed</p></div><span className="text-sm font-bold text-teal-600">60%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-50"><div className="h-full w-3/5 rounded-full bg-health-gradient" /></div><Button onClick={() => setNotice('Screening workflow will be connected next.')} variant="secondary" className="mt-6 w-full">Start new screening</Button>{notice && <p className="mt-3 text-center text-xs font-medium text-teal-700">{notice}</p>}</Card>
        </section>
      </div>
      <BottomNav onChange={navigate} />
    </main>
  )
}

function FollowUp({ name, detail, tone, label }) { return <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-bold text-neutral-800">{name}</p><p className="mt-0.5 text-xs text-neutral-500">{detail}</p></div><BadgePill tone={tone}>{label}</BadgePill></div> }