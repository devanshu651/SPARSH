import { useEffect, useRef, useState } from 'react'
import { screeningsApi } from '../services/api'
import { enqueueScreening } from '../services/offline'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { ErrorState, EmptyState } from '../components/AsyncState'

const steps = [
  'Verifying recorded milestone responses',
  'Transmitting clinical screening data',
  'Applying RBSK developmental risk evaluation rules',
  'Generating comprehensive developmental report'
]

export default function AnalysisScreen({ onNavigate }) {
  const { setScreeningResult, currentChild } = useApp()
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasPendingData, setHasPendingData] = useState(() => {
    return Boolean(sessionStorage.getItem('sparsh:pending-screening'))
  })
  const submitting = useRef(false)

  const runAnalysis = async () => {
    if (submitting.current) return
    setError(null)
    const raw = sessionStorage.getItem('sparsh:pending-screening')

    if (!raw) {
      setHasPendingData(false)
      return
    }

    setHasPendingData(true)
    const payload = JSON.parse(raw)
    submitting.current = true

    try {
      setCurrentStep(1)
      await new Promise((r) => setTimeout(r, 450))
      setCurrentStep(2)

      const subCall = screeningsApi.submit(payload)
      const result = typeof subCall === 'function' ? await subCall(payload) : await subCall
      setCurrentStep(3)
      setScreeningResult(result)
      sessionStorage.removeItem('sparsh:pending-screening')

      await new Promise((r) => setTimeout(r, 400))
      onNavigate('report')
    } catch (e) {
      if (!navigator.onLine) {
        enqueueScreening(payload)
        sessionStorage.removeItem('sparsh:pending-screening')
        setError(new Error('Device is offline. This screening has been securely cached in your local queue and will synchronize automatically when connection resumes.'))
      } else {
        setError(e)
      }
    } finally {
      submitting.current = false
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('sparsh:pending-screening')
    if (raw) {
      runAnalysis()
    }
  }, [])

  // PRECONDITION STATE: When opened without an active pending screening session
  if (!hasPendingData && !error) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="screening"
        title="Developmental Diagnostic Analysis"
        subtitle="RBSK Algorithmic Risk Evaluation Engine"
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
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* ENGINE HEADER BANNER */}
          <section className="rounded-xl border border-primary-900/10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-5 text-white shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-400/30">
                    <Icon name="analytics" className="h-3.5 w-3.5" />
                    Clinical Engine
                  </span>
                  <span className="text-xs text-primary-200">
                    RBSK Standard Version 2025
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Developmental Diagnostic Engine
                </h1>
                <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-2xl leading-relaxed">
                  Automated rule-based evaluation of early childhood developmental milestones.
                  Translates frontline questionnaire responses into clinical delay indices and referral actions.
                </p>
              </div>

              <Button
                variant="teal"
                onClick={() => onNavigate?.('screening')}
                className="shrink-0"
              >
                <Icon name="screening" className="h-4 w-4" />
                <span>Begin Screening Session</span>
              </Button>
            </div>
          </section>

          {/* PRECONDITION NOTICE CARD */}
          <Card title="Screening Precondition Required" subtitle="Analysis engine inputs">
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-800">
                <Icon name="screening" className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-neutral-900">
                No Pending Milestone Screening Found
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                The diagnostic engine evaluates child responses recorded during an active screening session.
                To run an analysis, select a child from the cohort and complete their age-appropriate milestone questions.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => onNavigate?.('screening')}
                >
                  <Icon name="screening" className="h-4 w-4" />
                  <span>Go to Screening Workflow</span>
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

          {/* ALGORITHMIC RULES & ARCHITECTURE SPECIFICATION */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">On Track (GREEN)</h4>
              </div>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Child achieves all critical developmental milestones for their age checkpoint. Routine monitoring continues at next scheduled Anganwadi visit.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">Moderate Delay (YELLOW)</h4>
              </div>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                1–2 milestone delays identified. Caseworker assigns targeted home stimulation exercises and schedules a re-screening checkpoint in 4 weeks.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-950">High Risk (RED)</h4>
              </div>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                3 or more milestone failures or covert sensory impairment. Automatically triggers formal RBSK Form 3A referral to District Early Intervention Centre (DEIC).
              </p>
            </div>
          </section>

        </div>
      </AppLayout>
    )
  }

  // ACTIVE ANALYSIS / PROCESSING OR ERROR STATE
  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="screening"
      title="Developmental Diagnostic Analysis"
      subtitle="Applying RBSK Clinical Evaluation Rules"
    >
      <div className="mx-auto max-w-xl p-4 sm:p-8">
        {error ? (
          <div className="space-y-4">
            <ErrorState error={error} onRetry={runAnalysis} />
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onNavigate('screening')}
              >
                Return to Screening
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200/90 bg-white p-8 shadow-card text-center">
            {/* Clinical spinner */}
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
              <div className="h-14 w-14 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
              <Icon name="screening" className="absolute h-6 w-6 text-primary-800" />
            </div>

            <h1 className="mt-5 text-lg font-bold text-neutral-900">
              Evaluating Developmental Milestones
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Patient: {currentChild?.name || 'Selected Child'} · Applying RBSK Scoring Rules
            </p>

            {/* Step checklist */}
            <div className="mt-6 space-y-3 rounded-lg bg-neutral-50 p-4 text-left border border-neutral-100">
              {steps.map((text, idx) => {
                const isDone = idx < currentStep
                const isActive = idx === currentStep

                return (
                  <div key={text} className="flex items-center gap-3">
                    <div className="grid h-5 w-5 shrink-0 place-items-center">
                      {isDone ? (
                        <div className="grid h-4 w-4 place-items-center rounded-full bg-teal-600 text-white">
                          <Icon name="check" className="h-2.5 w-2.5" />
                        </div>
                      ) : isActive ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-800 border-t-transparent" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-neutral-300" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        isDone
                          ? 'font-medium text-neutral-800'
                          : isActive
                          ? 'font-bold text-primary-900'
                          : 'text-neutral-400'
                      }`}
                    >
                      {text}
                    </span>
                  </div>
                )
              })}
            </div>

            <p className="mt-6 text-[11px] text-neutral-400">
              SPARSH Diagnostic Rule Engine · RBSK Standard
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
