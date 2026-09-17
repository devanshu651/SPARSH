import React from 'react'

const monthlyData = [
  { month: 'Mar', value: 42 },
  { month: 'Apr', value: 58 },
  { month: 'May', value: 51 },
  { month: 'Jun', value: 74 },
  { month: 'Jul', value: 68 },
  { month: 'Aug', value: 85 },
]

const workers = [
  { name: 'Sunita Devi', ward: 'Ward 4', screened: 85, score: 98, initial: 'S' },
  { name: 'Rekha Yadav', ward: 'Ward 7', screened: 72, score: 94, initial: 'R' },
  { name: 'Meena Patil', ward: 'Ward 2', screened: 68, score: 91, initial: 'M' },
]

export default function AnalyticsScreen({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18346f] via-[#14558a] to-[#0d6b68] lg:bg-[#f5f8fc]">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f9fd] pb-24 shadow-2xl lg:max-w-5xl lg:rounded-none">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xl text-blue-600"
          >
            ‹
          </button>

          <h1 className="text-[16px] font-bold text-slate-900">
            Supervisor Analytics
          </h1>

          <button
            type="button"
            className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-600"
          >
            📅 Aug 2025
          </button>
        </header>

        <main className="space-y-4 px-4 py-3">

          {/* KPI Cards */}
          <section className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-3 text-center shadow-sm">
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-blue-600">
                ♙
              </div>
              <div className="text-[18px] font-bold text-slate-900">284</div>
              <div className="text-[9px] text-slate-500">Total Screened</div>
            </div>

            <div className="rounded-2xl border border-red-100 bg-white p-3 text-center shadow-sm">
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-red-50 text-red-500">
                ⚠
              </div>
              <div className="text-[18px] font-bold text-slate-900">47</div>
              <div className="text-[9px] text-slate-500">At Risk</div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-3 text-center shadow-sm">
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-orange-500">
                ➤
              </div>
              <div className="text-[18px] font-bold text-slate-900">23</div>
              <div className="text-[9px] text-slate-500">Referrals</div>
            </div>
          </section>

          {/* Monthly Screenings */}
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-slate-900">
                Monthly Screenings
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-600">
                2025
              </span>
            </div>

            <div className="flex h-32 items-end justify-between gap-2 px-1">
              {monthlyData.map((item) => {
                const isCurrent = item.month === 'Aug'
                const height = `${(item.value / 85) * 100}%`

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[9px] font-medium text-blue-600">
                      {item.value}
                    </span>

                    <div
                      className={`w-full max-w-[32px] rounded-t-xl ${
                        isCurrent
                          ? 'bg-blue-600'
                          : 'bg-blue-100'
                      }`}
                      style={{ height }}
                    />

                    <span className="mt-1 text-[9px] text-slate-500">
                      {item.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Risk Distribution */}
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-[13px] font-bold text-slate-900">
              Risk Distribution
            </h2>

            <div className="flex items-center gap-5">
              {/* Donut */}
              <div
                className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full"
                style={{
                  background:
                    'conic-gradient(#22c55e 0deg 216deg, #f59e0b 216deg 302.4deg, #ef4444 302.4deg 360deg)',
                }}
              >
                <div className="grid h-16 w-16 place-items-center rounded-full bg-white">
                  <div className="text-center">
                    <div className="text-[18px] font-bold text-slate-900">
                      284
                    </div>
                    <div className="text-[8px] text-slate-500">
                      Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span>Normal</span>
                  </div>
                  <div className="flex gap-2">
                    <b className="text-green-600">169</b>
                    <span className="rounded bg-green-50 px-1 text-green-600">60%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span>Moderate</span>
                  </div>
                  <div className="flex gap-2">
                    <b className="text-orange-500">68</b>
                    <span className="rounded bg-orange-50 px-1 text-orange-500">24%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>At Risk</span>
                  </div>
                  <div className="flex gap-2">
                    <b className="text-red-500">47</b>
                    <span className="rounded bg-red-50 px-1 text-red-500">16%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Worker Performance */}
          <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-[13px] font-bold text-slate-900">
              Worker Performance
            </h2>

            <div>
              {workers.map((worker, index) => (
                <div
                  key={worker.name}
                  className={`flex items-center justify-between py-3 ${
                    index !== workers.length - 1
                      ? 'border-b border-slate-100'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                      {worker.initial}
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-900">
                        {worker.name}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {worker.ward} · {worker.screened} screened
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-900">
                    <span className="mr-1 text-orange-400">☆</span>
                    {worker.score}%
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* Bottom Navigation */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 px-3 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur lg:absolute lg:mx-auto lg:max-w-md">
          <div className="mx-auto flex max-w-md justify-between">
            {[
              ['dashboard', '⌂', 'Home'],
              ['children', '♧', 'Children'],
              ['screening', '▤', 'Screening'],
              ['analytics', '▥', 'Analytics'],
              ['alerts', '♧', 'Alerts'],
            ].map(([id, icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate?.(id)}
                className={`flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[9px] font-semibold ${
                  id === 'analytics'
                    ? 'text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`grid h-6 w-7 place-items-center rounded-lg text-base ${
                    id === 'analytics' ? 'bg-blue-50' : ''
                  }`}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        </nav>

      </div>
    </div>
  )
}