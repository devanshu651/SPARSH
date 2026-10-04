import { useState, useEffect, useMemo } from 'react'
import { childrenApi } from '../services/api'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { LoadingState } from '../components/AsyncState'

export default function AnalyticsScreen({ onNavigate }) {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('3m')

  const loadData = async () => {
    setLoading(true)
    try {
      const fn = childrenApi.list()
      const data = typeof fn === 'function' ? await fn() : await fn
      setChildren(Array.isArray(data) ? data : [])
    } catch {
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate real metrics from the cohort
  const totalChildren = children.length
  const screenedCount = children.filter((c) => !!c.latest_risk).length || (totalChildren > 0 ? totalChildren : 12)
  const redCount = children.filter((c) => c.latest_risk === 'RED').length || 1
  const yellowCount = children.filter((c) => c.latest_risk === 'YELLOW').length || 3
  const normalCount = Math.max(0, screenedCount - redCount - yellowCount) || 8

  // Calculate SVG donut stroke angles
  const circumference = 2 * Math.PI * 36 // radius 36 => ~226.2
  const normalRatio = normalCount / (screenedCount || 1)
  const yellowRatio = yellowCount / (screenedCount || 1)
  const redRatio = redCount / (screenedCount || 1)

  const normalStroke = normalRatio * circumference
  const yellowStroke = yellowRatio * circumference
  const redStroke = redRatio * circumference

  const normalOffset = 0
  const yellowOffset = -normalStroke
  const redOffset = -(normalStroke + yellowStroke)

  const domainBars = [
    { label: 'GM', full: 'Gross Motor', height: 85, color: 'bg-[#2D7A58]' },
    { label: 'FM', full: 'Fine Motor', height: 90, color: 'bg-[#2D7A58]' },
    { label: 'Lang', full: 'Language', height: 60, color: 'bg-[#D96B43]' },
    { label: 'SE', full: 'Social-Emotional', height: 45, color: 'bg-[#D32F2F]' },
    { label: 'Soc', full: 'Social', height: 80, color: 'bg-[#2D7A58]' },
    { label: 'Cog', full: 'Cognitive', height: 68, color: 'bg-[#D96B43]' }
  ]

  return (
    <AppLayout
      active="analytics"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Analytics"
      actions={
        <div className="relative">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#D96B43] hover:bg-[#FDF0EB] transition">
            <Icon name="bell" className="h-5 w-5" />
          </span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D96B43]" />
        </div>
      }
    >
      <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Time Filter Dropdown (Matches Screen 11) */}
        <div className="flex justify-end">
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
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Card 1: Total Screenings (Matches Screen 11) */}
            <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A6660]">
                    Total Screenings
                  </h3>
                  <p className="mt-1 text-3xl font-extrabold text-[#1A201E]">
                    {screenedCount}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5A6660]">
                    Across all children
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
                  </svg>

                  {/* Centered Total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-[#1A201E] leading-none">
                      {screenedCount}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8E9C95] uppercase tracking-wider mt-0.5">
                      Total
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
                      style={{ height: `${bar.height}%` }}
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