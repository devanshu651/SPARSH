import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const mainItems = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'children', label: 'Children', icon: 'children' },
  { id: 'screening', label: 'Screening', icon: 'screening' },
  { id: 'analytics', label: 'Reports', icon: 'analytics' },
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
    sub: 'Child cohort & measurement logs',
    icon: 'report'
  },
  {
    id: 'history',
    label: 'Medical History',
    sub: 'Longitudinal milestone audits',
    icon: 'clock'
  },
  {
    id: 'register',
    label: 'Register Child',
    sub: 'Enroll new child into cohort',
    icon: 'userPlus'
  },
  {
    id: 'settings',
    label: 'Settings',
    sub: 'Worker profile, sync & language',
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
    'records',
    'register'
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
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
      {/* Popover sheet for "More" */}
      {moreOpen && (
        <div
          ref={menuRef}
          className="mx-3 mb-2 rounded-2xl border border-[#E5EBE7] bg-white p-3 shadow-elevation animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#F3F6F4] pb-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A6660]">More Navigation</span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="text-[#8E9C95] hover:text-[#1A201E]"
            >
              <Icon name="cross" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 divide-y divide-[#F3F6F4]">
            {secondaryItems.map((item) => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSecondarySelect(item.id)}
                  className={`flex w-full items-center gap-3 py-2.5 px-2 text-left rounded-xl transition-colors ${
                    isActive ? 'bg-[#EBF2EE] text-[#1B4D3E]' : 'hover:bg-[#F5F8F6] text-[#1A201E]'
                  }`}
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      isActive ? 'bg-[#1B4D3E] text-white' : 'bg-[#EBF2EE] text-[#1B4D3E]'
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.label}</p>
                    <p className="text-[10px] text-[#5A6660] truncate">{item.sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Main 5-tab bar matching the reference image */}
      <nav
        aria-label="Mobile Navigation"
        className="flex h-16 items-center justify-around border-t border-[#D5DDD7] bg-white px-2 safe-bottom shadow-[0_-2px_10px_rgba(26,32,30,0.03)]"
      >
        {mainItems.map((item) => {
          let isActive = false
          if (item.id === 'dashboard') isActive = active === 'dashboard'
          else if (item.id === 'children') isActive = active === 'children'
          else if (item.id === 'screening') isActive = isScreeningActive
          else if (item.id === 'analytics') isActive = active === 'analytics'
          else if (item.id === 'more') isActive = moreOpen || isMoreActive

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#1B4D3E]' : 'text-[#8E9C95] hover:text-[#5A6660]'
              }`}
            >
              <div className="relative">
                <Icon
                  name={item.icon}
                  className={`h-5 w-5 transition-transform ${isActive ? 'scale-105 stroke-[2.2]' : ''}`}
                />
              </div>
              <span className={`mt-1 text-[10px] ${isActive ? 'font-bold text-[#1B4D3E]' : 'font-medium text-[#8E9C95]'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}