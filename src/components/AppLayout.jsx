import { useApp } from '../context/AppContext'
import BrandLogo from './BrandLogo'
import BottomNav from './BottomNav'
import SyncStatus from './SyncStatus'
import Icon from './Icon'

const navLinks = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'children', label: 'Child Cohort', icon: 'children' },
  { id: 'register', label: 'Child Registration', icon: 'userPlus' },
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
  const workerName = currentWorker?.name || 'Healthcare Worker'
  const centreName = currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Assigned Anganwadi'

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 lg:flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white">
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <BrandLogo className="h-8 w-8" showWordmark />
        </div>

        {/* Worker Badge */}
        <div className="border-b border-neutral-100 bg-neutral-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-800 text-xs font-bold text-white shadow-xs">
              {workerName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-neutral-900">{workerName}</p>
              <p className="truncate text-[11px] text-neutral-500">{centreName}</p>
            </div>
          </div>
          <div className="mt-3">
            <SyncStatus className="w-full justify-center" />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 p-3">
          {navLinks.map((item) => {
            const isActive = active === item.id || (active === 'records' && item.id === 'children')
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon name={item.icon} className={`h-4 w-4 ${isActive ? 'text-primary-800' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-neutral-200 p-4 text-[11px] text-neutral-400">
          <p className="font-semibold text-neutral-600">SPARSH v1.2</p>
          <p className="mt-0.5">National Health Protocol Compliant</p>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex flex-1 flex-col min-w-0 pb-24 lg:pb-0">
        {/* TOP MOBILE BAR */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            {backTo ? (
              <button
                type="button"
                onClick={() => onNavigate?.(backTo)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Back"
              >
                <Icon name="arrowLeft" className="h-4 w-4" />
              </button>
            ) : (
              <BrandLogo className="h-7 w-7 shrink-0" showWordmark={!title} />
            )}
            {title && (
              <span className="font-bold text-sm text-neutral-900 truncate max-w-[170px] sm:max-w-xs">
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SyncStatus compact />
            <button
              type="button"
              onClick={() => onNavigate?.('alerts')}
              className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Clinical Alerts"
            >
              <Icon name="alerts" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('settings')}
              className="grid h-8 w-8 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Settings"
            >
              <Icon name="settings" className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* DESKTOP PAGE TITLE BAR */}
        {(title || actions || backTo) && (
          <div className="hidden border-b border-neutral-200 bg-white px-8 py-4 lg:block">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-3">
                {backTo && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.(backTo)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    aria-label="Back"
                  >
                    <Icon name="arrowLeft" className="h-4 w-4" />
                  </button>
                )}
                <div>
                  {title && <h1 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h1>}
                  {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
                </div>
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <BottomNav active={active} onChange={onNavigate} />
    </div>
  )
}
