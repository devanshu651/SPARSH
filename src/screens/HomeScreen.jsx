import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/AppLayout'
import BadgePill from '../components/BadgePill'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { centresApi, childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'

function AnganwadiWorkerVisual({ className = 'h-24 w-24 sm:h-28 sm:w-28' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Anganwadi frontline healthcare worker"
    >
      {/* Background Soft Sage Halo & Botanical Leaf */}
      <circle cx="65" cy="65" r="50" fill="#EBF2EE" />
      <path
        d="M85 20C95 30 105 50 95 70C80 55 75 40 85 20Z"
        fill="#A9C7B5"
        fillOpacity="0.5"
      />
      <circle cx="35" cy="85" r="8" fill="#FDF0EB" />

      {/* Hair Bun & Jasmine Flowers */}
      <circle cx="68" cy="34" r="14" fill="#1A201E" />
      <circle cx="56" cy="36" r="15" fill="#1A201E" />
      <circle cx="74" cy="28" r="3.5" fill="#FFFFFF" />
      <circle cx="78" cy="33" r="3" fill="#FFFFFF" />

      {/* Face & Bindi */}
      <circle cx="58" cy="45" r="12" fill="#C87A54" />
      <circle cx="61" cy="42" r="1.5" fill="#D32F2F" />

      {/* Saree & Torso */}
      <path
        d="M38 72C30 85 28 108 30 120H95C96 108 92 88 82 72C70 66 50 66 38 72Z"
        fill="#D96B43"
      />
      {/* Dark Forest Green Saree Border */}
      <path
        d="M44 72L58 120H72L54 70C50 70 46 71 44 72Z"
        fill="#1B4D3E"
      />

      {/* Tablet / Case Notes */}
      <rect x="42" y="78" width="28" height="24" rx="3" fill="#1A201E" />
      <rect x="45" y="81" width="22" height="18" rx="1.5" fill="#FFFFFF" />
      <rect x="48" y="85" width="12" height="2" rx="1" fill="#1B4D3E" />
      <rect x="48" y="89" width="16" height="2" rx="1" fill="#729082" />
      <rect x="48" y="93" width="10" height="2" rx="1" fill="#D96B43" />

      {/* Worker Hands holding tablet */}
      <circle cx="42" cy="90" r="4.5" fill="#C87A54" />
      <circle cx="70" cy="90" r="4.5" fill="#C87A54" />
    </svg>
  )
}

export default function HomeScreen({ onNavigate }) {
  const { t } = useTranslation()
  const { currentWorker, setCurrentChild } = useApp()
  const [centres, setCentres] = useState([])
  const [children, setChildren] = useState([])
  const [state, setState] = useState('idle')
  const [error, setError] = useState(null)

  const navigate = (screen) => onNavigate?.(screen)

  useEffect(() => {
    let active = true
    const load = async () => {
      setState('loading')
      setError(null)
      try {
        const [centreList, childList] = await Promise.all([centresApi.list(), childrenApi.list()])
        if (active) {
          setCentres(centreList)
          setChildren(childList)
          setState('idle')
        }
      } catch (e) {
        if (active) {
          setError(e)
          setState('error')
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const childrenList = children || []

  const { screenedCount, atRiskCount, moderateCount, onTrackCount, recentActivity } = useMemo(() => {
    const screened = childrenList.filter((c) => !!c.latest_risk)
    const atRisk = childrenList.filter((c) => c.latest_risk === 'RED')
    const moderate = childrenList.filter((c) => c.latest_risk === 'YELLOW')
    const onTrack = childrenList.filter((c) => c.latest_risk === 'GREEN')
    const recent = childrenList
      .slice()
      .sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
      .slice(0, 5)

    return {
      screenedCount: screened.length,
      atRiskCount: atRisk.length,
      moderateCount: moderate.length,
      onTrackCount: onTrack.length,
      recentActivity: recent
    }
  }, [childrenList])

  const assignedCentre = useMemo(() => {
    const ids = currentWorker?.centre_ids || []
    if (!ids.length) return null
    return centres.find((centre) => ids.includes(centre.id))
  }, [centres, currentWorker?.centre_ids])

  const workerFullName = currentWorker?.name || 'Healthcare Worker'
  const workerFirstName = workerFullName.split(' ')[0]
  const isAdmin = currentWorker?.role === 'admin'

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.greetingMorning')
    if (hour < 17) return t('dashboard.greetingAfternoon')
    return t('dashboard.greetingEvening')
  }, [t])

  const handleSelectChild = (child) => {
    setCurrentChild(child)
    if (child.latest_risk) {
      onNavigate?.('child-profile')
    } else {
      onNavigate?.('screening')
    }
  }

  const completionRate = childrenList.length > 0
    ? Math.round((screenedCount / childrenList.length) * 100)
    : 0

  return (
    <AppLayout active="dashboard" onNavigate={onNavigate}>
      {state === 'loading' ? (
        <div className="py-12">
          <LoadingState label="Loading dashboard data…" />
        </div>
      ) : state === 'error' ? (
        <div className="py-12">
          <ErrorState error={error} onRetry={() => window.location.reload()} />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 pb-8 max-w-6xl mx-auto">

          {/* ============================================================== */}
          {/* 1. GREETING HERO CARD (LEFT: TEXT, RIGHT: INTEGRATED WORKER VISUAL) */}
          {/* ============================================================== */}
          <section className="relative overflow-hidden rounded-2xl bg-white border border-[#D5DDD7] p-5 sm:p-6 shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)]">
            <div className="flex items-center justify-between gap-4 relative z-10">
              {/* Left: Greeting Text */}
              <div className="space-y-1 max-w-md">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A201E] tracking-tight font-heading leading-tight">
                  {greeting}, <br />
                  <span className="text-[#1A201E]">{workerFirstName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#5A6660] leading-relaxed pt-0.5">
                  {assignedCentre
                    ? `${assignedCentre.name}, ${assignedCentre.district || ''}`.trim().replace(/,\s*$/, '')
                    : isAdmin
                    ? t('nav.adminConsole')
                    : t('dashboard.defaultSubtitle')}
                </p>
              </div>

              {/* Right: Integrated Anganwadi Worker Visual */}
              <div className="shrink-0 flex items-center justify-center">
                <AnganwadiWorkerVisual className="h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xs" />
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 2. ACTION CARDS (START SCREENING, REGISTER CHILD, VIEW CHILDREN) */}
          {/* ============================================================== */}
          <section className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3.5`}>
            {/* Card 1: Start Screening (Solid Dark Forest Green) */}
            <div
              onClick={() => onNavigate?.('screening')}
              className="group cursor-pointer rounded-2xl bg-[#1B4D3E] border border-[#164134] text-white p-5 shadow-[0_2px_5px_0_rgba(20,38,30,0.15),0_1px_2px_0_rgba(20,38,30,0.10)] hover:bg-[#143D31] hover:border-[#0F2D24] transition-all flex flex-col justify-between min-h-[135px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Icon name="screening" className="h-5 w-5" />
                </div>
                <span className="text-white text-lg font-bold group-hover:translate-x-1 transition-transform">
                  ›
                </span>
              </div>

              <div className="mt-3">
                <h2 className="text-base font-bold text-white font-heading">
                  {t('dashboard.startScreening')}
                </h2>
                <p className="mt-0.5 text-xs text-[#D2E3D8] leading-relaxed">
                  {t('dashboard.startScreeningDesc')}
                </p>
              </div>
            </div>

            {/* Card 2: Register Child (White with Warm Terracotta Accent) */}
            <div
              onClick={() => onNavigate?.('register')}
              className="group cursor-pointer rounded-2xl bg-white border border-[#D5DDD7] text-[#1A201E] p-5 shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] hover:border-[#B2C2B8] hover:bg-[#F9FBFA] transition-all flex flex-col justify-between min-h-[135px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF0EB] text-[#D96B43]">
                  <Icon name="userPlus" className="h-5 w-5" />
                </div>
                <span className="text-[#8E9C95] text-lg font-bold group-hover:translate-x-1 transition-transform">
                  ›
                </span>
              </div>

              <div className="mt-3">
                <h2 className="text-base font-bold text-[#1A201E] font-heading">
                  {t('dashboard.registerChild')}
                </h2>
                <p className="mt-0.5 text-xs text-[#5A6660] leading-relaxed">
                  {t('dashboard.registerChildDesc')}
                </p>
              </div>
            </div>

            {/* Card 3: View Children (White with Muted Sage Accent) */}
            <div
              onClick={() => onNavigate?.('children')}
              className={`group cursor-pointer rounded-2xl bg-white border border-[#D5DDD7] text-[#1A201E] p-5 shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] hover:border-[#B2C2B8] hover:bg-[#F9FBFA] transition-all flex flex-col justify-between min-h-[135px] ${!isAdmin ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="children" className="h-5 w-5" />
                </div>
                <span className="text-[#8E9C95] text-lg font-bold group-hover:translate-x-1 transition-transform">
                  ›
                </span>
              </div>

              <div className="mt-3">
                <h2 className="text-base font-bold text-[#1A201E] font-heading">
                  {t('dashboard.viewChildren')}
                </h2>
                <p className="mt-0.5 text-xs text-[#5A6660] leading-relaxed">
                  {t('dashboard.viewChildrenDesc')}
                </p>
              </div>
            </div>

            {/* Card 4 (Optional Admin): Admin Console */}
            {isAdmin && (
              <div
                onClick={() => onNavigate?.('admin-console')}
                className="group cursor-pointer rounded-2xl bg-white border border-[#D5DDD7] text-[#1A201E] p-5 shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] hover:border-[#B2C2B8] hover:bg-[#F9FBFA] transition-all flex flex-col justify-between min-h-[135px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F8F6] text-[#1B4D3E]">
                    <Icon name="settings" className="h-5 w-5" />
                  </div>
                  <span className="text-[#8E9C95] text-lg font-bold group-hover:translate-x-1 transition-transform">
                    ›
                  </span>
                </div>

                <div className="mt-3">
                  <h2 className="text-base font-bold text-[#1A201E] font-heading">
                    {t('dashboard.adminConsole')}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#5A6660] leading-relaxed">
                    {t('dashboard.adminConsoleDesc')}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ============================================================== */}
          {/* 3. COHORT PROGRESS / SURVEILLANCE METRICS STRIP               */}
          {/* ============================================================== */}
          <section className="rounded-2xl border border-[#D5DDD7] bg-white p-4 sm:p-5 shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660]">
                  {t('dashboard.milestoneCoverage')}
                </h3>
                <p className="text-sm font-semibold text-[#1A201E] mt-0.5">
                  {t('dashboard.screenedOf', { screened: screenedCount, total: childrenList.length, rate: completionRate })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('analytics')}
                className="text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                {t('dashboard.analyticsLink')}
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#EBF0EC]">
              <div
                className="h-full rounded-full bg-[#1B4D3E] transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            {/* 4 Clean Metric Badges with subtle divider and clearer boundaries */}
            <div className="pt-2 border-t border-[#EBF0EC]">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-[#D2DDD6] bg-[#F4F8F5] py-2 px-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                  <span className="text-[10px] font-bold uppercase text-[#5A6660]">{t('common.total')}</span>
                  <p className="text-base font-bold text-[#1A201E] leading-tight mt-0.5">{childrenList.length}</p>
                </div>
                <div className="rounded-xl border border-[#B4DEC7] bg-[#EAF6EF] py-2 px-1 shadow-[0_1px_2px_rgba(45,122,88,0.05)]">
                  <span className="text-[10px] font-bold uppercase text-[#2D7A58]">{t('common.normal')}</span>
                  <p className="text-base font-bold text-[#2D7A58] leading-tight mt-0.5">{onTrackCount}</p>
                </div>
                <div className="rounded-xl border border-[#F2C5B5] bg-[#FDF3EE] py-2 px-1 shadow-[0_1px_2px_rgba(217,107,67,0.05)]">
                  <span className="text-[10px] font-bold uppercase text-[#D96B43]">{t('common.followUp')}</span>
                  <p className="text-base font-bold text-[#D96B43] leading-tight mt-0.5">{moderateCount}</p>
                </div>
                <div className="rounded-xl border border-[#F4B4B4] bg-[#FDEAEA] py-2 px-1 shadow-[0_1px_2px_rgba(211,47,47,0.05)]">
                  <span className="text-[10px] font-bold uppercase text-[#D32F2F]">{t('common.atRisk')}</span>
                  <p className="text-base font-bold text-[#D32F2F] leading-tight mt-0.5">{atRiskCount}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 4. RECENT ACTIVITY                                             */}
          {/* ============================================================== */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-[#1A201E] font-heading">
                {t('dashboard.recentActivity')}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate?.('children')}
                className="text-xs font-bold text-[#D96B43] hover:underline"
              >
                {t('common.viewAll')}
              </button>
            </div>

            {/* Empty state when no activity */}
            {childrenList.length === 0 ? (
              <div className="rounded-2xl border border-[#D5DDD7] bg-white p-6 text-center shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] space-y-2">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2F6F3] text-[#729082]">
                  <Icon name="report" className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A201E]">
                  {t('dashboard.noRecentActivity')}
                </h3>
                <p className="text-xs text-[#5A6660] max-w-xs mx-auto">
                  {t('dashboard.noRecentActivityDesc')}
                </p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={() => onNavigate?.('register')}>
                    <Icon name="plus" className="h-3.5 w-3.5 mr-1" />
                    <span>{t('dashboard.registerFirstChild')}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#D5DDD7] bg-white divide-y divide-[#EBF0EC] shadow-[0_1px_3px_0_rgba(20,38,30,0.06),0_1px_2px_-1px_rgba(20,38,30,0.04)] overflow-hidden">
                {recentActivity.map((child) => {
                  const tone =
                    child.latest_risk === 'RED'
                      ? 'risk'
                      : child.latest_risk === 'YELLOW'
                      ? 'followup'
                      : child.latest_risk === 'GREEN'
                      ? 'normal'
                      : 'neutral'

                  const label =
                    child.latest_risk === 'RED'
                      ? t('screening.status.followUp')
                      : child.latest_risk === 'YELLOW'
                      ? t('screening.status.observation')
                      : child.latest_risk === 'GREEN'
                      ? t('screening.status.noConcern')
                      : t('common.pending')

                  const ageText = child.age_months !== null && child.age_months !== undefined
                    ? `${Math.floor(child.age_months / 12)}y ${child.age_months % 12}m`
                    : t('dashboard.ageNotLogged')

                  return (
                    <div
                      key={child.id}
                      onClick={() => handleSelectChild(child)}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F6FAF7] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDF0EB] text-[#D96B43] font-bold text-xs">
                          {child.name?.charAt(0) || 'C'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#1A201E] truncate">
                            {child.name || 'Unnamed Child'}
                          </h4>
                          <p className="text-[11px] text-[#5A6660] truncate">
                            {ageText}{child.sex ? ` · ${child.sex}` : ''} · ID: {child.child_identifier || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <BadgePill tone={tone}>
                          {label}
                        </BadgePill>
                        <span className="text-sm font-bold text-[#8E9C95]">›</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </AppLayout>
  )
}
