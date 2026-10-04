import { useEffect, useRef, useState } from 'react'
import { screeningsApi } from '../services/api'
import { enqueueScreening } from '../services/offline'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { ErrorState, LoadingState } from '../components/AsyncState'

const domainConfig = [
  { key: 'gross_motor', label: 'Gross Motor', icon: 'activity' },
  { key: 'fine_motor', label: 'Fine Motor', icon: 'sparkles' },
  { key: 'language', label: 'Language', icon: 'speech' },
  { key: 'social_emotional', label: 'Social-Emotional', icon: 'heart' },
  { key: 'cognitive', label: 'Cognitive', icon: 'lightbulb' }
]

export default function AnalysisScreen({ onNavigate }) {
  const { screeningResult, setScreeningResult, currentChild, pendingScreening, setPendingScreening } = useApp()
  const [error, setError] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const submitting = useRef(false)

  const runAnalysis = async () => {
    if (submitting.current) return
    setError(null)

    let payload = pendingScreening
    if (!payload) {
      const raw = sessionStorage.getItem('sparsh:pending-screening')
      if (raw) {
        try {
          payload = JSON.parse(raw)
        } catch {
          payload = null
        }
      }
    }

    if (!payload) {
      return
    }

    submitting.current = true
    setAnalyzing(true)

    try {
      const subCall = screeningsApi.submit(payload)
      const result = typeof subCall === 'function' ? await subCall(payload) : await subCall
      setScreeningResult(result)
      setPendingScreening?.(null)
      sessionStorage.removeItem('sparsh:pending-screening')
      // Production behavior: auto-navigate to report immediately after successful submission
      onNavigate('report')
    } catch (e) {
      if (e?.status === 409 && e?.code === 'duplicate_submission') {
        setPendingScreening?.(null)
        sessionStorage.removeItem('sparsh:pending-screening')
        setError(new Error('This screening was already submitted. Open the child history to view it.'))
      } else if (!navigator.onLine || e?.status === 0) {
        try {
          await enqueueScreening(payload)
        } catch {
          setError(new Error('You are offline. This screening could not be queued.'))
          return
        }
        setPendingScreening?.(null)
        sessionStorage.removeItem('sparsh:pending-screening')
        setError(new Error('Waiting to sync. This screening is stored on this device and has not been confirmed by the SPARSH server.'))
      } else {
        setError(e)
      }
    } finally {
      submitting.current = false
      setAnalyzing(false)
    }
  }

  // Auto-run on mount — matching production useEffect([], run) behavior
  useEffect(() => {
    runAnalysis()
  }, [])

  // PRECONDITION: No active or past screening result and not analyzing
  if (!screeningResult && !analyzing && !error) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="screening"
        title="Screening Result Review"
        subtitle="Backend-calculated screening indication"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('screening')}
          >
            <Icon name="screening" className="h-4 w-4" />
            <span>Start Screening</span>
          </Button>
        }
      >
        <div className="relative mx-auto max-w-xl p-6 text-center space-y-4">
          <SparshBotanicalCorner position="top-right" className="opacity-30" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E]">
            <Icon name="analytics" className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A201E]">No Active Screening to Analyze</h2>
          <p className="text-xs text-[#5A6660] max-w-md mx-auto leading-relaxed">
            The screening service evaluates responses recorded during an active session. To review results, select a child from your cohort and complete milestone screening.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => onNavigate?.('screening')}>
              <Icon name="screening" className="h-4 w-4 mr-1.5" />
              <span>Go to Screening</span>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate?.('children')}>
              <Icon name="children" className="h-4 w-4 mr-1.5" />
              <span>Select Child</span>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (analyzing) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="screening" title="Screening Analysis">
        <div className="mx-auto max-w-md p-10 text-center space-y-4">
          <LoadingState label="Evaluating developmental milestone responses..." />
        </div>
      </AppLayout>
    )
  }

  if (error && !screeningResult) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="screening" title="Screening Analysis">
        <div className="mx-auto max-w-md p-6">
          <ErrorState error={error} onRetry={runAnalysis} />
        </div>
      </AppLayout>
    )
  }

  // Exact Match to Screen 7 (Analysis) in Redesigned UI
  const childName = currentChild?.name || 'Selected Child'
  const ageDisplay = currentChild?.age_months !== null && currentChild?.age_months !== undefined
    ? `${Math.floor(currentChild.age_months / 12)} years ${currentChild.age_months % 12} months`
    : 'Age recorded'
  const childSex = currentChild?.sex || 'Child'
  const screenedDate = screeningResult?.screened_at
    ? new Date(screeningResult.screened_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recent'

  const domainScores = screeningResult?.domain_scores || {}

  const overallRisk = screeningResult?.overall_risk || screeningResult?.risk_level || screeningResult?.summary?.risk_level

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="screening"
      title="Screening Analysis"
      subtitle="Backend-calculated developmental indication"
      actions={
        <Button variant="primary" size="sm" onClick={() => onNavigate?.('report')}>
          <span>View Report →</span>
        </Button>
      }
    >
      <div className="relative mx-auto max-w-xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Child Profile Card (Matches Screen 7) */}
        <div className="flex items-center justify-between rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-base">
              {childName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1A201E]">{childName}</h2>
              <p className="text-xs text-[#5A6660]">{ageDisplay} · {childSex}</p>
              <p className="text-[11px] text-[#8E9C95] mt-0.5">Screened on {screenedDate}</p>
            </div>
          </div>

          {overallRisk && (
            <BadgePill
              tone={
                overallRisk === 'RED'
                  ? 'risk'
                  : overallRisk === 'YELLOW'
                  ? 'followup'
                  : 'normal'
              }
            >
              {overallRisk === 'RED'
                ? 'Follow-up Recommended'
                : overallRisk === 'YELLOW'
                ? 'Review Recommended'
                : 'Threshold Not Reached'}
            </BadgePill>
          )}
        </div>

        {/* Developmental Domains Section (Matches Screen 7) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1A201E] px-1">
            Developmental Domains
          </h3>

          <div className="space-y-2.5">
            {domainConfig.map((dom) => {
              const score = domainScores[dom.key]
              const isFlagged = score?.missed_count > 0 || score?.missed_weight > 0 || score?.risk === 'YELLOW' || score?.risk === 'RED'
              const badgeTone = isFlagged ? 'followup' : 'normal'
              const badgeLabel = isFlagged ? 'Needs Attention' : 'On Track'

              return (
                <div
                  key={dom.key}
                  className="flex items-center justify-between rounded-xl border border-[#E5EBE7] bg-white p-3.5 shadow-2xs transition hover:border-[#1B4D3E]/20"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isFlagged ? 'bg-[#FDF0EB] text-[#D96B43]' : 'bg-[#EBF2EE] text-[#1B4D3E]'
                      }`}
                    >
                      <Icon name={dom.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="text-sm font-medium text-[#1A201E]">{dom.label}</span>
                      {score?.total_count ? (
                        <p className="text-[11px] text-[#8E9C95]">
                          {score.achieved_count ?? (score.total_count - (score.missed_count || 0))} of {score.total_count} milestones achieved
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <BadgePill tone={badgeTone}>
                    {badgeLabel}
                  </BadgePill>
                </div>
              )
            })}
          </div>
        </div>

        {/* Informational Callout (Matches Screen 7) */}
        <div className="flex items-start gap-3 rounded-2xl border border-[#E5EBE7] bg-[#F9FBFA] p-4 text-xs text-[#5A6660] shadow-2xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF2EE] text-[#1B4D3E] font-bold text-[11px] mt-0.5">
            i
          </span>
          <p className="leading-relaxed">
            This analysis is based on the screening responses. Please follow recommended actions for areas needing attention.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => onNavigate?.('report')}
            className="w-full text-sm font-semibold py-3"
          >
            Continue to Full Report →
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
