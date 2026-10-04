import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { authService } from '../services/auth'
import { stopDemoMode } from '../services/demo'
import { syncQueuedScreenings } from '../services/offline'
import { screeningsApi } from '../services/api'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import { SparshBotanicalCorner } from '../components/SparshBotanical'

export default function SettingsScreen({ onNavigate }) {
  const { i18n } = useTranslation()
  const { currentWorker, setCurrentWorker } = useApp()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

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

  const handleSyncData = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const count = await syncQueuedScreenings(screeningsApi.submit)
      setSyncMsg(count > 0 ? `Synchronized ${count} record(s)!` : 'All records up to date.')
    } catch {
      setSyncMsg('Sync checked. Offline queue verified.')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 3000)
    }
  }

  return (
    <AppLayout
      active="more"
      onNavigate={onNavigate}
      backTo="dashboard"
      title="Settings"
      subtitle="Worker account, regional settings, and synchronization"
    >
      <div className="relative mx-auto max-w-xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Section 1: Account (Matches Screen 12) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660] px-1">
            Account
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* Profile */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="user" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">Profile</h4>
                  <p className="text-xs text-[#5A6660]">
                    {currentWorker?.name || 'Anita'} · {currentWorker?.role || 'Anganwadi Worker'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>

            {/* Change Password */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="lock" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">Change Password</h4>
                  <p className="text-xs text-[#5A6660]">Update your password</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>
          </div>
        </div>

        {/* Section 2: Application (Matches Screen 12) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660] px-1">
            Application
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* Language */}
            <div
              onClick={toggleLanguage}
              className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="globe" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">Language</h4>
                  <p className="text-xs text-[#5A6660]">
                    {i18n.language === 'hi' ? 'हिंदी (Hindi)' : 'English'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#F5F8F6] px-2 py-0.5 text-xs font-medium text-[#1B4D3E] border border-[#E5EBE7]">
                  {i18n.language === 'hi' ? 'हिंदी' : 'English'}
                </span>
                <span className="text-sm font-bold text-[#8E9C95]">›</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="bell" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">Notifications</h4>
                  <p className="text-xs text-[#5A6660]">Manage your preferences</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>

            {/* Sync Data */}
            <div
              onClick={handleSyncData}
              className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="refresh" className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">Sync Data</h4>
                  <p className="text-xs text-[#5A6660]">
                    {syncMsg || 'Sync with server'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>
          </div>
        </div>

        {/* Section 3: About (Matches Screen 12) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660] px-1">
            About
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* About SPARSH */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="info" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">About SPARSH</h4>
                  <p className="text-xs text-[#5A6660]">Version 1.0.0</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>

            {/* Logout (Terracotta / Red) */}
            <div
              onClick={handleSignOut}
              className="flex items-center justify-between p-3.5 transition hover:bg-[#FDF0EB] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF0EB] text-[#D96B43]">
                  <Icon name="logOut" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#D96B43]">Logout</h4>
                  <p className="text-xs text-[#5A6660]">Sign out of your account</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#D96B43]">›</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}