import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const mainItems = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'children', label: 'Children', icon: 'children' },
  { id: 'screening', label: 'Screening', icon: 'screening', primary: true },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  { id: 'more', label: 'More', icon: 'more' },
]

const secondaryItems = [
  {
    id: 'alerts',
    label: 'Clinical Alerts',
    sub: 'Triage notices & overdue follow-ups',
    icon: 'alerts',
    badge: 'Alerts'
  },
  {
    id: 'records',
    label: 'Health Records',
    sub: 'Full child cohort & measurement logs',
    icon: 'report'
  },
  {
    id: 'history',
    label: 'Medical History',
    sub: 'Longitudinal milestone & growth audits',
    icon: 'clock'
  },
  {
    id: 'analytics',
    label: 'Supervisor Analytics',
    sub: 'Ward-level coverage & performance',
    icon: 'analytics'
  },
  {
    id: 'settings',
    label: 'Settings & Language',
    sub: 'Worker profile, offline sync & Hindi toggle',
    icon: 'settings'
  }
]

export default function BottomNav({ active = 'dashboard', onChange }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef(null)

  const isScreeningActive = [
    'screening',
    'av-assessment',
    'analysis',
    'report',
    'referral'
  ].includes(active)

  const isMoreActive = [
    'alerts',
    'settings',
    'history',
    'records'
  ].includes(active)

  const handleNavClick = (id) => {
    if (id === 'more') {
      setMoreOpen((prev) => !prev)
      return
    }
    setMoreOpen(false)
    onChange?.(id)
  }

  const handleSecondarySelect = (id) => {
    setMoreOpen(false)
    onChange?.(id)
  }

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!moreOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMoreOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreOpen])

  return (
    <>
      {/* MORE MENU MODAL / SHEET */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 transition-opacity lg:hidden"
          aria-hidden="true"
        >
          <div
            ref={menuRef}
            role="dialog"
            aria-label="More Clinical Navigation"
            aria-modal="true"
            className="fixed inset-x-3 bottom-[72px] z-50 mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-elevation"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Additional Clinical Sections
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Direct access to clinical records & tools
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Close menu"
              >
                <Icon name="cross" className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="mt-2 divide-y divide-neutral-100">
              {secondaryItems.map((item) => {
                const isSelected = active === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSecondarySelect(item.id)}
                    className={`flex min-h-[48px] w-full items-center justify-between py-2.5 px-2 text-left transition rounded-lg ${
                      isSelected
                        ? 'bg-primary-50 text-primary-900'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                          isSelected
                            ? 'bg-primary-800 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        <Icon name={item.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-neutral-900">
                          {item.label}
                        </p>
                        <p className="truncate text-[11px] text-neutral-500">
                          {item.sub}
                        </p>
                      </div>
                    </div>

                    <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-neutral-400" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Primary Mobile Navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white shadow-[0_-1px_4px_rgba(15,23,42,0.06)] lg:hidden"
      >
        <div className="mx-auto flex h-[58px] max-w-md items-center justify-between px-1">
          {mainItems.map((item) => {
            const isPrimary = item.primary

            if (isPrimary) {
              const isScreening = isScreeningActive

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className="relative flex flex-1 flex-col items-center justify-center min-h-[52px] py-0.5"
                  aria-label="Developmental Screening — Primary Workflow"
                >
                  <div
                    className={`flex flex-col items-center justify-center w-[58px] h-[46px] rounded-lg border transition-all ${
                      isScreening
                        ? 'bg-primary-950 text-white border-primary-950 shadow-xs ring-2 ring-teal-500/50'
                        : 'bg-primary-800 text-white border-primary-900/90 shadow-xs hover:bg-primary-900'
                    }`}
                  >
                    <Icon name="screening" className="h-4 w-4 text-white" />
                    <span className="text-[10px] font-bold tracking-tight leading-tight mt-0.5 text-white">
                      Screening
                    </span>
                  </div>
                </button>
              )
            }

            const isActive =
              (item.id === 'dashboard' && active === 'dashboard') ||
              (item.id === 'children' && (active === 'children' || active === 'records')) ||
              (item.id === 'analytics' && active === 'analytics') ||
              (item.id === 'more' && (moreOpen || isMoreActive))

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative flex min-h-[50px] flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-primary-800'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Top Bar Indicator */}
                {isActive && (
                  <span
                    className="absolute top-0 inset-x-3 h-[2.5px] rounded-full bg-primary-800"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  name={item.icon}
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-primary-800' : 'text-neutral-500'
                  }`}
                />

                <span
                  className={`text-[10.5px] leading-none tracking-tight ${
                    isActive ? 'font-bold text-primary-900' : 'font-medium text-neutral-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}