const items = [
  { id: 'dashboard', label: 'Home', icon: '⌂' },
  { id: 'register', label: 'Register', icon: '+' },
  { id: 'screening', label: 'Screening', icon: '◌' },
  { id: 'records', label: 'Records', icon: '▤' }
]

export default function BottomNav({ active = 'dashboard', onChange }) {
  return (
    <nav aria-label="Main navigation" className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-neutral-100 bg-white/95 px-3 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.05)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md justify-between">
        {items.map((item) => <button key={item.id} onClick={() => onChange?.(item.id)} className={`flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${active === item.id ? 'text-primary-800' : 'text-neutral-400'}`}><span className={`grid h-6 w-7 place-items-center rounded-lg text-lg leading-5 ${active === item.id ? 'bg-primary-50' : ''}`} aria-hidden>{item.icon}</span>{item.label}</button>)}
      </div>
    </nav>
  )
}