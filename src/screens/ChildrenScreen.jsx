import { useEffect, useMemo, useState } from 'react'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'
import AppLayout from '../components/AppLayout'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'

const riskFilters = [
  { id: 'All', label: 'All' },
  { id: 'GREEN', label: 'Normal' },
  { id: 'YELLOW', label: 'Follow Up' },
  { id: 'RED', label: 'At Risk' },
]

export default function ChildrenScreen({ onNavigate }) {
  const { setCurrentChild } = useApp()
  const [childrenList, setChildrenList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = childrenApi.list()
      const data = typeof fn === 'function' ? await fn() : await fn
      setChildrenList(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err)
      setChildrenList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredChildren = useMemo(() => {
    return childrenList.filter((child) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        !query ||
        child.name?.toLowerCase().includes(query) ||
        child.child_identifier?.toLowerCase().includes(query) ||
        child.guardian_name?.toLowerCase().includes(query)

      const matchesRisk =
        activeFilter === 'All' ||
        (activeFilter === 'RED' && child.latest_risk === 'RED') ||
        (activeFilter === 'YELLOW' && child.latest_risk === 'YELLOW') ||
        (activeFilter === 'GREEN' && (child.latest_risk === 'GREEN' || !child.latest_risk))

      return matchesSearch && matchesRisk
    })
  }, [childrenList, search, activeFilter])

  const handleSelectChild = (child, targetScreen = 'history') => {
    setCurrentChild(child)
    onNavigate?.(targetScreen)
  }

  return (
    <AppLayout
      active="children"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Children"
      subtitle="Manage and view all registered children"
      actions={
        <button
          type="button"
          onClick={() => onNavigate?.('register')}
          className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Icon name="plus" className="h-4 w-4" />
          <span>Register Child</span>
        </button>
      }
    >
      <div className="space-y-4 pt-1 pb-16">

        {/* SEARCH AND FILTER BAR (MATCHING SCREEN 4 IN REFERENCE) */}
        <div className="space-y-2.5">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 text-[#8E9C95]">
              <Icon name="search" className="h-4 w-4" />
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="min-h-[46px] w-full rounded-xl border border-[#E5EBE7] bg-white pl-10 pr-10 text-xs sm:text-sm text-[#1A201E] outline-none shadow-card placeholder:text-[#8E9C95] focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#E8F0EC]"
            />
            <button
              type="button"
              className="absolute right-3 text-[#5A6660] hover:text-[#1A201E]"
              aria-label="Filter"
            >
              <Icon name="more" className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {riskFilters.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1B4D3E] text-white shadow-xs'
                      : 'bg-white text-[#5A6660] border border-[#E5EBE7] hover:bg-[#FAFCFA]'
                  }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* CHILDREN LIST CONTENT */}
        {loading ? (
          <div className="py-12">
            <LoadingState label="Loading children directory..." />
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={load} />
        ) : filteredChildren.length === 0 ? (
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-8 text-center shadow-card space-y-3">
            <EmptyState
              title="No children found"
              detail={search ? 'No children match your search criteria.' : 'No children registered in this cohort yet.'}
              icon="children"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate?.('register')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D3E] text-white text-xs font-bold shadow-xs hover:bg-[#143D31]"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  <span>Register First Child</span>
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredChildren.map((child) => {
              const tone =
                child.latest_risk === 'RED'
                  ? 'high'
                  : child.latest_risk === 'YELLOW'
                  ? 'moderate'
                  : child.latest_risk === 'GREEN'
                  ? 'normal'
                  : 'neutral'

              const label =
                child.latest_risk === 'RED'
                  ? 'At Risk'
                  : child.latest_risk === 'YELLOW'
                  ? 'Follow Up'
                  : child.latest_risk === 'GREEN'
                  ? 'Normal'
                  : 'Not Screened'

              // Avatar background: soft warm terracotta or sage
              const isFemale = child.gender === 'female' || child.sex === 'female'

              return (
                <div
                  key={child.id}
                  onClick={() => handleSelectChild(child, 'history')}
                  className="group rounded-2xl border border-[#E5EBE7] bg-white p-3.5 sm:p-4 shadow-card hover:border-[#D0D7D2] hover:bg-[#FAFCFA] cursor-pointer transition-all flex items-center justify-between gap-3"
                >
                  {/* Avatar & Child Details */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-bold border shadow-xs ${
                        isFemale
                          ? 'bg-[#FDF0EB] text-[#C85A32] border-[#F8D8CB]'
                          : 'bg-[#EBF2EE] text-[#1B4D3E] border-[#D5E3DB]'
                      }`}
                    >
                      {child.name?.charAt(0) || 'C'}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#1A201E] truncate group-hover:text-[#1B4D3E] transition-colors">
                        {child.name || 'Unnamed Child'}
                      </h3>
                      <p className="text-xs text-[#5A6660] truncate mt-0.5">
                        {child.age_months !== null && child.age_months !== undefined
                          ? `${Math.floor(child.age_months / 12)} years ${child.age_months % 12} months`
                          : 'Age not logged'}
                        {child.gender ? ` • ${child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}` : child.sex ? ` • ${child.sex}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <BadgePill tone={tone}>
                      {label}
                    </BadgePill>
                    <Icon name="chevronRight" className="h-4 w-4 text-[#8E9C95] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* PRIMARY ACTION AT BOTTOM (MATCHING SCREEN 4 IN REFERENCE) */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => onNavigate?.('register')}
            className="w-full min-h-[50px] rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white font-bold text-sm shadow-card flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Icon name="plus" className="h-4 w-4" />
            <span>Register Child</span>
          </button>
        </div>

      </div>
    </AppLayout>
  )
}