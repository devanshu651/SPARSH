import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { screeningsApi, childrenApi } from '../services/api'
import { cacheMilestones, clearDraft, getCachedMilestones, loadDraft, saveDraft } from '../services/offline'
import { useApp } from '../context/AppContext'

const domainMeta = {
  gross_motor: {
    label: 'Gross Motor Skills',
    icon: 'activity',
    desc: 'Large muscle movements, posture, sitting, crawling, and walking coordination.'
  },
  fine_motor: {
    label: 'Fine Motor Skills',
    icon: 'sparkles',
    desc: 'Small muscle control, grasping, finger-thumb coordination, and object manipulation.'
  },
  language: {
    label: 'Language & Communication',
    icon: 'speech',
    desc: 'Speech sounds, vocal cues, responsive listening, and word understanding.'
  },
  social_emotional: {
    label: 'Social & Emotional Development',
    icon: 'heart',
    desc: 'Interactions with caregivers, smiles, eye contact, and emotional reactions.'
  },
  cognitive: {
    label: 'Cognitive & Problem Solving',
    icon: 'lightbulb',
    desc: 'Curiosity, object permanence, exploration, and spatial reasoning.'
  }
}

export default function ScreeningScreen({ onNavigate }) {
  const { currentChild, setCurrentChild, setPendingScreening } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [domainIndex, setDomainIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)

  // Cohort state when no child is selected
  const [cohort, setCohort] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [cohortError, setCohortError] = useState(null)
  const [cohortSearch, setCohortSearch] = useState('')

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
        setError(new Error('Working offline. Using cached milestone questionnaire.'))
      } else {
        setError(e)
      }
    }
  }

  useEffect(() => {
    setData(null)
    setAnswers({})
    setDomainIndex(0)
    setQuestionIndex(0)
    setReviewing(false)
    setPendingPayload(null)
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

  const fetchCohort = async () => {
    setLoadingCohort(true)
    setCohortError(null)
    try {
      const fn = childrenApi.list()
      const res = typeof fn === 'function' ? await fn() : await fn
      setCohort(Array.isArray(res) ? res : [])
    } catch (err) {
      setCohortError(err)
    } finally {
      setLoadingCohort(false)
    }
  }

  useEffect(() => {
    if (!currentChild) {
      fetchCohort()
    }
  }, [currentChild])

  const domains = useMemo(() => {
    return [...new Set(data?.milestones?.map((m) => m.domain) || [])]
  }, [data])

  const currentDomainKey = domains[domainIndex] || 'gross_motor'
  const currentTasks = useMemo(() => {
    return data?.milestones?.filter((m) => m.domain === currentDomainKey) || []
  }, [data, currentDomainKey])

  const totalMilestones = data?.milestones?.length || 0
  const answeredCount = Object.keys(answers).length
  const progressPercent = totalMilestones ? Math.round((answeredCount / totalMilestones) * 100) : 0

  const currentTask = currentTasks[questionIndex] || currentTasks[0]

  const handleAnswer = (val) => {
    if (!currentTask) return
    setAnswers((prev) => ({ ...prev, [currentTask.id]: val }))
  }

  const handleNext = () => {
    if (questionIndex < currentTasks.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (domainIndex < domains.length - 1) {
      setDomainIndex((prev) => prev + 1)
      setQuestionIndex(0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      finishScreening()
    }
  }

  const handlePrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1)
    } else if (domainIndex > 0) {
      const prevDomainIndex = domainIndex - 1
      const prevDomainKey = domains[prevDomainIndex]
      const prevDomainTasks = data?.milestones?.filter((m) => m.domain === prevDomainKey) || []
      setDomainIndex(prevDomainIndex)
      setQuestionIndex(Math.max(0, prevDomainTasks.length - 1))
    }
  }

  const finishScreening = () => {
    const payload = {
      child_id: currentChild.id,
      checkpoint_age_months: data.checkpoint_age_months,
      milestone_dataset_version: data.dataset_version,
      client_submission_id: crypto.randomUUID(),
      answers: data.milestones.map(({ id }) => ({
        milestone_id: id,
        response: answers[id] || 'UNSURE'
      })),
      screened_at: new Date().toISOString()
    }

    setPendingPayload(payload)
    setReviewing(true)
  }

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
        subtitle="Select a child to begin age-based milestone screening"
        actions={
          <Button variant="primary" size="sm" onClick={() => onNavigate?.('register')}>
            <Icon name="plus" className="h-4 w-4" />
            <span>Register Child</span>
          </Button>
        }
      >
        <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-5">
          <SparshBotanicalCorner position="top-right" className="opacity-30" />

          {/* Search bar */}
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6660]" />
            <input
              type="search"
              value={cohortSearch}
              onChange={(e) => setCohortSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="h-11 w-full rounded-xl border border-[#E5EBE7] bg-white pl-10 pr-4 text-sm text-[#1A201E] placeholder:text-[#8E9C95] focus:border-[#1B4D3E] focus:outline-none transition shadow-2xs"
            />
          </div>

          {loadingCohort ? (
            <LoadingState label="Loading registered children..." />
          ) : cohortError ? (
            <ErrorState error={cohortError} onRetry={fetchCohort} />
          ) : filteredCohort.length === 0 ? (
            <div className="rounded-2xl border border-[#E5EBE7] bg-white p-8 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2EE] text-[#1B4D3E] mb-3">
                <Icon name="children" className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-[#1A201E]">No children registered yet</h3>
              <p className="mt-1 text-xs text-[#5A6660] max-w-sm mx-auto">
                Developmental screening requires a registered child profile with a verified date of birth.
              </p>
              <div className="mt-5">
                <Button variant="primary" onClick={() => onNavigate?.('register')}>
                  <Icon name="plus" className="h-4 w-4 mr-1.5" />
                  <span>Register Child</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#5A6660] px-1">
                <span>Select a child to begin observation</span>
                <span>{filteredCohort.length} registered</span>
              </div>
              {filteredCohort.map((child) => {
                const ageText = child.age_months !== null && child.age_months !== undefined
                  ? `${Math.floor(child.age_months / 12)} years ${child.age_months % 12} months`
                  : 'Age not logged'
                const sexText = child.sex ? ` · ${child.sex}` : ''

                return (
                  <div
                    key={child.id}
                    onClick={() => setCurrentChild(child)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E5EBE7] bg-white p-3.5 shadow-2xs transition hover:border-[#1B4D3E]/30 hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
                        {child.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1A201E]">{child.name}</h4>
                        <p className="text-xs text-[#5A6660]">{ageText}{sexText}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {child.latest_risk && (
                        <BadgePill
                          tone={
                            child.latest_risk === 'RED'
                              ? 'risk'
                              : child.latest_risk === 'YELLOW'
                              ? 'followup'
                              : 'normal'
                          }
                        >
                          {child.latest_risk === 'RED'
                            ? 'At Risk'
                            : child.latest_risk === 'YELLOW'
                            ? 'Follow Up'
                            : 'Normal'}
                        </BadgePill>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentChild(child)
                        }}
                        className="rounded-xl bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#143D31] transition"
                      >
                        Start
                      </button>
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

  // Loading questions state
  if (!data && !error) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="dashboard" title="Child Development Screening">
        <div className="mx-auto max-w-xl p-8">
          <LoadingState label={`Loading milestone questions for ${currentChild?.name || 'child'}...`} />
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="dashboard" title="Child Development Screening">
        <div className="mx-auto max-w-xl p-8">
          <ErrorState error={error} onRetry={load} />
        </div>
      </AppLayout>
    )
  }

  // Review step before submitting to AV assessment / backend
  if (reviewing && pendingPayload) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title="Review Screening Responses"
        subtitle={`${currentChild?.name || 'Child'} · ${pendingPayload.checkpoint_age_months} month checkpoint`}
      >
        <div className="relative mx-auto max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">
          <SparshBotanicalCorner position="top-right" className="opacity-25" />

          <div className="rounded-2xl border border-[#CBD5D0] bg-[#EBF2EE]/60 p-4 text-xs text-[#1A201E] leading-relaxed">
            Review every response before continuing. Scoring and diagnostic risk evaluations are calculated by the backend upon completion.
          </div>

          {domains.map((domain) => {
            const meta = domainMeta[domain] || { label: domain, icon: 'activity' }
            const domainMilestones = data.milestones.filter((item) => item.domain === domain)

            return (
              <section key={domain} className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E5EBE7] pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FDF0EB] text-[#D96B43]">
                    <Icon name={meta.icon || 'activity'} className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-[#1A201E]">{meta.label}</h2>
                </div>

                <ul className="space-y-2.5">
                  {domainMilestones.map((item) => {
                    const text = item.task || item.question || item.description || item.label || 'Question'
                    const ans = answers[item.id]

                    return (
                      <li key={item.id} className="flex items-start justify-between gap-3 text-xs border-b border-neutral-100 last:border-0 pb-2">
                        <span className="text-[#5A6660]">{text}</span>
                        <BadgePill
                          tone={
                            ans === 'YES'
                              ? 'normal'
                              : ans === 'NO'
                              ? 'risk'
                              : 'followup'
                          }
                        >
                          {ans === 'YES' ? 'Yes' : ans === 'NO' ? 'No' : ans || 'Unanswered'}
                        </BadgePill>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => setReviewing(false)}>
              Edit Responses
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setPendingScreening?.(pendingPayload)
                sessionStorage.setItem('sparsh:pending-screening', JSON.stringify(pendingPayload))
                clearDraft()
                onNavigate('av-assessment')
              }}
            >
              Continue to Sensory & AI Assessment →
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const currentAnswer = currentTask ? answers[currentTask.id] : null
  const meta = domainMeta[currentDomainKey] || { label: currentDomainKey, icon: 'activity' }
  const ageDisplay = currentChild?.age_months !== null && currentChild?.age_months !== undefined
    ? `${Math.floor(currentChild.age_months / 12)} years ${currentChild.age_months % 12} months`
    : `${data?.current_age_months || '—'} months`
  const childSex = currentChild?.sex || 'Child'

  const options = [
    { label: 'Yes (Achieved)', value: 'YES' },
    { label: 'Unsure / Sometimes', value: 'UNSURE' },
    { label: 'No (Not Yet)', value: 'NO' },
    { label: 'Not Observed', value: 'NOT_OBSERVED' }
  ]

  const isLastQuestion = domainIndex === domains.length - 1 && questionIndex === currentTasks.length - 1
  const taskPrompt = currentTask?.task || currentTask?.question || currentTask?.description || currentTask?.label || 'Does the child demonstrate expected milestones?'

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Child Development Screening"
      subtitle="Age-based milestone questions"
      actions={
        <button
          type="button"
          onClick={() => onNavigate?.('report')}
          className="rounded-full p-2 text-[#5A6660] hover:bg-[#EBF2EE] hover:text-[#1B4D3E] transition"
          title="Screening Protocol Notes"
        >
          <Icon name="report" className="h-5 w-5" />
        </button>
      }
    >
      <div className="relative mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-5">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Child Profile Bar (Matches Screen 6) */}
        <div className="flex items-center justify-between rounded-2xl border border-[#E5EBE7] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-sm">
              {currentChild.name?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1A201E]">{currentChild.name}</h2>
              <p className="text-xs text-[#5A6660]">{ageDisplay} · {childSex}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentChild(null)}
            className="text-xs font-semibold text-[#729082] hover:text-[#1B4D3E] transition"
          >
            Change
          </button>
        </div>

        {/* Progress: 2 of 5 & 40% (Matches Screen 6) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5A6660]">
            <span>{domainIndex + 1} of {domains.length} ({meta.label})</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5EBE7]">
            <div
              className="h-full rounded-full bg-[#1B4D3E] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Domain Heading Bar: Icon + Gross Motor Skills + Q2/10 (Matches Screen 6) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A201E]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FDF0EB] text-[#D96B43]">
              <Icon name={meta.icon || 'activity'} className="h-4 w-4" />
            </span>
            <span>{meta.label}</span>
          </div>
          <span className="rounded-full bg-[#F5F8F6] px-2.5 py-0.5 text-xs font-medium text-[#5A6660] border border-[#E5EBE7]">
            Q{questionIndex + 1} / {currentTasks.length}
          </span>
        </div>

        {/* Question Prompt (Matches Screen 6) */}
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-5">
          <h3 className="text-base font-semibold text-[#1A201E] leading-snug">
            {taskPrompt}
          </h3>

          {/* Radio Options List (Matches Screen 6) */}
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = currentAnswer === opt.value

              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-[#1B4D3E] bg-[#EBF2EE]/40 text-[#1A201E]'
                      : 'border-[#E5EBE7] bg-white text-[#1A201E] hover:border-[#729082]/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
                      isSelected
                        ? 'bg-[#1B4D3E] text-white'
                        : 'border border-[#CBD5D0] bg-white'
                    }`}
                  >
                    {isSelected && <Icon name="check" className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Stepper / Domain Dots */}
        {currentTasks.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-1">
            {currentTasks.map((t, idx) => {
              const isCurrent = idx === questionIndex
              const isAnswered = Boolean(answers[t.id])

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQuestionIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'w-6 bg-[#1B4D3E]'
                      : isAnswered
                      ? 'w-2 bg-[#729082]'
                      : 'w-2 bg-[#E5EBE7]'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              )
            })}
          </div>
        )}

        {/* Navigation Buttons (Matches Screen 6: ← Previous and Next →) */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={domainIndex === 0 && questionIndex === 0}
            className="w-32"
          >
            ← Previous
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            className="w-32"
          >
            {isLastQuestion ? 'Review & Submit →' : 'Next →'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
