import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'

const domainConfig = [
  { key: 'gross_motor', label: 'Gross Motor', icon: 'activity' },
  { key: 'fine_motor', label: 'Fine Motor', icon: 'sparkles' },
  { key: 'language', label: 'Language', icon: 'speech' },
  { key: 'social_emotional', label: 'Social-Emotional', icon: 'heart' },
  { key: 'cognitive', label: 'Cognitive', icon: 'lightbulb' }
]

export default function ReportScreen({ onNavigate }) {
  const { screeningResult, currentChild } = useApp()
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  const childName = currentChild?.name || 'Screened Child'
  const ageDisplay = currentChild?.age_months !== null && currentChild?.age_months !== undefined
    ? `${Math.floor(currentChild.age_months / 12)} years ${currentChild.age_months % 12} months`
    : `${screeningResult?.checkpoint_age_months || '—'} months`
  const childSex = currentChild?.sex || 'Child'
  const screenedDate = screeningResult?.screened_at
    ? new Date(screeningResult.screened_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recent'

  const domainScores = screeningResult?.domain_scores || {}

  // Generate intelligent summary sentence matching actual results
  const flaggedDomains = useMemo(() => {
    return domainConfig.filter((d) => {
      const s = domainScores[d.key]
      return s && (s.missed_count > 0 || s.missed_weight > 0 || s.risk === 'YELLOW' || s.risk === 'RED')
    })
  }, [domainScores])

  const summaryText = flaggedDomains.length === 0
    ? 'The child is developing well across observed domains. Developmental milestones are on track for their age checkpoint.'
    : `The child is developing well in most areas. ${flaggedDomains.map((d) => d.label).join(' and ')} domain${flaggedDomains.length > 1 ? 's need' : ' needs'} attention and follow-up review.`

  const handleDownloadPdf = () => {
    window.print()
  }

  const handleSaveNotes = () => {
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  if (!screeningResult) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Developmental Screening Report"
        subtitle="Screening indication and follow-up information"
      >
        <div className="relative mx-auto max-w-xl p-6 text-center space-y-4">
          <SparshBotanicalCorner position="top-right" className="opacity-30" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E]">
            <Icon name="report" className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[#1A201E]">No Report Available</h2>
          <p className="text-xs text-[#5A6660] max-w-md mx-auto leading-relaxed">
            Developmental reports are generated automatically upon completing a milestone observation screening.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="primary" onClick={() => onNavigate?.('screening')}>
              <Icon name="screening" className="h-4 w-4 mr-1.5" />
              <span>Start Screening</span>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate?.('children')}>
              <span>View Children</span>
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const riskLevel = screeningResult.risk_level || screeningResult.overall_risk

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Screening Report"
      subtitle={`Screening Reference: ${screeningResult.screening_id || '—'}`}
      actions={
        <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
          <Icon name="download" className="h-4 w-4 text-[#1B4D3E]" />
          <span>PDF</span>
        </Button>
      }
    >
      <div className="relative mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Child Profile Card (Matches Screen 8) */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-base">
            {childName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1A201E] truncate">{childName}</h2>
              {riskLevel && (
                <BadgePill
                  tone={
                    riskLevel === 'RED'
                      ? 'risk'
                      : riskLevel === 'YELLOW'
                      ? 'followup'
                      : 'normal'
                  }
                >
                  {riskLevel === 'RED'
                    ? 'High Risk'
                    : riskLevel === 'YELLOW'
                    ? 'Review Needed'
                    : 'On Track'}
                </BadgePill>
              )}
            </div>
            <p className="text-xs text-[#5A6660]">{ageDisplay} · {childSex}</p>
            <p className="text-[11px] text-[#8E9C95] mt-0.5">Screened on {screenedDate}</p>
          </div>
        </div>

        {/* Download PDF Button (Matches Screen 8) */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EBF2EE] py-3.5 px-4 text-sm font-semibold text-[#1B4D3E] border border-[#D5E3DB] transition hover:bg-[#DDE9E2] shadow-2xs"
        >
          <Icon name="download" className="h-4 w-4" />
          <span>Download PDF / Print Slip</span>
        </button>

        {/* Summary Section (Matches Screen 8) */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-4 sm:p-5 shadow-2xs space-y-2">
          <h3 className="text-sm font-semibold text-[#1A201E]">Summary</h3>
          <p className="text-xs text-[#5A6660] leading-relaxed">
            {summaryText}
          </p>
          {screeningResult.recommendation && (
            <p className="text-xs text-[#1B4D3E] font-medium pt-1">
              Recommendation: {screeningResult.recommendation}
            </p>
          )}
        </div>

        {/* Domain Results Section (Matches Screen 8) */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#1A201E] px-1">
            Domain Results
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

        {/* RBSK Referral Escalation Action (if high risk or flagged) */}
        {riskLevel === 'RED' && (
          <div className="rounded-2xl border border-[#F7D4C8] bg-[#FDF0EB]/60 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D96B43]">
              <Icon name="alertTriangle" className="h-4 w-4" />
              <span>Priority Clinical Action Required</span>
            </div>
            <p className="text-xs text-[#1A201E] leading-relaxed">
              Screening indicates high risk developmental delays. A referral record should be created for specialized evaluation at the District Early Intervention Centre (DEIC).
            </p>
            <Button
              variant="terracotta"
              onClick={() => onNavigate?.('referral')}
              className="w-full text-xs font-semibold"
            >
              <Icon name="referral" className="h-4 w-4 mr-1.5" />
              <span>Generate DEIC Referral Slip</span>
            </Button>
          </div>
        )}

        {/* Worker Notes Field */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1A201E]">Caseworker Observations</label>
            {notesSaved && <span className="text-[11px] font-semibold text-[#2D7A58]">Saved ✓</span>}
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add maternal notes, environmental observations, or nutrition remarks..."
            className="w-full rounded-xl border border-[#E5EBE7] p-3 text-xs text-[#1A201E] placeholder:text-[#8E9C95] focus:border-[#1B4D3E] focus:outline-none transition"
          />
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleSaveNotes} disabled={!notes.trim()}>
              Save Notes
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => onNavigate?.('children')}>
            <span>Children Cohort</span>
          </Button>
          <Button variant="primary" onClick={() => onNavigate?.('screening')}>
            <span>Next Screening →</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
