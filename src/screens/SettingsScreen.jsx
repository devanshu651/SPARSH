import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { authService } from '../services/auth'
import { stopDemoMode } from '../services/demo'
import AppLayout from '../components/AppLayout'
import Card from '../components/Card'
import Button from '../components/Button'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'

export default function SettingsScreen({ onNavigate }) {
  const { i18n } = useTranslation()
  const { currentWorker, setCurrentWorker } = useApp()
  const [biometric, setBiometric] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [syncOnWifi, setSyncOnWifi] = useState(false)

  const workerName = currentWorker?.name || 'Anganwadi Healthcare Worker'
  const workerRole = currentWorker?.role ? currentWorker.role.toUpperCase() : 'FIELD WORKER'
  const centreId = currentWorker?.centre_ids?.[0] || 'AWW-MH-2847'

  const handleSignOut = async () => {
    stopDemoMode()
    await authService.signOut()
    setCurrentWorker(null)
    onNavigate('login')
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(nextLang)
  }

  return (
    <AppLayout
      active="settings"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="System Settings & Preferences"
      subtitle="Worker credentials, device configuration, and language settings"
    >
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* WORKER CREDENTIAL PROFILE */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-800 text-sm font-bold text-white shadow-xs">
                {workerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-neutral-900">{workerName}</h2>
                  <BadgePill tone="teal">{workerRole}</BadgePill>
                  {currentWorker?.isDemo && (
                    <BadgePill tone="moderate">Demo Mode</BadgePill>
                  )}
                </div>
                <p className="text-xs text-neutral-500">
                  Assigned Centre ID: {centreId} · Ward 4 Health Sub-centre
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Icon name="logOut" className="h-4 w-4 text-red-600" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* APPLICATION PREFERENCES */}
        <Card title="Interface & Regional Preferences" subtitle="Display language and accessibility options">
          <div className="divide-y divide-neutral-100">

            {/* Language Selection */}
            <div className="flex items-center justify-between py-3.5 first:pt-0">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary-800">
                  <Icon name="speech" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Application Language</p>
                  <p className="text-[11px] text-neutral-500">Currently: {i18n.language === 'en' ? 'English' : 'हिंदी (Hindi)'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleLanguage}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Switch to {i18n.language === 'en' ? 'हिंदी' : 'English'}
              </button>
            </div>

            {/* Biometric Verification */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-50 text-teal-800">
                  <Icon name="shield" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Biometric Quick Authentication</p>
                  <p className="text-[11px] text-neutral-500">Allow fingerprint authentication on supported mobile devices</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={biometric}
                onClick={() => setBiometric(!biometric)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                  biometric ? 'bg-teal-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    biometric ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Clinical Push Notifications */}
            <div className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-800">
                  <Icon name="alerts" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Clinical Follow-up Notifications</p>
                  <p className="text-[11px] text-neutral-500">Alerts for overdue milestone reviews and pending hospital referrals</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                  notifications ? 'bg-teal-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Offline Data & Sync */}
            <div className="flex items-center justify-between py-3.5 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary-800">
                  <Icon name="refresh" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Sync Exclusively on Wi-Fi</p>
                  <p className="text-[11px] text-neutral-500">Save cellular mobile data when screening in remote field areas</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={syncOnWifi}
                onClick={() => setSyncOnWifi(!syncOnWifi)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                  syncOnWifi ? 'bg-teal-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    syncOnWifi ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </Card>

        {/* SECURITY & PROTOCOL COMPLIANCE */}
        <Card title="Compliance & Diagnostic Reference" subtitle="National Health Mission standards">
          <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <span className="font-semibold text-neutral-700">Diagnostic Scoring Standard</span>
              <span className="font-bold text-neutral-900">RBSK Milestone Dataset v2.4</span>
            </div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <span className="font-semibold text-neutral-700">Data Protection & Privacy</span>
              <span className="font-bold text-emerald-800 inline-flex items-center gap-1">
                <Icon name="shield" className="h-3.5 w-3.5" /> DISHA / Ayushman Bharat Compliant
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700">Client Build Version</span>
              <span className="text-neutral-500">SPARSH v1.2.4 (Production Release)</span>
            </div>
          </div>
        </Card>

      </div>
    </AppLayout>
  )
}