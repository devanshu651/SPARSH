import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/AppLayout'
import ScreeningLanguageSelector from '../components/ScreeningLanguageSelector'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { screeningsApi, childrenApi } from '../services/api'
import { cacheMilestones, clearDraft, getCachedMilestones, loadDraft, saveDraft } from '../services/offline'
import { useApp } from '../context/AppContext'
import { registerMilestoneTranslations } from '../locales/i18n'

export default function ScreeningScreen({ onNavigate }) {
  const { t, i18n } = useTranslation()
  const { currentChild, setCurrentChild, setPendingScreening } = useApp()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [domainIndex, setDomainIndex] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)

  const handleSelectChildForScreening = (child) => {
    setCurrentChild(child)
  }

  const load = async () => {
    if (!currentChild) return
    setError(null)
    try {
      const mCall = screeningsApi.milestones(currentChild.id)
      const result = typeof mCall === 'function' ? await mCall(currentChild.id) : await mCall
      registerMilestoneTranslations(result?.milestones, i18n)
      cacheMilestones(currentChild.id, result)
      setData(result)
    } catch {
      const cached = getCachedMilestones(currentChild.id)
      if (cached) {
        registerMilestoneTranslations(cached?.milestones, i18n)
        setData(cached)
        setError(new Error(t('screening.offlineCached', { defaultValue: t('screening.loadError') })))
      } else {
        setError(new Error(t('screening.loadError')))
      }
    }
  }

  useEffect(() => {
    setData(null)
    setAnswers({})
    setDomainIndex(0)
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

    const payload = {
      child_id: currentChild.id,
      checkpoint_age_months: data.checkpoint_age_months,
      milestone_dataset_version: data.dataset_version,
      client_submission_id: crypto.randomUUID(),
      answers: data.milestones.map(({ id }) => ({
        milestone_id: id,
        response: answers[id]
      })),
      screened_at: new Date().toISOString()
    }

    setPendingPayload(payload)
    setReviewing(true)
  }

  // Cohort state for child selection precondition
  const [cohort, setCohort] = useState([])
  const [loadingCohort, setLoadingCohort] = useState(false)
  const [cohortError, setCohortError] = useState(null)
  const [cohortSearch, setCohortSearch] = useState('')

  const language = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]
  useEffect(() => {
    if (data?.milestones) {
      registerMilestoneTranslations(data.milestones, i18n)
    }
  }, [data, i18n])

  const missingTranslation = useMemo(() => {
    if (data?.milestones) {
      registerMilestoneTranslations(data.milestones, i18n)
    }
    return data?.milestones?.find((item) => {
      const value = i18n.getResource(language, 'translation', `screeningQuestions.${item.id}.${language}`)
      return typeof value !== 'string' || !value.trim()
    })
  }, [data, i18n, language])
  const questionText = (item) => i18n.getResource(language, 'translation', `screeningQuestions.${item.id}.${language}`) || item.question || item.description
  const domainLabel = (domain) => t(`screening.domains.${domain}`, { defaultValue: domain })
  const answerLabel = (response) => t(`screening.${response.toLowerCase()}`)

  useEffect(() => {
    if (!currentChild) {
      setLoadingCohort(true)
      setCohortError(null)
      const fetchCohort = async () => {
        try {
          const fn = childrenApi.list()
          const res = typeof fn === 'function' ? await fn() : await fn
          setCohort(Array.isArray(res) ? res : [])
        } catch (error) {
          setCohortError(error)
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
        title={t('screening.title')}
        subtitle={t('screening.subtitle')}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate?.('register')}
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>{t('screening.registerNewChild')}</span>
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
                    {t('screening.screeningWorkflow')}
                  </span>
                  <span className="text-xs text-primary-200">
                    {t('screening.developmentalScreening')}
                  </span>
                </div>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {t('screening.title')}
                </h1>
                <p className="mt-1 text-xs text-primary-100/90 sm:text-sm max-w-2xl leading-relaxed">
                  {t('screening.intro')}
                </p>
              </div>

              <ScreeningLanguageSelector />

              <Button
                variant="teal"
                onClick={() => onNavigate?.('register')}
                className="shrink-0"
              >
                <Icon name="plus" className="h-4 w-4" />
                <span>{t('screening.registerNewChild')}</span>
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
                <h3 className="text-sm font-bold text-neutral-900">{t('screening.childAndAge')}</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                {t('screening.childAndAgeDetail')}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
                  2
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{t('screening.fiveDomains')}</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                {t('screening.fiveDomainsDetail')}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-xs font-bold text-amber-800">
                  3
                </div>
                <h3 className="text-sm font-bold text-neutral-900">{t('screening.followUp')}</h3>
              </div>
              <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                {t('screening.followUpDetail')}
              </p>
            </div>
          </section>

          {/* CHILD SELECTION AREA */}
          <section className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">{t('screening.selectChild')}</h2>
                <p className="text-xs text-neutral-500">
                  {t('screening.childrenCount', { count: cohort.length })}
                </p>
              </div>

              {cohort.length > 0 && (
                <div className="relative w-full sm:w-72">
                  <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="search"
                    value={cohortSearch}
                    onChange={(e) => setCohortSearch(e.target.value)}
                    placeholder={t('screening.searchChildren')}
                    className="h-9 w-full rounded-lg border border-neutral-300 bg-neutral-50/50 pl-9 pr-3 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-700 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {loadingCohort ? (
              <LoadingState label={t('screening.loadingChildren')} />
            ) : cohortError ? (
              <ErrorState error={new Error(t('screening.loadError'))} title={t('screening.loadError')} retryLabel={t('screening.retry')} onRetry={() => {
                setLoadingCohort(true)
                setCohortError(null)
                childrenApi.list().then((items) => setCohort(Array.isArray(items) ? items : [])).catch(setCohortError).finally(() => setLoadingCohort(false))
              }} />
            ) : cohort.length === 0 ? (
              <EmptyState
                title={t('screening.noChildren')}
                detail={t('screening.noChildrenDetail')}
                icon="children"
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <Button
                      variant="primary"
                      onClick={() => onNavigate?.('register')}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                      <span>{t('screening.registerChild')}</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => onNavigate?.('dashboard')}
                    >
                      {t('screening.returnDashboard')}
                    </Button>
                  </div>
                }
              />
            ) : filteredCohort.length === 0 ? (
              <EmptyState
                title={t('screening.noMatchingChildren')}
                detail={t('screening.adjustSearch')}
                icon="search"
                action={
                  <Button variant="secondary" size="sm" onClick={() => setCohortSearch('')}>
                    {t('screening.clearSearch')}
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
                      ? t('screening.highRisk')
                      : child.latest_risk === 'YELLOW'
                      ? t('screening.moderateRisk')
                      : child.latest_risk === 'GREEN'
                      ? t('screening.onTrack')
                      : t('screening.screeningDue')

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
                                {child.name || t('screening.unnamedChild')}
                              </h4>
                              <p className="text-[11px] text-neutral-500">
                                {child.age_months !== null && child.age_months !== undefined
                                  ? `${child.age_months}m`
                                  : t('screening.ageNotRecorded')}
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
                            <span className="text-neutral-400">{t('screening.childId')}:</span>{' '}
                            <span className="font-medium text-neutral-700">{child.child_identifier || '—'}</span>
                          </p>
                          <p className="truncate">
                            <span className="text-neutral-400">{t('screening.guardian')}:</span>{' '}
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
                          <span>{t('screening.selectAndStart')}</span>
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
                <h4 className="font-bold text-neutral-900">{t('screening.whatNext')}</h4>
                <p className="mt-1">
                  {t('screening.whatNextDetail')}
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
        title={t('screening.title')}
        subtitle={t('screening.loadingQuestions', { name: currentChild?.name || t('screening.child') })}
      >
        <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
          <ScreeningLanguageSelector />
          <LoadingState label={t('screening.loadingQuestions', { name: currentChild?.name || t('screening.child') })} />
        </div>
      </AppLayout>
    )
  }

  if (!data) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title={t('screening.title')}
        subtitle={t('screening.loadError')}
      >
        <div className="mx-auto max-w-lg p-6">
          <div className="space-y-4">
            <ScreeningLanguageSelector />
            <ErrorState error={new Error(t('screening.loadError'))} title={t('screening.loadError')} retryLabel={t('screening.retry')} onRetry={load} />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (missingTranslation) {
    const languageName = ({ en: 'English', hi: 'हिन्दी', mr: 'मराठी' })[language] || language
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="dashboard" title={t('screening.title')} subtitle={t('screening.loadError')}>
        <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
          <ScreeningLanguageSelector />
          <ErrorState error={new Error(t('screening.validationMissing', { id: missingTranslation.id, language: languageName }))} title={t('screening.loadError')} />
        </div>
      </AppLayout>
    )
  }

  if (data.milestones.length === 0) {
    return (
      <AppLayout
        active="screening"
        onNavigate={onNavigate}
        backTo="dashboard"
        title={t('screening.coverageTitle')}
        subtitle={`${currentChild?.name || 'Child'} · ${data.current_age_months} months`}
      >
        <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
          <ScreeningLanguageSelector />
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <p>{t('screening.noQuestions')}</p>
            <p className="mt-2 text-xs text-neutral-600">{t('screening.prototypeDisclaimer')}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (reviewing && pendingPayload) {
    return (
      <AppLayout active="screening" onNavigate={onNavigate} backTo="dashboard" title={t('screening.reviewAnswers')} subtitle={t('screening.reviewCheckpoint', { name: currentChild?.name || t('screening.child'), age: pendingPayload.checkpoint_age_months })}>
        <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
          <ScreeningLanguageSelector />
          <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{t('screening.reviewPrompt')}</p>
          {domains.map((domain) => (
            <section key={domain} className="rounded-xl border border-neutral-200 bg-white p-4">
              <h2 className="mb-3 font-bold text-neutral-900">{domainLabel(domain)}</h2>
              <ul className="space-y-2">
                {data.milestones.filter((item) => item.domain === domain).map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 border-t border-neutral-100 pt-2 text-sm">
                  <span>{questionText(item)}</span><strong className="shrink-0">{answerLabel(answers[item.id])}</strong>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => setReviewing(false)}>{t('screening.editAnswers')}</Button>
            <Button variant="primary" onClick={() => {
              setPendingScreening?.(pendingPayload)
              sessionStorage.setItem('sparsh:pending-screening', JSON.stringify(pendingPayload))
              clearDraft()
              onNavigate('av-assessment')
            }}>{t('screening.continue')}</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="screening"
      onNavigate={onNavigate}
      backTo="dashboard"
      title={t('screening.title')}
      subtitle={t('screening.subtitle')}
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

        <div className="flex justify-end">
          <ScreeningLanguageSelector />
        </div>

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
                  <BadgePill tone="teal">{data.current_age_months} {t('screening.months')}</BadgePill>
                </div>
                <p className="text-xs text-neutral-500">
                  {t('screening.childId')}: {currentChild?.child_identifier || t('screening.notRecorded')} · {data.age_band?.label || `${data.checkpoint_age_months} ${t('screening.months')}`} · {totalMilestones} {t('screening.question')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-900">
                  {answeredCount} / {totalMilestones} {t('screening.completed')}
                </span>
                <p className="text-[11px] text-neutral-500">{t('screening.progress')}: {progressPercent}%</p>
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

        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600">{t('screening.prototypeDisclaimer')}</p>

        {data.coverage?.shortfall > 0 && (
          <div role="status" aria-live="polite" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">
              {t('screening.ageCoverage', { available: totalMilestones, target: data.coverage.target_question_count })}
              {' '}{t('screening.coverageShortfall', { count: data.coverage.shortfall })}
            </p>
            {data.coverage.missing_domains?.length > 0 && (
              <p className="mt-1">
                {t('screening.domainsNotAssessed')} {data.coverage.missing_domains.map((key) => domainLabel(key)).join(', ')}.
              </p>
            )}
          </div>
        )}

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
                <span>{domainLabel(dKey)}</span>
              </button>
            )
          })}
        </div>

        {/* ACTIVE DOMAIN HEADING */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {t('screening.domain')} {domainIndex + 1} {t('screening.of')} {domains.length}
              </span>
              <span className="text-xs text-neutral-400">
                {currentTasks.filter((task) => answers[task.id]).length} {t('screening.of')} {currentTasks.length} {t('screening.answered')}
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-neutral-900">
              {domainLabel(currentDomainKey)}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {t(`screening.domainDescriptions.${currentDomainKey}`, { defaultValue: t('screening.domainDescriptions.default') })}
            </p>
          </div>

          {/* MILESTONE OBSERVATION QUESTIONS */}
          <div className="mt-6 space-y-4">
            {currentTasks.map((task, index) => {
              const currentAnswer = answers[task.id]
              const taskText = questionText(task)

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
                      <span className="mr-1.5 font-bold text-neutral-400">{t('screening.question')} {index + 1} {t('screening.of')} {currentTasks.length}.</span>
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
                        {t(`screening.${currentAnswer === 'YES' ? 'achieved' : currentAnswer === 'NO' ? 'notYet' : 'unsure'}`)}
                      </BadgePill>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-neutral-500">
                    {t('screening.caregiverNote')}
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
                      <span>{t('screening.yes')}</span>
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
                      <span>{t('screening.no')}</span>
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
                      <span>{t('screening.unsure')}</span>
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
              {t('screening.previous')}
            </Button>

            <Button
              variant="primary"
              disabled={!isCurrentDomainComplete}
              onClick={advance}
            >
              <span>
                {domainIndex === domains.length - 1
                  ? t('screening.continue')
                  : t('screening.next')}
              </span>
            </Button>
          </div>

          {!isCurrentDomainComplete && (
            <p className="mt-3 text-center text-xs font-medium text-amber-700">
              {t('screening.validationAllAnswered', { count: currentTasks.length })}
            </p>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
