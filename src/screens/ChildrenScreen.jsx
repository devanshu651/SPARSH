const children = [
  {
    name: 'Priya Sharma',
    age: '2y 4m',
    id: 'CH-04821',
    date: '15 Aug',
    status: 'At Risk',
    tone: 'risk',
    initial: 'P',
  },
  {
    name: 'Rohan Patil',
    age: '1y 8m',
    id: 'CH-04820',
    date: '15 Aug',
    status: 'Normal',
    tone: 'normal',
    initial: 'R',
  },
  {
    name: 'Aisha Khan',
    age: '3y 1m',
    id: 'CH-04819',
    date: '14 Aug',
    status: 'Moderate',
    tone: 'moderate',
    initial: 'A',
  },
  {
    name: 'Vivek Desai',
    age: '2y 0m',
    id: 'CH-04818',
    date: '14 Aug',
    status: 'Normal',
    tone: 'normal',
    initial: 'V',
  },
  {
    name: 'Sneha More',
    age: '1y 6m',
    id: 'CH-04817',
    date: '13 Aug',
    status: 'At Risk',
    tone: 'risk',
    initial: 'S',
  },
  {
    name: 'Arjun Jadhav',
    age: '2y 9m',
    id: 'CH-04816',
    date: '13 Aug',
    status: 'Normal',
    tone: 'normal',
    initial: 'A',
  },
]

const filters = ['All', 'At Risk', 'Moderate', 'Normal']

export default function ChildrenScreen({ onNavigate }) {
  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('dashboard')}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-lg font-bold text-primary-700 transition hover:bg-primary-100"
            >
              ←
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary-600">
                SPARSH
              </p>
              <h1 className="text-xl font-bold text-neutral-900">
                Child Records
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.('register')}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-600 text-xl font-medium text-white shadow-md transition hover:bg-primary-700"
            aria-label="Register child"
          >
            +
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-10 lg:py-8">
        {/* Search + filters */}
        <section className="mx-auto max-w-4xl">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search children..."
              className="h-12 w-full rounded-2xl border border-primary-100 bg-white pl-11 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition ${
                  index === 0
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'border border-primary-100 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs font-medium text-neutral-500">
            {children.length} records found
          </p>
        </section>

        {/* Desktop heading */}
        <div className="mx-auto mt-5 hidden max-w-7xl items-center justify-between lg:flex">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              All children
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Browse registered child health records
            </p>
          </div>
        </div>

        {/* Children */}
        <section className="mx-auto mt-4 grid max-w-7xl gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onClick={() => console.log('Selected:', child.name)}
            />
          ))}
        </section>
      </div>

      {/* Mobile navigation */}
      <BottomNav onChange={onNavigate} />
    </main>
  )
}

function ChildCard({ child, onClick }) {
  const styles = {
    risk: {
      avatar: 'bg-red-400 text-white',
      badge: 'bg-red-50 text-red-500',
    },
    moderate: {
      avatar: 'bg-amber-400 text-white',
      badge: 'bg-amber-50 text-amber-600',
    },
    normal: {
      avatar: 'bg-emerald-400 text-white',
      badge: 'bg-emerald-50 text-emerald-600',
    },
  }

  const style = styles[child.tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-primary-100 bg-white p-3 text-left shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${style.avatar}`}
      >
        {child.initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-bold text-neutral-900">
            {child.name}
          </p>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}
          >
            {child.status}
          </span>
        </div>

        <p className="mt-1 text-xs text-neutral-500">
          Age: {child.age} · {child.id}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-[10px] text-neutral-400">Last screened</p>
        <p className="mt-0.5 text-xs font-semibold text-neutral-500">
          {child.date}
        </p>
      </div>
    </button>
  )
}

function BottomNav({ onChange }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: '⌂' },
    { id: 'children', label: 'Children', icon: '♙' },
    { id: 'screening', label: 'Screening', icon: '▣' },
    { id: 'analytics', label: 'Analytics', icon: '▥' },
    { id: 'alerts', label: 'Alerts', icon: '♧' },
  ]

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white px-3 pt-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {items.map((item) => {
          const active = item.id === 'children'

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={`flex min-w-[56px] flex-1 flex-col items-center gap-1 rounded-xl py-1.5 ${
                active ? 'text-primary-700' : 'text-neutral-400'
              }`}
            >
              <span
                className={`grid h-7 w-8 place-items-center rounded-lg text-[18px] ${
                  active ? 'bg-primary-50' : ''
                }`}
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