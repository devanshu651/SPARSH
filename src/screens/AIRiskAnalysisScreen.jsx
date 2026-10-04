import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'

const analysis = {
  childName: 'Priya Sharma',
  age: '2y 4m',
  date: '15 Aug, 2025',
  score: 62,
  risk: 'HIGH RISK',
  domains: [
    { name: 'Gross Motor', score: 72, status: 'Mild Delay', type: 'warning' },
    { name: 'Fine Motor', score: 88, status: 'Normal', type: 'normal' },
    { name: 'Language', score: 51, status: 'At Risk', type: 'danger' },
    { name: 'Social/Emotional', score: 79, status: 'Normal', type: 'normal' },
    { name: 'Hearing', score: 95, status: 'Normal', type: 'normal' },
    { name: 'Vision', score: 68, status: 'Mild Concern', type: 'warning' },
  ],
  recommendations: [
    'Refer to PHC for language therapy evaluation',
    'Schedule follow-up hearing test in 2 weeks',
    'Enroll in Early Stimulation Programme',
    'Counselling session for parents/guardians',
  ],
}

export default function AIRiskAnalysisScreen({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!loading) return

    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          clearInterval(interval)
          setTimeout(() => setLoading(false), 400)
          return 100
        }
        return Math.min(previous + 6, 100)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [loading])

  if (loading) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="screening" title="AI Analysis">
        <div className="relative mx-auto max-w-md p-8 text-center space-y-6">
          <SparshBotanicalCorner position="top-right" className="opacity-25" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E]">
            <Icon name="analytics" className="h-8 w-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#1A201E]">Evaluating Developmental Profile</h2>
            <p className="text-xs text-[#5A6660] mt-1">Applying calibrated RBSK early childhood benchmarks...</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#5A6660]">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5EBE7]">
              <div
                className="h-full rounded-full bg-[#1B4D3E] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="screening"
      title="AI Risk Analysis"
      subtitle="Automated RBSK Diagnostic Scoring & Recommendations"
    >
      <div className="relative mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Risk summary card */}
        <div className="flex items-center gap-4 rounded-2xl border border-[#F7D4C8] bg-[#FDF0EB] p-4 sm:p-5 shadow-2xs">
          <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-full border-4 border-[#D96B43] bg-white">
            <div className="text-center">
              <span className="text-xl font-extrabold text-[#D96B43] leading-none">
                {analysis.score}
              </span>
              <span className="block text-[9px] text-[#8E9C95] font-bold">/100</span>
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <BadgePill tone="risk">
              High Risk
            </BadgePill>
            <h2 className="text-base font-semibold text-[#1A201E]">
              {analysis.childName}
            </h2>
            <p className="text-xs text-[#5A6660]">
              Age {analysis.age} · Screened {analysis.date}
            </p>
            <p className="text-xs font-semibold text-[#D96B43]">
              Specialist referral recommended
            </p>
          </div>
        </div>

        {/* Domain-wise Analysis */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1A201E]">Domain-wise Analysis</h3>

          <div className="space-y-3">
            {analysis.domains.map((dom) => (
              <div key={dom.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1A201E]">{dom.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A201E]">{dom.score}%</span>
                    <BadgePill tone={dom.type === 'normal' ? 'normal' : dom.type === 'danger' ? 'risk' : 'followup'}>
                      {dom.status}
                    </BadgePill>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5EBE7]">
                  <div
                    className={`h-full rounded-full ${
                      dom.type === 'normal'
                        ? 'bg-[#2D7A58]'
                        : dom.type === 'danger'
                        ? 'bg-[#D32F2F]'
                        : 'bg-[#D96B43]'
                    }`}
                    style={{ width: `${dom.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-[#1A201E]">Recommendations</h3>

          <div className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <div key={rec} className="flex items-start gap-2.5 text-xs text-[#5A6660]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBF2EE] text-[11px] font-bold text-[#1B4D3E]">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed text-[#1A201E]">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div>
          <Button
            variant="primary"
            onClick={() => onNavigate?.('report')}
            className="w-full text-sm font-semibold py-3"
          >
            View Full Report →
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}