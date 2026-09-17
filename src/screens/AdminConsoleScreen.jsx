import { useState } from 'react'
import { useApp } from '../context/AppContext'
import CentresScreen from './CentresScreen'
import UsersScreen from './UsersScreen'

const TABS = [
  { id: 'centres', label: 'Centres', icon: '⌂' },
  { id: 'users', label: 'Users', icon: '♙' },
]

export default function AdminConsoleScreen({ onNavigate }) {
  const { currentWorker } = useApp()
  const [activeTab, setActiveTab] = useState('centres')

  if (!currentWorker || currentWorker.role !== 'admin') {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-neutral-900">Admin Access Required</h1>
          <p className="mt-2 text-neutral-500">This section is only accessible to administrators.</p>
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="mt-6 min-h-11 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    )
  }

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
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary-600">ADMIN CONSOLE</p>
              <h1 className="text-xl font-bold text-neutral-900">Administration</h1>
            </div>
          </div>
          <span className="hidden text-xs text-neutral-400 lg:block">
            Signed in as {currentWorker.name}
          </span>
        </div>

        <nav className="mx-auto max-w-7xl border-b border-neutral-100 px-5 lg:px-10" aria-label="Admin console sections">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-10 lg:py-8">
        {activeTab === 'centres' && <CentresScreen onNavigate={onNavigate} />}
        {activeTab === 'users' && <UsersScreen onNavigate={onNavigate} />}
      </div>
    </main>
  )
}