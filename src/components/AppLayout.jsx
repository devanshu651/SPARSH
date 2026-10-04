import { useApp } from '../context/AppContext'
import BrandLogo from './BrandLogo'
import BottomNav from './BottomNav'
import SyncStatus from './SyncStatus'
import Icon from './Icon'

const workerNavLinks = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'children', label: 'Child Cohort', icon: 'children' },
  { id: 'register', label: 'Register Child', icon: 'userPlus' },
  { id: 'screening', label: 'Screening', icon: 'screening' },
  { id: 'analytics', label: 'Supervisor Analytics', icon: 'analytics' },
  { id: 'alerts', label: 'Clinical Alerts', icon: 'alerts' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
]

export default function AppLayout({
  active = 'dashboard',
  onNavigate,
  title,
  subtitle,
  actions,
  backTo,
  children
}) {
  const { currentWorker } = useApp()
  const navLinks = currentWorker?.role === 'admin'
    ? [{ id: 'admin-console', label: 'Administration', icon: 'settings' }]
    : workerNavLinks
  const workerName = currentWorker?.name || 'Healthcare Worker'
  const workerInitials = workerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'HW'
  const centreName = currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Assigned Anganwadi'

  return (
    <div className="min-h-screen w-full bg-[#F8FAF9] text-[#1A201E] flex flex-col lg:flex-row">
      {/* DESKTOP SIDEBAR — Full height, clean pure white with clear boundary */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[#D5DDD7] lg:bg-white lg:shrink-0">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#D5DDD7] px-5">
          <BrandLogo className="h-8 w-8" showWordmark />
        </div>

        {/* Worker Badge */}
        <div className="border-b border-[#EBF0EC] bg-[#F8FAF9] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FDF0EB] text-xs font-bold text-[#C85A32] border border-[#F7D4C8] shadow-xs">
              {workerInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#1A201E]">{workerName}</p>
              <p className="truncate text-[11px] text-[#5A6660]">{centreName}</p>
            </div>
          </div>
          <div className="mt-3">
            {currentWorker?.role !== 'admin' && <SyncStatus className="w-full justify-center" />}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 p-3" aria-label="Desktop Navigation">
          {navLinks.map((item) => {
            const isActive = active === item.id || (active === 'records' && item.id === 'children')
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#EBF2EE] text-[#1B4D3E]'
                    : 'text-[#5A6660] hover:bg-[#F2F6F3] hover:text-[#1A201E]'
                }`}
              >
                <Icon
                  name={item.icon}
                  className={`h-4 w-4 ${isActive ? 'text-[#1B4D3E]' : 'text-[#8E9C95]'}`}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer Info */}
        <div className="border-t border-[#D5DDD7] p-4 text-[11px] text-[#8E9C95]">
          <p className="font-bold text-[#5A6660]">SPARSH v1.2</p>
          <p className="mt-0.5">Developmental Screening &amp; Follow-up Support</p>
        </div>
      </aside>

      {/* MAIN VIEWPORT — Subtle neutral background canvas for clear card separation */}
      <div className="flex flex-1 flex-col min-w-0 pb-20 lg:pb-0 bg-[#F8FAF9]">
        {/* TOP MOBILE BAR (<= 1023px) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#D5DDD7] bg-white/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            {backTo ? (
              <button
                type="button"
                onClick={() => onNavigate?.(backTo)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#5A6660] hover:bg-[#F5F8F6] hover:text-[#1A201E]"
                aria-label="Back"
              >
                <Icon name="arrowLeft" className="h-4 w-4" />
              </button>
            ) : (
              <BrandLogo className="h-7 w-7 shrink-0" showWordmark={!title} />
            )}
            {title && (
              <span className="font-bold text-sm text-[#1A201E] truncate max-w-[170px] sm:max-w-xs font-heading">
                {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentWorker?.role !== 'admin' && <SyncStatus compact />}
            {currentWorker?.role !== 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate?.('alerts')}
                className="grid h-8 w-8 place-items-center rounded-xl text-[#5A6660] hover:bg-[#F5F8F6] hover:text-[#1A201E]"
                aria-label="Alerts"
              >
                <Icon name="alerts" className="h-4 w-4" />
              </button>
            )}
            {/* Initial Avatar in terracotta tint matching Screen 3 in reference */}
            {currentWorker?.role !== 'admin' && (
              <button
                type="button"
                onClick={() => onNavigate?.('settings')}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#FDF0EB] text-[11px] font-bold text-[#C85A32] border border-[#F7D4C8] shadow-xs"
                aria-label="Profile and Settings"
              >
                {workerInitials}
              </button>
            )}
          </div>
        </header>

        {/* DESKTOP PAGE TITLE BAR (>= 1024px) */}
        {(title || actions || backTo) && (
          <div className="hidden border-b border-[#D5DDD7] bg-white px-8 py-4 lg:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-3">
                {backTo && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.(backTo)}
                    className="grid h-8 w-8 place-items-center rounded-xl border border-[#D5DDD7] text-[#5A6660] hover:bg-[#F5F8F6] hover:text-[#1A201E]"
                    aria-label="Back"
                  >
                    <Icon name="arrowLeft" className="h-4 w-4" />
                  </button>
                )}
                <div>
                  {title && <h1 className="text-xl font-bold tracking-tight text-[#1A201E] font-heading">{title}</h1>}
                  {subtitle && <p className="mt-0.5 text-xs text-[#5A6660]">{subtitle}</p>}
                </div>
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        {/* RESPONSIVE MAIN CONTENT CONTAINER */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      {currentWorker?.role !== 'admin' && <BottomNav active={active} onChange={onNavigate} />}
    </div>
  )
}
