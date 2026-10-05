import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { authService } from '../services/auth'
import { syncQueuedScreenings } from '../services/offline'
import { screeningsApi } from '../services/api'
import AppLayout from '../components/AppLayout'
import Icon from '../components/Icon'
import LanguageSelector from '../components/LanguageSelector'
import { SparshBotanicalCorner } from '../components/SparshBotanical'

export default function SettingsScreen({ onNavigate }) {
  const { t } = useTranslation()
  const { currentWorker, setCurrentWorker } = useApp()
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  const handleSignOut = async () => {
    try {
      await authService.signOut()
    } catch {}
    setCurrentWorker(null)
    onNavigate('login')
  }

  const handleSyncData = async () => {
    setSyncing(true)
    setSyncMsg('')
    try {
      const count = await syncQueuedScreenings(screeningsApi.submit)
      setSyncMsg(count > 0 ? t('settings.syncSuccess', { count }) : t('settings.allUpToDate'))
    } catch {
      setSyncMsg(t('settings.syncChecked'))
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMsg(''), 3000)
    }
  }

  const workerName = currentWorker?.name || currentWorker?.uid || 'Authenticated worker'
  const workerRole = currentWorker?.role ? currentWorker.role.toUpperCase() : 'WORKER'
  const centreId = currentWorker?.centre_ids?.[0] || 'No centre assigned'

  return (
    <AppLayout
      active="more"
      onNavigate={onNavigate}
      backTo="dashboard"
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
    >
      <div className="relative mx-auto max-w-xl p-4 sm:p-6 lg:p-8 space-y-6">
        <SparshBotanicalCorner position="top-right" className="opacity-25" />

        {/* Section 1: Account (Matches Screen 12) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660] px-1">
            {t('settings.account')}
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* Profile */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="user" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">{workerName}</h4>
                  <p className="text-xs text-[#5A6660]">
                    {t('common.role')}: {workerRole} · {centreId}
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
                  <h4 className="text-sm font-semibold text-[#1A201E]">{t('settings.changePassword')}</h4>
                  <p className="text-xs text-[#5A6660]">{t('settings.changePasswordDesc')}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#8E9C95]">›</span>
            </div>
          </div>
        </div>

        {/* Section 2: Application (Matches Screen 12) */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A6660] px-1">
            {t('settings.application')}
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* UI Language Selector */}
            <div className="p-3.5 sm:p-4 transition hover:bg-[#F9FBFA]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                    <Icon name="globe" className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1A201E]">{t('settings.uiLanguage')}</h4>
                    <p className="text-xs text-[#5A6660]">
                      {t('settings.uiLanguageDesc')}
                    </p>
                  </div>
                </div>
                <div className="self-start sm:self-auto">
                  <LanguageSelector size="sm" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="bell" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">{t('settings.notifications')}</h4>
                  <p className="text-xs text-[#5A6660]">{t('settings.notificationsDesc')}</p>
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
                  <h4 className="text-sm font-semibold text-[#1A201E]">{t('settings.syncOfflineData')}</h4>
                  <p className="text-xs text-[#5A6660]">
                    {syncMsg || t('settings.syncOfflineDataDesc')}
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
            {t('settings.aboutAndSecurity')}
          </h3>
          <div className="rounded-2xl border border-[#E5EBE7] bg-white divide-y divide-[#F0F4F2] shadow-2xs overflow-hidden">
            {/* About SPARSH */}
            <div className="flex items-center justify-between p-3.5 transition hover:bg-[#F9FBFA] cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF2EE] text-[#1B4D3E]">
                  <Icon name="info" className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A201E]">{t('settings.aboutSparsh')}</h4>
                  <p className="text-xs text-[#5A6660]">{t('settings.aboutSparshDesc')}</p>
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
                  <h4 className="text-sm font-semibold text-[#D96B43]">{t('settings.logout')}</h4>
                  <p className="text-xs text-[#5A6660]">{t('settings.logoutDesc')}</p>
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
