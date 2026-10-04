import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CentresScreen from './CentresScreen'
import UsersScreen from './UsersScreen'
import Icon from '../components/Icon'
import Button from '../components/Button'

const TABS = [
  { id: 'centres', label: 'Centres' },
  { id: 'users', label: 'Users' },
]

export default function AdminConsoleScreen({ onNavigate }) {
  const { currentWorker } = useApp()
  const [activeTab, setActiveTab] = useState('centres')

  if (!currentWorker || currentWorker.role !== 'admin') {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF0EB] text-[#D96B43] mb-4">
            <Icon name="lock" className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-[#1A201E]">Admin Access Required</h1>
          <p className="mt-1 text-xs text-[#5A6660]">This section is only accessible to administrative accounts.</p>
          <div className="mt-5">
            <Button
              variant="primary"
              onClick={() => onNavigate?.('dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white pb-24 lg:pb-8">
      <header className="border-b border-[#E5EBE7] bg-white sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EBE7] text-[#5A6660] hover:bg-[#F9FBFA] transition"
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D3E]">ADMIN CONSOLE</p>
              <h1 className="text-base font-bold text-[#1A201E]">Administration</h1>
            </div>
          </div>
          <span className="hidden text-xs text-[#5A6660] sm:block">
            Signed in as <strong className="text-[#1A201E]">{currentWorker.name}</strong>
          </span>
        </div>

        <nav className="mx-auto max-w-6xl px-5" aria-label="Admin console sections">
          <div className="flex gap-2 pb-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#1B4D3E] text-white shadow-2xs'
                      : 'border border-[#E5EBE7] bg-white text-[#5A6660] hover:text-[#1A201E]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {activeTab === 'centres' && <CentresScreen onNavigate={onNavigate} />}
        {activeTab === 'users' && <UsersScreen onNavigate={onNavigate} />}
      </div>
    </main>
  )
}