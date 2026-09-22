import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { screeningsApi, childrenApi } from '../services/api'
import { cacheMilestones, clearDraft, getCachedMilestones, loadDraft, saveDraft } from '../services/offline'
import { useApp } from '../context/AppContext'

const domainLabels = {
  gross_motor: 'Gross Motor Skills',
  fine_motor: 'Fine Motor Skills',
  language: 'Language & Communication',
  social_emotional: 'Social & Emotional Development',
  cognitive: 'Cognitive & Problem Solving'
}

const domainDescriptions = {
  gross_motor: 'Large muscle movements, posture, sitting, crawling, and walking coordination.',
  fine_motor: 'Small muscle control, grasping, finger-thumb coordination, and object manipulation.',
  language: 'Speech sounds, vocal cues, responsive listening, and word understanding.',
  social_emotional: 'Interactions with caregivers, smiles, eye contact, and emotional reactions.',
  cognitive: 'Curiosity, object permanence, exploration, and spatial reasoning.'
}

export default function ScreeningScreen({ onNavigate }) {
  const { currentChild, setCurrentChild } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [domainIndex, setDomainIndex] = useState(0)

  const handleSelectChildForScreening = (child) => {
    setCurrentChild(child)
  }

  const load = async () => {
    if (!currentChild) return
    setError(null)
    try {
      const mCall = screeningsApi.milestones(currentChild.id)
      const result = typeof mCall === 'function' ? await mCall(currentChild.id) : await mCall
      cacheMilestones(currentChild.id, result)
      setData(result)
    } catch (e) {
      const cached = getCachedMilestones(currentChild.id)
      if (cached) {
        setData(cached)
        setError(new Error('Working offline. Using previously cached milestone questionnaire.'))
      } else {
        setError(e)
      }
    }
  }

  useEffect(() => {
    setData(null)
    setAnswers({})
    setDomainIndex(0)
    load()
  }, [currentChild?.id])

  useEffect(() => {
    if (!currentChild || !data) return
    const draft = loadDraft()
    if (
      draft?.childId === currentChild.id &&
      draft.checkpointAgeMonths === data.checkpoint_age_months &&
      draft.datasetVersion === data.dataset_version
    ) {
      setAnswers(draft.answers || {})
    }
  }, [currentChild?.id, data?.checkpoint_age_months, data?.dataset_version])

  useEffect(() => {
    if (currentChild && data) {
      saveDraft({
        childId: currentChild.id,
        checkpointAgeMonths: data.checkpoint_age_months,
        datasetVersion: data.dataset_version,
        answers
      })
    }
  }, [answers, currentChild?.id, data])

  const domains = useMemo(() => {
    return [...new Set(data?.milestones?.map((m) => m.domain) || [])]
  }, [data])

  const currentDomainKey = domains[domainIndex]
  const currentTasks = useMemo(() => {
    return data?.milestones?.filter((m) => m.domain === currentDomainKey) || []
  }, [data, currentDomainKey])

  const totalMilestones = data?.milestones?.length || 0
  const answeredCount = Object.keys(answers).length
  const progressPercent = totalMilestones ? Math.round((answeredCount / totalMilestones) * 100) : 0

  const handleAnswer = (id, response) => {
    setAnswers((prev) => ({ ...prev, [id]: response }))
  }

  const isCurrentDomainComplete = currentTasks.length > 0 && currentTasks.every((t) => answers[t.id])

  const advance = () => {
    if (!isCurrentDomainComplete) return

    if (domainIndex < domains.length - 1) {
      setDomainIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    sessionStorage.setItem(
      'sparsh:pending-screening',
      JSON.stringify({
        child_id: currentChild.id,
        checkpoint_age_months: data.checkpoint_age_months,
        milestone_dataset_version: data.dataset_version,
        client_submission_id: crypto.randomUUID(),
        answers: data.milestones.map(({ id }) => ({
          milestone_id: id,
          response: answers[id]
        })),
        screened_at: new Date().toISOString()
      })
    )

    clearDraft()
    onNavigate('av-assessment')
  }

  // Cohort state for child selection precondition
  const [cohort, setCohort] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [cohortSearch, setCohortSearch] = useState('')

  useEffect(() => {
    if (!currentChild) {
      setLoadingCohort(true)
      const fetchCohort = async () => {
        try {
          const fn = childrenApi.list()
          const res = typeof fn === 'function' ? await fn() : await fn
          setCohort(Array.isArray(res) ? res : [])
        } catch {
          setCohort([])
        } finally {
          setLoadingCohort(false)
        }
      }
      fetchCohort()
    }
  }, [currentChild])

  const filteredCohort = useMemo(() => {
    const q = cohortSearch.toLowerCase().trim()
    if (!q) return cohort
    return cohort.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.child_identifier?.toLowerCase().includes(q) ||
        c.guardian_name?.toLowerCase().includes(q)
    )
  }, [cohort, cohortSearch])

  // PRECONDITION VIEW: When no child is currently selected
  if (!currentChild) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Child Developmental Screening"
        subtitle="Standardized RBSK 5-Domain Observation Protocol (0–6 Years)"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('register')}
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Register New Child</span>
          </Button>
        }
      >
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* PAGE HEADER & CLINICAL WORKFLOW BANNER */}
          <section className="rounded-xl border border-primary-900/10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 p-5 text-white shadow-card sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-teal-400/30">
                    <Icon name="screening" className="h-3.5 w-3.5" />
                    Standard Clinical Protocol
                  </span>
                  <span className="text-xs text-primary-200">
                    RBSK 5-Domain Surveillance
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Child Developmental Screening
                </h1>
                <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-2xl leading-relaxed">
                  Early detection of developmental delays and neurodevelopmental impairments in infants and preschool children.
                  Select a child from your registered cohort to initiate their age-banded evaluation.
                </p>
              </div>

              <Button
                variant="teal"
                onClick={() => onNavigate?.('register')}
                className="shrink-0"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span>+ Register New Child</span>
              </Button>
            </div>
          </section>

          {/* SCREENING WORKFLOW BREAKDOWN */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-xs font-bold text-primary-800">
                  1
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Child & Checkpoint</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Select an enrolled child. SPARSH automatically calculates their age in months to retrieve calibrated RBSK milestone checkpoints.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
                  2
                </div>
                <h3 className="text-sm font-bold text-neutral-900">5-Domain Observation</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Record caregiver reports and frontline observations across Gross Motor, Fine Motor, Language, Social-Emotional, and Cognitive skills.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-xs font-bold text-amber-800">
                  3
                </div>
                <h3 className="text-sm font-bold text-neutral-900">Triage & DEIC Escalation</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                Instant rule engine evaluation classifies outcomes (On Track, Moderate Delay, or High Risk) and issues official RBSK Form 3A referral slips.
              </p>
            </div>
          </section>

          {/* CHILD SELECTION AREA */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Select Child to Screen</h2>
                <p className="text-xs text-neutral-500">
                  {cohort.length} children registered in your assigned centre
                </p>
              </div>

              {cohort.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="search"
                    value={cohortSearch}
                    onChange={(e) => setCohortSearch(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="h-9 w-full rounded-lg border border-neutral-300 bg-neutral-50/50 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {loadingCohort ? (
              <LoadingState label="Loading registered children cohort..." />
            ) : cohort.length === 0 ? (
              <EmptyState
                title="No children registered yet"
                detail="Developmental milestone screening requires a registered child profile with a verified date of birth. Enrol your first child to begin the screening protocol."
                icon="children"
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <Button
                      variant="primary"
                      onClick={() => onNavigate?.('register')}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      <span>Register Child</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onNavigate?.('dashboard')}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                }
              />
            ) : filteredCohort.length === 0 ? (
              <EmptyState
                title="No matching children found"
                detail="Try adjusting your search query or clear the filter to view all enrolled children."
                icon="search"
                action={
                  <Button variant="secondary" size="sm" onClick={() => setCohortSearch('')}>
                    Clear Search
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCohort.map((child) => {
                  const riskTone =
                    child.latest_risk === 'RED'
                      ? 'high'
                      : child.latest_risk === 'YELLOW'
                      ? 'moderate'
                      : child.latest_risk === 'GREEN'
                      ? 'normal'
                      : 'neutral'

                  const riskLabel =
                    child.latest_risk === 'RED'
                      ? 'High Risk'
                      : child.latest_risk === 'YELLOW'
                      ? 'Moderate'
                      : child.latest_risk === 'GREEN'
                      ? 'On Track'
                      : 'Screening Due'

                  return (
                    <div
                      key={child.id}
                      className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card hover:border-neutral-300 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-50 font-bold text-xs text-primary-800">
                              {child.name?.charAt(0) || 'C'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-neutral-900 truncate">
                                {child.name || 'Unnamed Child'}
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                {child.age_months !== null && child.age_months !== undefined
                                  ? `${child.age_months}m`
                                  : 'Age not logged'}
                                {child.sex ? ` · ${child.sex}` : ''}
                              </p>
                            </div>
                          </div>

                          <BadgePill tone={riskTone} dot>
                            {riskLabel}
                          </BadgePill>
                        </div>

                        <div className="mt-3 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500 space-y-0.5">
                          <p>
                            <span className="text-neutral-400">ID:</span>{' '}
                            <span className="font-medium text-neutral-700">{child.child_identifier || '—'}</span>
                          </p>
                          <p className="truncate">
                            <span className="text-neutral-400">Guardian:</span>{' '}
                            <span className="font-medium text-neutral-700">{child.guardian_name || '—'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-neutral-100">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            const { setCurrentChild } = useApp
                            // Setting child triggers active questionnaire
                            // App context exposes setCurrentChild via hook
                            handleSelectChildForScreening(child)
                          }}
                        >
                          <Icon name="screening" className="h-3.5 w-3.5 mr-1" />
                          <span>Select & Start Screening</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* PROTOCOL EXPLANATION CARD */}
          <section className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-800">
                <Icon name="info" className="h-4 w-4" />
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed">
                <h4 className="font-bold text-neutral-900">What happens after selecting a child?</h4>
                <p className="mt-1">
                  SPARSH determines the child&apos;s age-bracket checkpoint and loads their specific milestone questionnaire.
                  You can complete each domain at your own pace, save drafts offline, and optionally conduct supplemental sensory checks (audio tone response, visual pursuit tracking, and speech sampling) before running the diagnostic risk engine.
                </p>
              </div>
            </div>
          </section>

        </div>
      </AppLayout>
    )
  }

  if (!data && !error) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Child Developmental Screening"
        subtitle={`Loading milestone checklist for ${currentChild?.name || 'child'}...`}
      >
        <LoadingState label={`Loading age-appropriate milestone questions for ${currentChild?.name || 'selected child'}...`} />
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Child Developmental Screening"
        subtitle="Error loading milestone checklist"
      >
        <div className="mx-auto max-w-lg p-6">
          <ErrorState error={error} onRetry={load} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Child Development Screening"
      subtitle="Standardized RBSK Observation Protocol"
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* PATIENT CONTEXT RIBBON */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-800 text-xs font-bold text-white">
                {currentChild?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">{currentChild?.name || 'Child'}</h2>
                  <BadgePill tone="teal">{data.current_age_months} Months</BadgePill>
                </div>
                <p className="text-xs text-neutral-500">
                  ID: {currentChild?.child_identifier || 'AW-04821'} · Protocol: {data.checkpoint_age_months}M Checkpoint
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-900">
                  {answeredCount} / {totalMilestones} Completed
                </span>
                <p className="text-[11px] text-neutral-500">{progressPercent}% of screening answered</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 flex items-center gap-2">
            <Icon name="alertTriangle" className="h-4 w-4 text-amber-700" />
            <span>{error.message}</span>
          </div>
        )}

        {/* DOMAIN NAVIGATION STEPPER */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {domains.map((dKey, idx) => {
            const isCurrent = idx === domainIndex
            const isComplete = data.milestones
              .filter((m) => m.domain === dKey)
              .every((m) => answers[m.id])

            return (
              <button
                key={dKey}
                type="button"
                onClick={() => setDomainIndex(idx)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-primary-800 text-white shadow-xs'
                    : isComplete
                    ? 'border border-teal-200 bg-teal-50 text-teal-800'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {isComplete && <Icon name="check" className="h-3.5 w-3.5 text-teal-600" />}
                <span>{domainLabels[dKey] || dKey}</span>
              </button>
            )
          })}
        </div>

        {/* ACTIVE DOMAIN HEADING */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Domain {domainIndex + 1} of {domains.length}
              </span>
              <span className="text-xs text-neutral-400">
                {currentTasks.filter((t) => answers[t.id]).length} of {currentTasks.length} answered
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-neutral-900">
              {domainLabels[currentDomainKey] || currentDomainKey}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {domainDescriptions[currentDomainKey] || 'Observe and verify child responses'}
            </p>
          </div>

          {/* MILESTONE OBSERVATION QUESTIONS */}
          <div className="mt-6 space-y-4">
            {currentTasks.map((task, index) => {
              const currentAnswer = answers[task.id]
              const taskText = task.task || task.description || task.label || 'Task description unavailable'

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 transition ${
                    !currentAnswer
                      ? 'border-neutral-200 bg-white'
                      : currentAnswer === 'YES'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : currentAnswer === 'NO'
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-900 leading-snug">
                      <span className="mr-1.5 font-bold text-neutral-400">{index + 1}.</span>
                      {taskText}
                    </p>
                    {currentAnswer && (
                      <BadgePill
                        tone={
                          currentAnswer === 'YES'
                            ? 'normal'
                            : currentAnswer === 'NO'
                            ? 'high'
                            : 'moderate'
                        }
                      >
                        {currentAnswer === 'YES' ? 'Achieved' : currentAnswer === 'NO' ? 'Not Yet' : 'Unsure'}
                      </BadgePill>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-neutral-500">
                    Ask the caregiver or observe the child directly in the Anganwadi centre.
                  </p>

                  {/* 3-WAY RESPONSE BUTTONS */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAnswer(task.id, 'YES')}
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition ${
                        currentAnswer === 'YES'
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                          : 'border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      <Icon name="check" className="h-4 w-4" />
                      <span>Yes (Achieved)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnswer(task.id, 'NO')}
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition ${
                        currentAnswer === 'NO'
                          ? 'border-red-600 bg-red-600 text-white shadow-xs'
                          : 'border-red-300 bg-white text-red-800 hover:bg-red-50'
                      }`}
                    >
                      <Icon name="cross" className="h-4 w-4" />
                      <span>No (Not Yet)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnswer(task.id, 'UNSURE')}
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition ${
                        currentAnswer === 'UNSURE'
                          ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                          : 'border-amber-300 bg-white text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      <Icon name="info" className="h-4 w-4" />
                      <span>Unsure</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* STEP CONTROLS */}
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
            <Button
              variant="secondary"
              disabled={domainIndex === 0}
              onClick={() => {
                setDomainIndex((d) => d - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Previous Domain
            </Button>

            <Button
              variant="primary"
              disabled={!isCurrentDomainComplete}
              onClick={advance}
            >
              <span>
                {domainIndex === domains.length - 1
                  ? 'Complete & Continue to A/V Check →'
                  : 'Next Domain →'}
              </span>
            </Button>
          </div>

          {!isCurrentDomainComplete && (
            <p className="mt-3 text-center text-xs font-medium text-amber-700">
              Please answer all {currentTasks.length} questions in this domain to proceed.
            </p>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
