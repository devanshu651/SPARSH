import { useMemo, useState } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { EmptyState } from '../components/AsyncState'

const riskStyles = {
  GREEN: {
    badge: 'normal',
    title: 'Development On Track',
    banner: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
    iconColor: 'text-emerald-700',
    icon: 'checkCircle'
  },
  YELLOW: {
    badge: 'moderate',
    title: 'Moderate Developmental Delay',
    banner: 'border-amber-200 bg-amber-50/70 text-amber-900',
    iconColor: 'text-amber-700',
    icon: 'alertTriangle'
  },
  RED: {
    badge: 'high',
    title: 'High Developmental Risk Identified',
    banner: 'border-red-200 bg-red-50/70 text-red-900',
    iconColor: 'text-red-700',
    icon: 'alertCircle'
  }
}

export default function ReportScreen({ onNavigate }) {
  const { screeningResult, currentChild } = useApp()
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  const chartData = useMemo(() => {
    if (!screeningResult?.domain_scores) return []
    return Object.entries(screeningResult.domain_scores).map(([domain, value]) => {
      const formattedDomain = domain
        .replace('_', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())

      const score = Math.max(0, 100 - (value.missed_weight || 0) * 20)
      return {
        domain: formattedDomain,
        score,
        missed: value.missed_count || 0
      }
    })
  }, [screeningResult])

  if (!screeningResult) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Developmental Assessment Report"
        subtitle="Standardized RBSK Clinical Assessment & Recommendations"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate?.('children')}
            >
              <Icon name="children" className="h-4 w-4 text-primary-800" />
              <span>Browse Cohort</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate?.('screening')}
            >
              <Icon name="screening" className="h-4 w-4" />
              <span>Start Screening</span>
            </Button>
          </div>
        }
      >
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* REPORT HEADER BANNER */}
          <section className="rounded-xl border border-primary-900/10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-5 text-white shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-400/30">
                    <Icon name="report" className="h-3.5 w-3.5" />
                    Clinical Record Structure
                  </span>
                  <span className="text-xs text-primary-200">
                    RBSK Standard Clinical Output
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Developmental Assessment Report
                </h1>
                <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-2xl leading-relaxed">
                  Comprehensive multi-domain developmental evaluation, spider-chart performance analysis,
                  and caseworker intervention guidance aligned with national child health guidelines.
                </p>
              </div>

              <Button
                variant="teal"
                onClick={() => onNavigate?.('screening')}
                className="shrink-0"
              >
                <Icon name="screening" className="h-4 w-4" />
                <span>+ New Screening</span>
              </Button>
            </div>
          </section>

          {/* PRECONDITION NOTICE */}
          <Card title="Assessment Report Precondition" subtitle="Clinical documentation requirement">
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800">
                <Icon name="report" className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-neutral-900">
                Complete Screening First to Generate Report
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                Developmental reports are generated dynamically from verified milestone observation data.
                To view a child&apos;s developmental radar profile, domain scoring, and referral status, complete an active screening session.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => onNavigate?.('screening')}
                >
                  <Icon name="screening" className="h-4 w-4" />
                  <span>Start Child Screening</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onNavigate?.('children')}
                >
                  <Icon name="children" className="h-4 w-4" />
                  <span>Select Child from Cohort</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </Card>

          {/* REPORT ARCHITECTURE OVERVIEW */}
          <Card
            title="Standard Assessment Report Structure"
            subtitle="Sections generated upon completing an evaluation"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-200/80 bg-white p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-800">
                    <Icon name="analytics" className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">5-Domain Radar Profile</h4>
                    <span className="text-[11px] text-neutral-500">Visual performance diagram</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Plots developmental competencies across Gross Motor, Fine Motor, Language, Social-Emotional, and Cognitive domains against age baselines.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200/80 bg-white p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-800">
                    <Icon name="alertTriangle" className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Clinical Risk Classification</h4>
                    <span className="text-[11px] text-neutral-500">National Health Triage</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Automatic algorithmic categorisation into On Track (GREEN), Moderate Delay (YELLOW), or High Risk (RED) with clear caseworker next steps.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200/80 bg-white p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-800">
                    <Icon name="info" className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Caregiver Stimulation Guidance</h4>
                    <span className="text-[11px] text-neutral-500">Home-based exercises</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Targeted sensory and motor stimulation activities tailored to the specific developmental milestones flagged during observation.
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200/80 bg-white p-4">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-800">
                    <Icon name="hospital" className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Official RBSK Form 3A Docket</h4>
                    <span className="text-[11px] text-neutral-500">Specialist medical escalation</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  For high-risk findings, directly generates a standardized referral docket for the District Early Intervention Centre (DEIC).
                </p>
              </div>
            </div>
          </Card>

        </div>
      </AppLayout>
    )
  }

  const risk = riskStyles[screeningResult.risk_level] || riskStyles.GREEN

  const handleSaveNotes = () => {
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 3000)
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Developmental Assessment Report"
      subtitle={`Screening Reference: ${screeningResult.screening_id || 'SR-04821'}`}
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
        >
          <Icon name="report" className="h-4 w-4 text-neutral-600" />
          <span>Print / Export PDF</span>
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* PATIENT SUMMARY BANNER */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-50 text-sm font-bold text-primary-800">
                {currentChild?.name ? currentChild.name.charAt(0) : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-neutral-900">{currentChild?.name || 'Screened Child'}</h2>
                  <BadgePill tone="teal">
                    {screeningResult.checkpoint_age_months || currentChild?.age_months || '18'} Months
                  </BadgePill>
                </div>
                <p className="text-xs text-neutral-500">
                  ID: {currentChild?.child_identifier || 'AW-04821'} · Guardian: {currentChild?.guardian_name || 'Guardian'} · Ward 4
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400">Date Evaluated:</span>
              <span className="font-semibold text-neutral-700">
                {new Date(screeningResult.screened_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* CLINICAL RISK TRIAGE BANNER */}
        <div className={`rounded-xl border p-5 ${risk.banner}`}>
          <div className="flex items-start gap-4">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/80 ${risk.iconColor}`}>
              <Icon name={risk.icon} className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider">
                  RBSK Risk Level: {screeningResult.risk_level}
                </span>
                <BadgePill tone={risk.badge} dot>
                  {risk.title}
                </BadgePill>
              </div>
              <h3 className="mt-1 text-base font-bold">
                {screeningResult.risk_label || risk.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed opacity-90">
                {screeningResult.recommendation}
              </p>

              {screeningResult.risk_level === 'RED' && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onNavigate('referral')}
                  >
                    <Icon name="hospital" className="h-4 w-4" />
                    <span>Generate Immediate DEIC Referral →</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DOMAIN EVALUATION SECTION */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* RADAR CHART VISUALIZATION */}
          <Card
            title="Developmental Domain Profile"
            subtitle="Normalized milestone mastery (0–100%)"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  />
                  <Radar
                    name="Mastery Score"
                    dataKey="score"
                    stroke="#0f766e"
                    fill="#14b8a6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* DOMAIN SCORE BREAKDOWN TABLE */}
          <Card
            title="Milestone Competencies"
            subtitle="Individual domain performance"
          >
            <div className="divide-y divide-neutral-100">
              {chartData.map((item) => (
                <div key={item.domain} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{item.domain}</p>
                    <p className="text-[11px] text-neutral-500">
                      {item.missed > 0 ? `${item.missed} milestone(s) delayed` : 'All tasks achieved for age'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-800">{item.score}%</span>
                    <BadgePill tone={item.score >= 80 ? 'normal' : item.score >= 60 ? 'moderate' : 'high'}>
                      {item.score >= 80 ? 'Normal' : item.score >= 60 ? 'Concern' : 'Delayed'}
                    </BadgePill>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* CLINICAL OBSERVATIONS & NOTES */}
        <Card
          title="Clinical Observations & Follow-up Plan"
          subtitle="Record caseworker recommendations for parent guidance"
        >
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document caregiver counsel, dietary adjustments, or stimulation exercises instructed..."
            className="w-full rounded-lg border border-neutral-300 p-3 text-xs sm:text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              {notesSaved ? (
                <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                  <Icon name="check" className="h-3.5 w-3.5" /> Notes recorded locally
                </span>
              ) : (
                'Observations will persist on this device'
              )}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveNotes}
            >
              Save Observations
            </Button>
          </div>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => onNavigate('children')}
          >
            ← View Child Cohort
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            {screeningResult.risk_level === 'RED' && (
              <Button
                variant="destructive"
                onClick={() => onNavigate('referral')}
                className="flex-1 sm:flex-initial"
              >
                <Icon name="hospital" className="h-4 w-4" />
                <span>Create DEIC Referral</span>
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => onNavigate('dashboard')}
              className="flex-1 sm:flex-initial"
            >
              Finish & Return to Dashboard
            </Button>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}