import { useApp } from '../context/AppContext'
import BottomNav from '../components/BottomNav'

const metrics = [
  {
    value: '1,284',
    label: 'Children Screened',
    sub: '+12 today',
    icon: '◉',
    type: 'blue',
  },
  {
    value: '47',
    label: 'At-Risk Cases',
    sub: 'Needs attention',
    icon: '!',
    type: 'red',
  },
  {
    value: '23',
    label: 'Referrals Sent',
    sub: 'This month',
    icon: '➤',
    type: 'orange',
  },
  {
    value: '198',
    label: 'Recovered',
    sub: '+8 this week',
    icon: '✓',
    type: 'green',
  },
]

const followUps = [
  {
    name: 'Meera Kumari',
    detail: '18 months · Screening due today',
    status: 'Follow-up',
    type: 'orange',
  },
  {
    name: 'Aarav Singh',
    detail: '30 months · Growth check overdue',
    status: 'High risk',
    type: 'red',
  },
  {
    name: 'Riya Sharma',
    detail: '12 months · Nutrition review',
    status: 'On track',
    type: 'green',
  },
]

export default function HomeScreen({ onNavigate }) {
  const { currentWorker } = useApp()

  const navigate = (screen) => {
    onNavigate?.(screen)
  }

  const workerName = currentWorker?.name || 'Health Worker'
  const isAdmin = currentWorker?.role === 'admin'

  return (
    <main className="min-h-screen bg-[#f5f8fc] pb-20 text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="bg-gradient-to-r from-[#244b91] to-[#159b91] text-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/70">
                Good morning ☀️
              </p>

              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                {workerName}
              </h1>

              <p className="mt-0.5 text-xs text-white/70">
                Anganwadi Worker · Ward 4
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('alerts')}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm ring-1 ring-white/20 hover:bg-white/20"
                aria-label="Alerts"
              >
                🔔
              </button>

              <button
                type="button"
                onClick={() => navigate('settings')}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm ring-1 ring-white/20 hover:bg-white/20"
                aria-label="Settings"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* HERO */}
        <section className="mt-5 rounded-2xl bg-gradient-to-r from-[#2450a5] to-[#159b91] px-5 py-6 text-white shadow-lg sm:px-7 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold tracking-wide ring-1 ring-white/20">
                ● Centre active today
              </span>

              <h2 className="mt-3 max-w-md text-2xl font-extrabold leading-tight sm:text-3xl">
                Screen children.
                <br />
                Track their growth.
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-5 text-white/75">
                Monitor development, identify risks early and keep today's
                screenings on track.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('register')}
              className="w-full rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#2450a5] shadow-md transition hover:scale-[1.02] sm:w-auto"
            >
              + Register New Child
            </button>
          </div>
        </section>

        {/* ================= OVERVIEW ================= */}
        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#159b91]">
                Your centre
              </p>

              <h2 className="mt-1 text-lg font-bold">Today's Overview</h2>
            </div>

            <span className="hidden text-xs text-slate-400 sm:block">
              Updated today
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        {/* ================= MAIN CARDS ================= */}
        <section className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          {/* FOLLOW UPS */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#fffaff] to-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b5cf6]">
                    Priority attention
                  </p>

                  <h2 className="mt-1 text-base font-bold">
                    3 children need follow-up
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Review these cases before today's visits.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('children')}
                  className="text-xs font-bold text-[#2450a5]"
                >
                  View all
                </button>
              </div>
            </div>

            <div>
              {followUps.map((child, index) => (
                <div
                  key={child.name}
                  className={`flex items-center justify-between gap-3 px-5 py-4 ${
                    index !== followUps.length - 1
                      ? 'border-b border-slate-100'
                      : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eaf6f7] text-[10px] font-bold text-[#159b91]">
                      {child.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold">{child.name}</p>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {child.detail}
                      </p>
                    </div>
                  </div>

                  <StatusBadge type={child.type} text={child.status} />
                </div>
              ))}
            </div>
          </div>

          {/* PROGRESS */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#159b91]">
                  Today's target
                </p>

                <h2 className="mt-1 text-base font-bold">
                  Screening Progress
                </h2>
              </div>

              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e9f8f5] text-sm text-[#159b91]">
                ✓
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="text-4xl font-extrabold text-[#244b91]">
                  3
                  <span className="text-lg text-slate-300">/5</span>
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Screenings completed
                </p>
              </div>

              <p className="text-sm font-bold text-[#159b91]">60%</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-[#2450a5] to-[#159b91]" />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>3 completed</span>
              <span>2 remaining</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('screening')}
              className="mt-5 w-full rounded-xl border border-[#d8e5f5] bg-white px-4 py-3 text-xs font-bold text-[#2450a5] transition hover:bg-[#f5f8fc]"
            >
              Start New Screening →
            </button>
          </div>
        </section>

        {/* ================= QUICK ACTIONS ================= */}
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-sm font-bold">Quick Actions</h2>

            <p className="text-[11px] text-slate-400">
              Common tasks for your centre
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickAction
              icon="+"
              title="Register child"
              subtitle="Add a new record"
              onClick={() => navigate('register')}
            />

            <QuickAction
              icon="◉"
              title="View children"
              subtitle="Browse records"
              onClick={() => navigate('children')}
            />

            <QuickAction
              icon="◷"
              title="Screening"
              subtitle="Continue screening"
              onClick={() => navigate('screening')}
            />

            {isAdmin && (
              <QuickAction
                icon="⚙️"
                title="Admin Console"
                subtitle="Manage centres & users"
                onClick={() => navigate('admin-console')}
              />
            )}
          </div>
        </section>
      </div>

      <BottomNav active="dashboard" onChange={navigate} />
    </main>
  )
}

/* ================= COMPONENTS ================= */

function MetricCard({ value, label, sub, icon, type }) {
  const styles = {
    blue: {
      icon: 'bg-blue-50 text-blue-600',
      number: 'text-[#244b91]',
    },
    red: {
      icon: 'bg-red-50 text-red-500',
      number: 'text-red-500',
    },
    orange: {
      icon: 'bg-orange-50 text-orange-500',
      number: 'text-orange-500',
    },
    green: {
      icon: 'bg-emerald-50 text-emerald-500',
      number: 'text-emerald-500',
    },
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-extrabold ${styles[type].icon}`}
      >
        {icon}
      </div>

      <p
        className={`mt-4 text-2xl font-extrabold ${styles[type].number}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-600">{label}</p>

      <p className="mt-1 text-[10px] text-slate-400">{sub}</p>
    </div>
  )
}

function StatusBadge({ type, text }) {
  const styles = {
    orange: 'bg-orange-50 text-orange-500 ring-orange-100',
    red: 'bg-red-50 text-red-500 ring-red-100',
    green: 'bg-emerald-50 text-emerald-500 ring-emerald-100',
  }

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ring-1 ${styles[type]}`}
    >
      {text}
    </span>
  )
}

function QuickAction({ icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-bold text-[#2450a5]">
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-xs font-bold text-slate-700">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-[9px] text-slate-400">
          {subtitle}
        </span>
      </span>
    </button>
  )
}