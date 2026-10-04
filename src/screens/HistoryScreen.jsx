import { useEffect, useMemo, useState } from 'react'
import { childrenApi } from '../services/api'
import { ErrorState, LoadingState } from '../components/AsyncState'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { useApp } from '../context/AppContext'

export default function HistoryScreen({ onNavigate }) {
  const { currentChild, setCurrentChild, setScreeningResult } = useApp()
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState(currentChild?.id || 'all')
  const [selectedStatus, setSelectedStatus] = useState('all') // 'all' | 'completed' | 'followup' | 'risk'
  const [screeningsList, setScreeningsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load cohort and past screenings
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const rawChildren = typeof fn === 'function' ? await fn() : await fn
      const childList = Array.isArray(rawChildren) ? rawChildren : []
      setChildren(childList)

      // Fetch history for children to build the screening history list
      const allScreenings = []
      await Promise.all(
        childList.map(async (c) => {
          try {
            const hCall = childrenApi.history(c.id)
            const h = typeof hCall === 'function' ? await hCall(c.id) : await hCall
            if (h && Array.isArray(h.screenings)) {
              h.screenings.forEach((s) => {
                allScreenings.push({
                  id: s.screening_id || `${c.id}-${s.screened_at}`,
                  childId: c.id,
                  childName: c.name,
                  ageMonths: c.age_months,
                  sex: c.sex,
                  screeningId: s.screening_id,
                  screenedAt: s.screened_at,
                  riskLevel: s.risk_level || c.latest_risk || 'GREEN',
                  domainScores: s.domain_scores || {},
                  recommendation: s.recommendation,
                  status: 'Completed'
                })
              })
            }
          } catch {
            // Child might not have screenings yet
          }
        })
      )

      // Sort by screenedAt descending
      allScreenings.sort((a, b) => new Date(b.screenedAt || 0) - new Date(a.screenedAt || 0))
      setScreeningsList(allScreenings)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (currentChild?.id) {
      setSelectedChildId(currentChild.id)
    }
  }, [currentChild?.id])

  const filteredScreenings = useMemo(() => {
    return screeningsList.filter((item) => {
      if (selectedChildId !== 'all' && item.childId !== selectedChildId) {
        return false
      }
      if (selectedStatus === 'completed') {
        return item.status === 'Completed'
      }
      if (selectedStatus === 'followup') {
        return item.riskLevel === 'YELLOW'
      }
      if (selectedStatus === 'risk') {
        return item.riskLevel === 'RED'
      }
      return true
    })
  }, [screeningsList, selectedChildId, selectedStatus])

  const handleOpenScreening = (item) => {
    const child = children.find((c) => c.id === item.childId)
    if (child) {
      setCurrentChild(child)
    }
    setScreeningResult({
      screening_id: item.screeningId,
      child_id: item.childId,
      risk_level: item.riskLevel,
      screened_at: item.screenedAt,
      recommendation: item.recommendation || (item.riskLevel === 'GREEN' ? 'Routine development. Continue age-appropriate activities.' : 'Clinical review and referral follow-up recommended.'),
      domain_scores: item.domainScores
    })
    onNavigate?.('report')
  }

  return (
    <AppLayout
      active="more"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="History"
      subtitle="Screening records and clinical audit trail"
    >
      <div className="relative mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Filter Dropdowns (Matches Screen 10) */}
        <div className="grid grid-cols-2 gap-3">
          {/* All Children Selector */}
          <div className="relative">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E5EBE7] bg-white px-3.5 py-2.5 pr-8 text-xs font-semibold text-[#1A201E] shadow-2xs focus:border-[#1B4D3E] focus:outline-none transition"
            >
              <option value="all">All Children</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6660]">
              ⌄
            </span>
          </div>

          {/* All Status Selector */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E5EBE7] bg-white px-3.5 py-2.5 pr-8 text-xs font-semibold text-[#1A201E] shadow-2xs focus:border-[#1B4D3E] focus:outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="followup">Review Needed (Yellow)</option>
              <option value="risk">High Risk (Red)</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5A6660]">
              ⌄
            </span>
          </div>
        </div>

        {/* Screening List (Matches Screen 10) */}
        {loading ? (
          <LoadingState label="Loading screening history..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : filteredScreenings.length === 0 ? (
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E] mb-3">
              <Icon name="history" className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A201E]">No screening records found</h3>
            <p className="mt-1 text-xs text-[#5A6660]">
              {selectedChildId !== 'all'
                ? 'No past screenings logged for this child yet.'
                : 'Completed developmental screening sessions will appear here chronologically.'}
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={() => onNavigate?.('screening')}>
                <Icon name="screening" className="h-4 w-4 mr-1" />
                <span>Start Screening</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredScreenings.map((item) => {
              const formattedDate = item.screenedAt
                ? new Date(item.screenedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Recent'

              const riskTone =
                item.riskLevel === 'RED'
                  ? 'risk'
                  : item.riskLevel === 'YELLOW'
                  ? 'followup'
                  : 'normal'

              const riskLabel =
                item.riskLevel === 'RED'
                  ? 'High Risk'
                  : item.riskLevel === 'YELLOW'
                  ? 'Review Needed'
                  : 'On Track'

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenScreening(item)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs transition hover:border-[#1B4D3E]/30 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
                      {item.childName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A201E]">{item.childName}</h4>
                      <p className="text-xs text-[#5A6660]">
                        {formattedDate} {item.ageMonths ? `· ${item.ageMonths}m` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BadgePill tone={riskTone}>
                      {riskLabel}
                    </BadgePill>
                    <span className="text-sm font-bold text-[#8E9C95]">›</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
