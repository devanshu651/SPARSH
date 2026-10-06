import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'
import {
  SUPPORT_CATEGORIES,
  CONCERN_OPTIONS,
  HELP_TYPES,
  GOVERNMENT_SCHEMES,
  MAHARASHTRA_DISTRICTS,
  ACTION_STEPS_PHYSICAL_CONCERN
} from '../data/governmentSupport'

export default function GovernmentSupportScreen({ onNavigate }) {
  const { t } = useTranslation()
  const { currentChild, setCurrentChild } = useApp()

  // Finder state
  const [selectedConcern, setSelectedConcern] = useState('limb_difference') // Default highlighted real-world case
  const [customAgeMonths, setCustomAgeMonths] = useState('')
  const [hasDisabilityCert, setHasDisabilityCert] = useState('not_sure')
  const [hasUdid, setHasUdid] = useState('not_sure')
  const [selectedHelpType, setSelectedHelpType] = useState('all')

  // Search & category filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  const finderRef = useRef(null)

  // Derived child age
  const effectiveAgeMonths = useMemo(() => {
    if (customAgeMonths) {
      const parsed = parseInt(customAgeMonths, 10)
      if (!isNaN(parsed) && parsed >= 0) return parsed
    }
    if (currentChild?.date_of_birth) {
      const dob = new Date(currentChild.date_of_birth)
      const now = new Date()
      return Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth() - (now.getDate() < dob.getDate() ? 1 : 0))
    }
    if (currentChild?.age_months !== null && currentChild?.age_months !== undefined) {
      return currentChild.age_months
    }
    return null
  }, [customAgeMonths, currentChild?.date_of_birth, currentChild?.age_months])

  // Filtered schemes logic
  const filteredSchemes = useMemo(() => {
    return GOVERNMENT_SCHEMES.filter((scheme) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'health' && scheme.category !== 'health') return false
        if (activeCategory === 'disability' && scheme.category !== 'disability') return false
        if (activeCategory === 'assistive_devices' && scheme.category !== 'assistive_devices') return false
        if (activeCategory === 'education' && scheme.category !== 'education') return false
        if (activeCategory === 'financial' && scheme.category !== 'financial') return false
        if (activeCategory === 'local_support' && scheme.category !== 'local_support') return false
      }

      // Help type filter (if specific help type is selected in finder)
      if (selectedHelpType !== 'all') {
        if (!scheme.applicableHelpTypes.includes(selectedHelpType)) return false
      }

      // Concern filter (if specific concern is selected in finder)
      if (selectedConcern && selectedConcern !== 'all') {
        if (!scheme.applicableConcerns.includes(selectedConcern)) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const textToSearch = [
          scheme.name,
          scheme.shortName,
          scheme.department,
          scheme.description,
          scheme.relevance,
          scheme.whoItHelps,
          scheme.eligibilitySummary,
          ...scheme.documentation,
          ...scheme.nextSteps
        ].join(' ').toLowerCase()

        if (!textToSearch.includes(query)) return false
      }

      return true
    })
  }, [activeCategory, selectedHelpType, selectedConcern, searchQuery])

  const scrollToFinder = () => {
    if (finderRef.current) {
      finderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleResetFinder = () => {
    setSelectedConcern('all')
    setCustomAgeMonths('')
    setHasDisabilityCert('not_sure')
    setHasUdid('not_sure')
    setSelectedHelpType('all')
    setSearchQuery('')
    setActiveCategory('all')
  }

  return (
    <AppLayout
      active="government-support"
      onNavigate={onNavigate}
      title={t('govSupport.title', 'Government Support & Services')}
      subtitle={t('govSupport.subtitle', "Find government services, rehabilitation support and schemes that may be relevant to a child's needs.")}
    >
      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* TOP CHILD CONTEXT BANNER (if child is active) */}
        {currentChild && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50/70 p-3.5 text-xs text-primary-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-800 text-xs font-bold text-white">
                {currentChild.name?.charAt(0) || 'C'}
              </span>
              <div>
                <span className="font-bold">{currentChild.name}</span>
                <span className="text-primary-700">
                  {' '}· ID: {currentChild.child_identifier || currentChild.id}
                  {effectiveAgeMonths !== null && ` · ${effectiveAgeMonths} months`}
                  {currentChild.date_of_birth && ` (DOB: ${currentChild.date_of_birth})`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-primary-800 border border-primary-200">
                Child Context Active
              </span>
              <button
                type="button"
                onClick={() => setCurrentChild(null)}
                className="text-[11px] font-semibold text-primary-700 underline hover:text-primary-900"
              >
                {t('govSupport.clearChildContext', 'Clear child filter')}
              </button>
            </div>
          </div>
        )}

        {/* HERO INTRO CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-primary-900/10 bg-gradient-to-br from-primary-900 via-primary-850 to-primary-800 p-6 text-white shadow-elevation sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <Icon name="landmark" className="h-3.5 w-3.5 text-amber-300" />
              <span>Official Public-Service Navigator</span>
            </div>

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              {t('govSupport.introTitle', 'Need help for a child?')}
            </h1>

            <p className="text-sm leading-relaxed text-neutral-100 sm:text-base">
              {t(
                'govSupport.introDescription',
                "SPARSH can help you find the appropriate government support pathway based on the child's age, broad concern and current documentation."
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={scrollToFinder}
                className="bg-white text-primary-900 hover:bg-neutral-100 border-none shadow-sm"
              >
                <Icon name="search" className="h-4 w-4 text-primary-900" />
                <span>{t('govSupport.findSupportBtn', 'Find Support')}</span>
              </Button>

              <a
                href="https://swavlambancard.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <span>National UDID Portal</span>
                <Icon name="externalLink" className="h-3.5 w-3.5 text-white/80" />
              </a>

              <a
                href="https://depwd.maharashtra.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <span>Maharashtra Divyang Portal</span>
                <Icon name="externalLink" className="h-3.5 w-3.5 text-white/80" />
              </a>
            </div>
          </div>

          {/* Decorative watermark */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-10">
            <Icon name="landmark" className="h-64 w-64 text-white" />
          </div>
        </div>

        {/* NON-DIAGNOSTIC SAFETY DISCLAIMER */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900">
          <Icon name="alertTriangle" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="space-y-1">
            <p className="font-bold">Important Frontline Guidance (Non-Diagnostic Principle):</p>
            <p className="text-amber-800">
              {t(
                'govSupport.resultsDisclaimer',
                'Important: SPARSH provides navigational guidance, not medical diagnoses. Eligibility depends on official medical assessment by competent government authorities.'
              )}{' '}
              Never assign diagnostic disease names to a child. Use neutral observational descriptions (e.g. &ldquo;Physical difference observed in hand/finger development&rdquo;) and guide the family toward clinical evaluation.
            </p>
          </div>
        </div>

        {/* QUICK SUPPORT CATEGORIES (6 CARDS) */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {t('govSupport.categoriesTitle', 'Quick Support Categories')}
            </h2>
            <p className="text-xs text-neutral-500">
              {t('govSupport.categoriesSubtitle', 'Browse verified government and district support pathways by domain.')}
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORT_CATEGORIES.map((cat) => {
              const count = GOVERNMENT_SCHEMES.filter(
                (s) => cat.filterKey === 'all' || s.category === cat.filterKey
              ).length
              const isSelected = activeCategory === cat.filterKey

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(isSelected ? 'all' : cat.filterKey)
                  }}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50/60 shadow-sm ring-1 ring-primary-600'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/60 shadow-card'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl" role="img" aria-label={cat.title}>
                        {cat.emoji}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-600">
                        {count} schemes
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900">{cat.title}</h3>
                    <p className="text-xs leading-relaxed text-neutral-600">{cat.tagline}</p>
                  </div>
                  <div className="mt-3 flex items-center text-xs font-semibold text-primary-800">
                    <span>{isSelected ? 'Selected Category ✓' : 'Explore Category →'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* GUIDED SUPPORT FINDER (MULTI-STEP) */}
        <section ref={finderRef}>
          <Card
            title={t('govSupport.finderTitle', 'Find Relevant Support')}
            subtitle={t(
              'govSupport.finderSubtitle',
              'Answer a few simple questions to filter government schemes, certification paths, and rehabilitation services.'
            )}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFinder}
                className="text-xs text-neutral-600 hover:text-neutral-900"
              >
                <Icon name="refresh" className="h-3.5 w-3.5 mr-1" />
                <span>{t('govSupport.resetFilterBtn', 'Reset Finder')}</span>
              </Button>
            }
          >
            <div className="space-y-6">

              {/* STEP 1: CONCERN CATEGORY */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {t('govSupport.step1Label', 'Step 1: What kind of concern are you looking for help with?')}
                </label>
                <p className="text-xs text-neutral-500">
                  {t('govSupport.step1Help', 'Select the primary functional observation. These are broad support categories, not medical diagnoses.')}
                </p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {CONCERN_OPTIONS.map((concern) => {
                    const isSelected = selectedConcern === concern.id
                    return (
                      <button
                        key={concern.id}
                        type="button"
                        onClick={() => setSelectedConcern(concern.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-primary-700 bg-primary-50 text-primary-900 shadow-xs font-semibold'
                            : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{concern.label}</span>
                          {isSelected && <Icon name="check" className="h-3.5 w-3.5 text-primary-800" />}
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2">
                          {concern.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: CHILD AGE */}
              <div className="space-y-2 border-t border-neutral-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {t("govSupport.step2Label", "Step 2: Child's age")}
                  </label>
                  {effectiveAgeMonths !== null && (
                    <span className="text-xs font-semibold text-primary-800">
                      Current: {effectiveAgeMonths} months ({Math.floor(effectiveAgeMonths / 12)}y {effectiveAgeMonths % 12}m)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="216"
                    value={customAgeMonths}
                    onChange={(e) => setCustomAgeMonths(e.target.value)}
                    placeholder={
                      effectiveAgeMonths !== null
                        ? `Age: ${effectiveAgeMonths}m (type to override)`
                        : t('govSupport.step2Placeholder', 'Enter age in months (e.g. 36)')
                    }
                    className="w-56 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setCustomAgeMonths('12')}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      1 Year (12m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAgeMonths('36')}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      3 Years (36m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAgeMonths('60')}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      5 Years (60m)
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3 & STEP 4: DOCUMENTATION STATUS (GRID) */}
              <div className="grid gap-5 border-t border-neutral-100 pt-5 md:grid-cols-2">

                {/* STEP 3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {t('govSupport.step3Label', 'Step 3: Disability Certificate status')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'yes', label: 'Yes (Certified)' },
                      { id: 'no', label: 'No' },
                      { id: 'in_process', label: 'In Process' },
                      { id: 'not_sure', label: 'Not Sure' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHasDisabilityCert(opt.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold text-center transition ${
                          hasDisabilityCert === opt.id
                            ? 'border-primary-700 bg-primary-50 text-primary-900 shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    {t('govSupport.step4Label', 'Step 4: UDID Card status')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'yes', label: 'Yes (Has UDID)' },
                      { id: 'no', label: 'No' },
                      { id: 'in_process', label: 'In Process' },
                      { id: 'not_sure', label: 'Not Sure' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHasUdid(opt.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold text-center transition ${
                          hasUdid === opt.id
                            ? 'border-primary-700 bg-primary-50 text-primary-900 shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* STEP 5: HELP TYPE NEEDED */}
              <div className="space-y-2 border-t border-neutral-100 pt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {t('govSupport.step5Label', 'Step 5: What kind of help are you looking for?')}
                </label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setSelectedHelpType('all')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition ${
                      selectedHelpType === 'all'
                        ? 'border-primary-700 bg-primary-50 text-primary-900 shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Support Types</span>
                      {selectedHelpType === 'all' && <Icon name="check" className="h-3.5 w-3.5 text-primary-800" />}
                    </div>
                  </button>
                  {HELP_TYPES.map((ht) => {
                    const isSelected = selectedHelpType === ht.id
                    return (
                      <button
                        key={ht.id}
                        type="button"
                        onClick={() => setSelectedHelpType(ht.id)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition ${
                          isSelected
                            ? 'border-primary-700 bg-primary-50 text-primary-900 shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{ht.label}</span>
                          {isSelected && <Icon name="check" className="h-3.5 w-3.5 text-primary-800" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </Card>
        </section>

        {/* SEARCH AND FILTER BAR */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[280px] flex-1">
              <Icon name="search" className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('govSupport.searchPlaceholder', 'Search schemes, departments, or services…')}
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 shadow-card focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                >
                  <Icon name="cross" className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <BadgePill tone="info" className="text-xs">
                {t('govSupport.resultsCount', { count: filteredSchemes.length, defaultValue: `${filteredSchemes.length} schemes` })}
              </BadgePill>
            </div>
          </div>

          {/* FILTER CHIPS */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: t('govSupport.filterAll', 'All') },
              { id: 'health', label: t('govSupport.filterHealth', 'Health & Early Intervention') },
              { id: 'disability', label: t('govSupport.filterDisability', 'Disability & UDID') },
              { id: 'assistive_devices', label: t('govSupport.filterDevices', 'Assistive Devices') },
              { id: 'education', label: t('govSupport.filterEducation', 'Education') },
              { id: 'financial', label: t('govSupport.filterFinancial', 'Financial / Welfare') },
              { id: 'local_support', label: t('govSupport.filterLocal', 'District & Maharashtra') }
            ].map((tab) => {
              const active = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-primary-800 text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* RESULTS SECTION: POTENTIALLY RELEVANT SCHEMES */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              {t('govSupport.resultsTitle', 'Potentially Relevant Support')}
            </h2>
            <span className="text-xs text-neutral-500">
              {filteredSchemes.length} verified government options
            </span>
          </div>

          {filteredSchemes.length === 0 ? (
            <Card className="text-center py-12">
              <Icon name="search" className="mx-auto h-10 w-10 text-neutral-300" />
              <h3 className="mt-3 text-sm font-bold text-neutral-800">
                {t('govSupport.noResultsTitle', 'No specific schemes matched this exact filter combination')}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto">
                {t(
                  'govSupport.noResultsDesc',
                  "Try clearing search keywords or selecting 'All' categories to view all verified government support options."
                )}
              </p>
              <div className="mt-4">
                <Button variant="secondary" size="sm" onClick={handleResetFinder}>
                  {t('govSupport.resetFilterBtn', 'Reset Finder')}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5">
              {filteredSchemes.map((scheme) => (
                <article
                  key={scheme.id}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-card transition-shadow hover:shadow-elevation"
                >
                  {/* Scheme Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <BadgePill tone={scheme.badgeTone}>
                          {scheme.badge}
                        </BadgePill>
                        <BadgePill tone="neutral">
                          {scheme.level}
                        </BadgePill>
                        <span className="text-[11px] font-semibold text-neutral-400">
                          {scheme.lastVerified}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                        {scheme.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary-800">
                        {scheme.department}
                      </p>
                    </div>

                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-800 transition hover:bg-primary-100"
                    >
                      <span>{t('govSupport.learnMore', 'Open Official Website')}</span>
                      <Icon name="externalLink" className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4 space-y-4 text-xs">
                    {/* Description & Relevance */}
                    <p className="text-neutral-700 leading-relaxed font-normal">
                      {scheme.description}
                    </p>

                    <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-primary-950">
                      <span className="font-bold">Why this may be relevant: </span>
                      <span>{scheme.relevance}</span>
                    </div>

                    {/* Who it helps & Eligibility Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 space-y-1">
                        <span className="font-bold text-neutral-800">
                          {t('govSupport.whoItHelps', 'Who it is generally intended for')}:
                        </span>
                        <p className="text-neutral-600 leading-relaxed">{scheme.whoItHelps}</p>
                      </div>

                      <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 space-y-1">
                        <span className="font-bold text-neutral-800">
                          {t('govSupport.eligibility', 'Important eligibility conditions')}:
                        </span>
                        <p className="text-neutral-600 leading-relaxed">{scheme.eligibilitySummary}</p>
                      </div>
                    </div>

                    {/* Documents checklist */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-neutral-800">
                        {t('govSupport.documents', 'What the family may need')}:
                      </span>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {scheme.documentation.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-600">
                            <Icon name="checkCircle" className="h-3.5 w-3.5 text-primary-700 mt-0.5 shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How to proceed */}
                    <div className="space-y-1.5 border-t border-neutral-100 pt-3">
                      <span className="font-bold text-neutral-800">
                        {t('govSupport.howToProceed', 'How to proceed')}:
                      </span>
                      <ol className="space-y-1 pl-1">
                        {scheme.nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-600">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Source footer */}
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
                      <span>Official Source: <strong className="text-neutral-700">{scheme.sourceName}</strong></span>
                      <span>Verified: {scheme.lastVerified}</span>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* MAHARASHTRA DISTRICT SUPPORT SELECTOR */}
        <section>
          <Card
            title={t('govSupport.mhTitle', 'Maharashtra Support & District Resources')}
            subtitle={t(
              'govSupport.mhSubtitle',
              'Official support from the Department of Empowerment of Persons with Disabilities, Government of Maharashtra (दिव्यांग कल्याण विभाग).'
            )}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="w-full sm:w-80">
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    {t('govSupport.selectDistrict', 'Select District in Maharashtra')}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  >
                    <option value="">{t('govSupport.selectDistrictPlaceholder', 'Choose a district to view local welfare guidance…')}</option>
                    {MAHARASHTRA_DISTRICTS.map((dist) => (
                      <option key={dist.id} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <a
                  href="https://depwd.maharashtra.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-800 hover:bg-primary-100"
                >
                  <span>{t('govSupport.statePortalLink', 'Open Maharashtra Divyang Welfare Portal')}</span>
                  <Icon name="externalLink" className="h-3.5 w-3.5" />
                </a>
              </div>

              {selectedDistrict ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-primary-900 font-bold text-sm">
                    <Icon name="landmark" className="h-4 w-4 text-primary-800" />
                    <span>
                      {t('govSupport.districtGuidanceTitle', { district: selectedDistrict, defaultValue: `District Guidance for ${selectedDistrict}` })}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white p-3 border border-neutral-200 space-y-1">
                      <span className="font-bold text-neutral-800">
                        {t('govSupport.districtOffice', 'Zilla Parishad / District Social Welfare Office')}
                      </span>
                      <p className="text-neutral-600">
                        Office of the District Social Welfare Officer (जिल्हा समाज कल्याण अधिकारी कार्यालय, जिल्हा परिषद). Coordinates state disability pensions, assistive device camps, and welfare cards.
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-neutral-200 space-y-1">
                      <span className="font-bold text-neutral-800">
                        {t('govSupport.districtHospital', 'District Civil Hospital & Medical Board')}
                      </span>
                      <p className="text-neutral-600">
                        District Civil Hospital (जिल्हा सामान्य रुग्णालय). Weekly or bi-weekly Disability Assessment Medical Board operates under the Civil Surgeon for official UDID certification.
                      </p>
                    </div>
                  </div>

                  <p className="text-neutral-600 italic">
                    {t(
                      'govSupport.districtNote',
                      "Contact the District Social Welfare Office at your Zilla Parishad or the Civil Surgeon's office at the District Civil Hospital for UDID medical board assessment and local rehabilitation camp schedules."
                    )}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-500">
                  Select your district above to view localized administrative welfare office and medical board guidance.
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* WHAT SHOULD I DO NOW? ACTION PLAN */}
        <section>
          <Card
            title={t('govSupport.actionPlanTitle', 'What should I do now?')}
            subtitle={t(
              'govSupport.actionPlanSubtitle',
              'Recommended actionable steps for frontline Anganwadi workers when physical or functional differences are noticed.'
            )}
            className="border-primary-100 bg-gradient-to-b from-white to-primary-50/20"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {ACTION_STEPS_PHYSICAL_CONCERN.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-800 text-[11px] font-bold text-white">
                      {item.step}
                    </span>
                    <h3 className="font-bold text-neutral-900">{item.title}</h3>
                  </div>
                  <p className="text-neutral-600 leading-relaxed pl-8">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* BOTTOM TRANSPARENCY & DISCLAIMER BOX */}
        <footer className="rounded-xl border border-neutral-200 bg-neutral-100/70 p-4 text-center text-xs text-neutral-500 space-y-1">
          <p className="font-semibold text-neutral-700">
            {t(
              'govSupport.disclaimerBox',
              'Government schemes, income ceilings, and eligibility criteria may change. Always confirm current requirements with the official department before applying.'
            )}
          </p>
          <p className="text-[11px] text-neutral-400">
            SPARSH Child Health Companion · National & Maharashtra Public Welfare Directory · Verified October 2026
          </p>
        </footer>

      </main>
    </AppLayout>
  )
}
