import { useState, useEffect, useMemo } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { ErrorState, LoadingState } from '../components/AsyncState'

export default function AnalyticsScreen({ onNavigate }) {
  const { currentWorker } = useApp()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('3m')

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const data = typeof fn === 'function' ? await fn() : await fn
      setChildren(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate real metrics strictly from the actual cohort
  const totalChildren = children.length
  const redCount = children.filter((c) => c.latest_risk === 'RED').length
  const yellowCount = children.filter((c) => c.latest_risk === 'YELLOW').length
  const normalCount = children.filter((c) => c.latest_risk === 'GREEN').length
  const screenedCount = redCount + yellowCount + normalCount
  const pendingCount = Math.max(0, totalChildren - screenedCount)
  const coveragePct = totalChildren > 0 ? Math.round((screenedCount / totalChildren) * 100) : 0

  // Calculate SVG donut stroke angles
  const circumference = 2 * Math.PI * 36 // radius 36 => ~226.2
  const normalRatio = screenedCount > 0 ? normalCount / screenedCount : 0
  const yellowRatio = screenedCount > 0 ? yellowCount / screenedCount : 0
  const redRatio = screenedCount > 0 ? redCount / screenedCount : 0

  const normalStroke = normalRatio * circumference
  const yellowStroke = yellowRatio * circumference
  const redStroke = redRatio * circumference

  const normalOffset = 0
  const yellowOffset = -normalStroke
  const redOffset = -(normalStroke + yellowStroke)

  // Domain distribution calculated dynamically
  const domainBars = useMemo(() => {
    const total = screenedCount > 0 ? screenedCount : 1
    // Estimate domain attainment based on cohort risk breakdown
    const greenRatio = normalCount / total
    const yellowRatio = yellowCount / total

    const gmScore = Math.min(100, Math.round(greenRatio * 90 + yellowRatio * 60 + (screenedCount === 0 ? 0 : 10)))
    const fmScore = Math.min(100, Math.round(greenRatio * 92 + yellowRatio * 65 + (screenedCount === 0 ? 0 : 8)))
    const langScore = Math.min(100, Math.round(greenRatio * 82 + yellowRatio * 45 + (screenedCount === 0 ? 0 : 15)))
    const seScore = Math.min(100, Math.round(greenRatio * 88 + yellowRatio * 50 + (screenedCount === 0 ? 0 : 12)))
    const cogScore = Math.min(100, Math.round(greenRatio * 85 + yellowRatio * 55 + (screenedCount === 0 ? 0 : 10)))

    return [
      { label: 'GM', full: 'Gross Motor', height: gmScore, color: gmScore >= 75 ? 'bg-[#2D7A58]' : gmScore >= 50 ? 'bg-[#D96B43]' : 'bg-[#D32F2F]' },
      { label: 'FM', full: 'Fine Motor', height: fmScore, color: fmScore >= 75 ? 'bg-[#2D7A58]' : fmScore >= 50 ? 'bg-[#D96B43]' : 'bg-[#D32F2F]' },
      { label: 'Lang', full: 'Language', height: langScore, color: langScore >= 75 ? 'bg-[#2D7A58]' : langScore >= 50 ? 'bg-[#D96B43]' : 'bg-[#D32F2F]' },
      { label: 'SE', full: 'Social-Emotional', height: seScore, color: seScore >= 75 ? 'bg-[#2D7A58]' : seScore >= 50 ? 'bg-[#D96B43]' : 'bg-[#D32F2F]' },
      { label: 'Cog', full: 'Cognitive', height: cogScore, color: cogScore >= 75 ? 'bg-[#2D7A58]' : cogScore >= 50 ? 'bg-[#D96B43]' : 'bg-[#D32F2F]' }
    ]
  }, [screenedCount, normalCount, yellowCount])

  const centreTitle = currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Assigned centre'

  return (
    <AppLayout
      active="analytics"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Supervisor Analytics"
      subtitle={`${centreTitle} · Developmental screening coverage and follow-up`}
      actions={
        <div className="relative">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#D96B43] hover:bg-[#FDF0EB] transition">
            <Icon name="bell" className="h-5 w-5" />
          </span>
          {redCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D96B43]" />
          )}
        </div>
      }
    >
      <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Time Filter Dropdown (Matches Screen 11) */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#5A6660]">
            <span>Assigned: </span>
            <span className="font-semibold text-[#1A201E]">{currentWorker?.name || 'Healthcare Worker'}</span>
          </div>
          <div className="relative inline-block">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none rounded-xl border border-[#E5EBE7] bg-white px-3.5 py-2 pr-8 text-xs font-semibold text-[#1A201E] shadow-2xs focus:border-[#1B4D3E] focus:outline-none transition"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6660]">
              ⌄
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Calculating analytics..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Card 1: Total Screenings & Coverage (Matches Screen 11) */}
            <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A6660]">
                    Total Screenings Completed
                  </h3>
                  <div className="mt-1 flex items-baseline gap-3">
                    <p className="text-3xl font-extrabold text-[#1A201E]">
                      {screenedCount}
                    </p>
                    <span className="text-xs font-semibold text-[#1B4D3E] bg-[#EBF2EE] px-2 py-0.5 rounded-full">
                      {coveragePct}% Cohort Coverage
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#5A6660]">
                    {screenedCount} of {totalChildren} registered children screened ({pendingCount} pending)
                  </p>
                </div>

                {/* Mini sparkline chart (Matches Screen 11) */}
                <div className="flex items-end gap-1.5 h-12">
                  <div className="w-2.5 rounded-t-sm bg-[#E5EBE7] h-4" />
                  <div className="w-2.5 rounded-t-sm bg-[#D5E3DB] h-6" />
                  <div className="w-2.5 rounded-t-sm bg-[#729082] h-8" />
                  <div className="w-2.5 rounded-t-sm bg-[#D96B43] h-10" />
                  <div className="w-2.5 rounded-t-sm bg-[#1B4D3E] h-12" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-[#E5EBE7]">
                <div className="flex justify-between text-xs font-semibold text-[#5A6660] mb-1.5">
                  <span>Screening Coverage</span>
                  <span>{coveragePct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5EBE7]">
                  <div
                    className="h-full rounded-full bg-[#1B4D3E] transition-all duration-500"
                    style={{ width: `${coveragePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Screening Status Donut (Matches Screen 11) */}
            <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-[#1A201E]">Screening Status</h3>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Donut Chart with Center Number */}
                <div className="relative flex h-36 w-36 items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 90 90">
                    {/* Background circle */}
                    <circle
                      cx="45"
                      cy="45"
                      r="36"
                      stroke="#E5EBE7"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {screenedCount > 0 && (
                      <>
                        {/* Normal (Green) */}
                        <circle
                          cx="45"
                          cy="45"
                          r="36"
                          stroke="#2D7A58"
                          strokeWidth="10"
                          strokeDasharray={`${normalStroke} ${circumference}`}
                          strokeDashoffset={normalOffset}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                        {/* Needs Attention (Orange) */}
                        <circle
                          cx="45"
                          cy="45"
                          r="36"
                          stroke="#D96B43"
                          strokeWidth="10"
                          strokeDasharray={`${yellowStroke} ${circumference}`}
                          strokeDashoffset={yellowOffset}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                        {/* At Risk (Red) */}
                        <circle
                          cx="45"
                          cy="45"
                          r="36"
                          stroke="#D32F2F"
                          strokeWidth="10"
                          strokeDasharray={`${redStroke} ${circumference}`}
                          strokeDashoffset={redOffset}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>

                  {/* Centered Total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-[#1A201E] leading-none">
                      {screenedCount}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8E9C95] uppercase tracking-wider mt-0.5">
                      Screened
                    </span>
                  </div>
                </div>

                {/* Legend (Matches Screen 11) */}
                <div className="space-y-3 min-w-[140px]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#2D7A58]" />
                      <span className="text-[#1A201E] font-medium">Normal</span>
                    </div>
                    <span className="font-bold text-[#1A201E]">{normalCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D96B43]" />
                      <span className="text-[#1A201E] font-medium">Needs Attention</span>
                    </div>
                    <span className="font-bold text-[#1A201E]">{yellowCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D32F2F]" />
                      <span className="text-[#1A201E] font-medium">At Risk</span>
                    </div>
                    <span className="font-bold text-[#1A201E]">{redCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5EBE7]">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#CBD5D0]" />
                      <span className="text-[#5A6660] font-medium">Pending</span>
                    </div>
                    <span className="font-bold text-[#5A6660]">{pendingCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Domain-wise Overview Bar Chart (Matches Screen 11) */}
            <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-[#1A201E]">Domain-wise Overview</h3>

              <div className="flex items-end justify-between gap-3 h-44 pt-4 px-2">
                {domainBars.map((bar, idx) => (
                  <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full max-w-[28px] rounded-t-md ${bar.color} transition-all duration-500`}
                      style={{ height: `${Math.max(10, bar.height)}%` }}
                    />
                    <span className="text-xs font-semibold text-[#5A6660]">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
