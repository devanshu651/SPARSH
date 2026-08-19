const items = [
  { id: 'dashboard', label: 'Home', icon: '⌂' },
  { id: 'children', label: 'Children', icon: '♙' },
  { id: 'screening', label: 'Screening', icon: '▣' },
  { id: 'analytics', label: 'Analytics', icon: '▥' },
  { id: 'alerts', label: 'Alerts', icon: '♧' },
]

export default function BottomNav({ active = 'dashboard', onChange }) {
  return (
    <nav
      aria-label="Main navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-3 pt-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map((item) => {
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={`flex min-w-[56px] flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition ${
                isActive
                  ? 'text-primary-700'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <span
                className={`grid h-7 w-8 place-items-center rounded-lg text-[18px] leading-none ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-transparent'
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span className="text-[10px] font-semibold">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}