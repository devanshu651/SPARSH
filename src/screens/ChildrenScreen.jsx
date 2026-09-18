import { useEffect, useMemo, useState } from 'react'
import BottomNav from '../components/BottomNav'
import Button from '../components/Button'
import { ErrorState, LoadingState, EmptyState } from '../components/AsyncState'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'

export default function ChildrenScreen({ onNavigate }) {
  const { setCurrentChild } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await childrenApi.list())
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const shown = useMemo(() =>
    items.filter((c) => {
      const match =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.child_identifier.toLowerCase().includes(search.toLowerCase())
      const risk =
        filter === 'All' ||
        (filter === 'At Risk' && c.latest_risk === 'RED') ||
        (filter === 'Moderate' && c.latest_risk === 'YELLOW') ||
        (filter === 'Normal' && c.latest_risk === 'GREEN')
      return match && risk
    }),
    [items, search, filter]
  )

  const handleChildClick = (child) => {
    setCurrentChild(child)
    onNavigate?.('screening')
  }

  const riskStyles = {
    RED: { avatar: 'bg-red-400 text-white', badge: 'bg-red-50 text-red-500' },
    YELLOW: { avatar: 'bg-amber-400 text-white', badge: 'bg-amber-50 text-amber-600' },
    GREEN: { avatar: 'bg-emerald-400 text-white', badge: 'bg-emerald-50 text-emerald-600' },
    default: { avatar: 'bg-neutral-400 text-white', badge: 'bg-neutral-50 text-neutral-600' },
  }

  const formatAge = (months) => {
    if (!months && months !== 0) return '—'
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (years > 0) return `${years}y ${remainingMonths}m`
    return `${remainingMonths}m`
  }

  const getInitials = (name) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
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
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary-600">SPARSH</p>
              <h1 className="text-xl font-bold text-neutral-900">Child Records</h1>
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
        <section className="mx-auto max-w-4xl">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">⌕</span>
            <input
              type="search"
              placeholder="Search children..."
              className="h-12 w-full rounded-2xl border border-primary-100 bg-white pl-11 pr-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {['All', 'At Risk', 'Moderate', 'Normal'].map((filterOption, index) => (
              <button
                key={filterOption}
                type="button"
                onClick={() => setFilter(filterOption)}
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold transition ${
                  filter === filterOption
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'border border-primary-100 bg-white text-neutral-600 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs font-medium text-neutral-500">
            {shown.length} of {items.length} records found
          </p>
        </section>

        {loading ? (
          <LoadingState label="Loading child records…" />
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : shown.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? 'No children registered yet' : 'No children match your filters'}
            detail={items.length === 0 ? 'Register the first child to begin screening.' : 'Try adjusting your search or filter.'}
            action={<Button className="mt-4" onClick={() => onNavigate?.('register')}>Register child</Button>}
          />
        ) : (
          <section className="mx-auto mt-4 grid max-w-7xl gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {shown.map((child) => {
              const style = riskStyles[child.latest_risk] || riskStyles.default
              const age = formatAge(child.age_months)
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildClick(child)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-primary-100 bg-white p-3 text-left shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
                >
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold ${style.avatar}`}>
                    {getInitials(child.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-neutral-900">{child.name}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.badge}`}>
                        {child.latest_risk === 'RED' ? 'At Risk' : child.latest_risk === 'YELLOW' ? 'Moderate' : child.latest_risk === 'GREEN' ? 'Normal' : '—'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">Age: {age} · {child.child_identifier}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-[10px] text-neutral-400">Last screened</p>
                    <p className="mt-0.5 text-xs font-semibold text-neutral-500">
                      {child.updated_at ? new Date(child.updated_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </button>
              )
            })}
          </section>
        )}
      </div>

      <BottomNav onChange={onNavigate} />
    </main>
  )
}