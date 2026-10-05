import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'
import { ErrorState, LoadingState } from '../components/AsyncState'
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
  const { t } = useTranslation()
  const { currentChild, setCurrentChild } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [domainIndex, setDomainIndex] = useState(0)

  // Cohort state when no child is selected
  const [cohort, setCohort] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [cohortError, setCohortError] = useState(null)
  const [cohortSearch, setCohortSearch] = useState('')

  const load = async () => {
    if (!currentChild) return
    setError(null)
    try {
      const result = await screeningsApi.milestones(currentChild.id)
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
      const res = await childrenApi.list()
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

  // Per-question answer handler (takes task id and value)
  const handleAnswer = (id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  // ── Production-matching advance logic ─────────────────────────────────────
  // Unanswered questions in the CURRENT domain (gate for advancing)
  const domainUnanswered = currentTasks.filter((t) => !answers[t.id])
  // Total unanswered across ALL milestones (shown on last domain)
  const totalUnanswered = data?.milestones?.filter((m) => !answers[m.id]) || []
  const isLastDomain = domainIndex === domains.length - 1

  const advance = () => {
    // Block if current domain has unanswered questions
    if (domainUnanswered.length > 0) return

    if (domainIndex < domains.length - 1) {
      setDomainIndex((d) => d + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Last domain complete — build payload exactly matching production contract
    const payload = {
      child_id: currentChild.id,
      checkpoint_age_months: data.checkpoint_age_months,
      milestone_dataset_version: data.dataset_version,
      client_submission_id: crypto.randomUUID(),
      answers: data.milestones.map(({ id }) => ({
        milestone_id: id,
        response: answers[id]  // no silent UNSURE fallback — all answers enforced above
      })),
      screened_at: new Date().toISOString()
    }

    sessionStorage.setItem('sparsh:pending-screening', JSON.stringify(payload))
    clearDraft()
    onNavigate('av-assessment')
  }
  // ──────────────────────────────────────────────────────────────────────────

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

  // ── PRECONDITION VIEW: No child selected ──────────────────────────────────
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

  // ── Loading / Error states ─────────────────────────────────────────────────
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

  // ── Main question view ─────────────────────────────────────────────────────
  const meta = domainMeta[currentDomainKey] || { label: currentDomainKey, icon: 'activity' }
  const ageDisplay = currentChild?.age_months !== null && currentChild?.age_months !== undefined
    ? `${Math.floor(currentChild.age_months / 12)} years ${currentChild.age_months % 12} months`
    : `${data?.current_age_months || '—'} months`
  const childSex = currentChild?.sex || 'Child'

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title={t('screening.title')}
      subtitle={t('screening.subtitle')}
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

        {/* Child Profile Bar */}
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
            {t('screening.changeChild')}
          </button>
        </div>

        {/* Offline warning */}
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            {error.message || t('screening.workingOffline')}
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5A6660]">
            <span>
              {t('screening.domainOf', {
                current: domainIndex + 1,
                total: domains.length,
                domain: t(`screening.domains.${currentDomainKey}`, { defaultValue: meta.label })
              })}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5EBE7]">
            <div
              className="h-full rounded-full bg-[#1B4D3E] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Domain heading */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A201E]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FDF0EB] text-[#D96B43]">
              <Icon name={meta.icon || 'activity'} className="h-4 w-4" />
            </span>
            <span>{t(`screening.domains.${currentDomainKey}`, { defaultValue: meta.label })}</span>
          </div>
          <span className="rounded-full bg-[#F5F8F6] px-2.5 py-0.5 text-xs font-medium text-[#5A6660] border border-[#E5EBE7]">
            {currentTasks.length} {t(currentTasks.length !== 1 ? 'screening.questionsCount_other' : 'screening.questionsCount', { count: currentTasks.length })}
          </span>
        </div>

        {/* ── All questions for this domain (production: domain-at-a-time) ── */}
        <div className="space-y-4">
          {currentTasks.map((task) => {
            const answered = answers[task.id]
            const taskPrompt = task.task || task.question || task.description || task.label || 'Does the child demonstrate this milestone?'

            return (
              <article
                key={task.id}
                className={`rounded-2xl border bg-white p-5 shadow-2xs space-y-4 transition ${
                  !answered ? 'border-amber-300' : 'border-[#E5EBE7]'
                }`}
              >
                <p className="text-sm font-semibold text-[#1A201E] leading-snug">{taskPrompt}</p>

                {/* 3-option answer buttons — YES / NO / UNSURE (production contract) */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAnswer(task.id, 'YES')}
                    className={`min-h-11 rounded-xl border font-bold text-sm transition ${
                      answered === 'YES'
                        ? 'border-[#1B4D3E] bg-[#1B4D3E] text-white'
                        : 'border-[#C6E7D5] text-[#2D7A58] hover:bg-[#EBF2EE]'
                    }`}
                  >
                    {t('common.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswer(task.id, 'NO')}
                    className={`min-h-11 rounded-xl border font-bold text-sm transition ${
                      answered === 'NO'
                        ? 'border-[#C85A32] bg-[#C85A32] text-white'
                        : 'border-[#F7D4C8] text-[#C85A32] hover:bg-[#FDF0EB]'
                    }`}
                  >
                    {t('common.no')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswer(task.id, 'UNSURE')}
                    className={`min-h-11 rounded-xl border font-bold text-sm transition ${
                      answered === 'UNSURE'
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {t('common.unsure')}
                  </button>
                </div>

                {/* Per-question unanswered warning (production behavior) */}
                {!answered && (
                  <p className="text-xs text-amber-800 font-medium">{t('screening.responseRequired')}</p>
                )}
              </article>
            )
          })}
        </div>

        {/* Last-domain total unanswered count (production behavior) */}
        {isLastDomain && totalUnanswered.length > 0 && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 font-medium">
            {t(totalUnanswered.length === 1 ? 'screening.unansweredRemain' : 'screening.unansweredRemain_other', { count: totalUnanswered.length })}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={domainIndex === 0}
            onClick={() => {
              setDomainIndex((d) => d - 1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="w-32"
          >
            ← {t('common.back')}
          </Button>

          {/* Advance button — disabled until ALL current domain questions answered */}
          <Button
            variant="primary"
            onClick={advance}
            disabled={domainUnanswered.length > 0}
            className="w-44"
          >
            {isLastDomain ? t('screening.continueToAv') : t('screening.nextDomain')}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}

