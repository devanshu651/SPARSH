import { useState } from 'react'
import BottomNav from '../components/BottomNav'

export default function SettingsScreen({ onNavigate }) {
  const [biometric, setBiometric] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      {/* Header */}
      <header className="bg-health-gradient text-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5 lg:px-8">
          <button
            type="button"
            onClick={() => onNavigate?.('dashboard')}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              SPARSH
            </p>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-5 lg:px-8 lg:pt-8">

        {/* Profile */}
        <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-4 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
              S
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-neutral-900">
                Sunita Devi
              </h2>
              <p className="text-xs text-neutral-500">
                Anganwadi Worker · Nashik
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                ● Active · AWW-MH-2847
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat value="284" label="Screened" />
            <Stat value="23" label="Referrals" />
            <Stat value="98%" label="Accuracy" />
          </div>
        </section>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingRow
            icon="♙"
            iconClass="bg-blue-50 text-blue-600"
            title="Profile"
            subtitle="AWW Sunita Devi · ID: AWW-MH-2847"
          />

          <SettingRow
            icon="▣"
            iconClass="bg-violet-50 text-violet-600"
            title="Change Password"
            subtitle="Last changed 30 days ago"
          />

          <ToggleRow
            icon="◉"
            iconClass="bg-teal-50 text-teal-600"
            title="Biometric Login"
            subtitle={biometric ? 'Enabled' : 'Disabled'}
            checked={biometric}
            onChange={() => setBiometric(!biometric)}
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingRow
            icon="◎"
            iconClass="bg-blue-50 text-blue-600"
            title="Language"
            subtitle="English"
          />

          <ToggleRow
            icon="♧"
            iconClass="bg-amber-50 text-amber-600"
            title="Notifications"
            subtitle={notifications ? 'All alerts enabled' : 'Alerts disabled'}
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingRow
            icon="?"
            iconClass="bg-emerald-50 text-emerald-600"
            title="Help & FAQ"
            subtitle="Guides and tutorials"
          />

          <SettingRow
            icon="⌕"
            iconClass="bg-teal-50 text-teal-600"
            title="Helpline"
            subtitle="1800-111-555 (Toll Free)"
          />

          <SettingRow
            icon="ⓘ"
            iconClass="bg-slate-100 text-slate-600"
            title="About"
            subtitle="v2.4.1 · MoWCD · Govt. of India"
          />
        </SettingsSection>

        {/* Sign out */}
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-500 transition hover:bg-red-100"
        >
          ⇥&nbsp; Sign Out
        </button>
      </div>

      <BottomNav
        active="settings"
        onChange={onNavigate}
      />
    </main>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-white px-2 py-2.5 text-center shadow-sm">
      <p className="text-sm font-extrabold text-primary-800">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-neutral-400">
        {label}
      </p>
    </div>
  )
}

function SettingsSection({ title, children }) {
  return (
    <section className="mt-5">
      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {title}
      </p>

      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.04)]">
        {children}
      </div>
    </section>
  )
}

function SettingRow({
  icon,
  iconClass,
  title,
  subtitle,
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3.5 text-left last:border-b-0 hover:bg-neutral-50"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${iconClass}`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-neutral-900">
          {title}
        </span>

        <span className="mt-0.5 block truncate text-[10px] font-medium text-neutral-400">
          {subtitle}
        </span>
      </span>

      <span className="text-sm text-neutral-400">
        →
      </span>
    </button>
  )
}

function ToggleRow({
  icon,
  iconClass,
  title,
  subtitle,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${iconClass}`}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-neutral-900">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] font-medium text-neutral-400">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-emerald-500' : 'bg-neutral-300'
        }`}
        aria-label={`Toggle ${title}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}