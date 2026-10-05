import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BrandLogo from '../components/BrandLogo'
import SparshBotanical from '../components/SparshBotanical'
import Icon from '../components/Icon'
import LanguageSelector from '../components/LanguageSelector'
import { authService, readableAuthError } from '../services/auth'
import { useApp } from '../context/AppContext'
import { firebaseConfigError } from '../lib/firebase'

export default function LoginScreen({ onBack, onLogin, onRegister }) {
  const { t } = useTranslation()
  const { loadCurrentWorker, authError } = useApp()

  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const cleanMobile = mobile.replace(/\s/g, '')

    if (!/^\d{10}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    let firebaseSignInSucceeded = false
    try {
      const credential = await authService.signInWithEmailPassword(
        `${cleanMobile}@sparsh.local`,
        password
      )
      firebaseSignInSucceeded = true

      await loadCurrentWorker(credential.user)
      onLogin?.()
    } catch (err) {
      if (firebaseSignInSucceeded && err?.status) {
        setError(`Firebase sign-in succeeded, but SPARSH rejected the session (HTTP ${err.status}): ${err.message}`)
      } else {
        setError(readableAuthError(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen lg:h-screen w-full bg-[#143D31] flex items-center justify-center p-4 sm:p-6 lg:px-8 xl:px-12 lg:py-4 xl:py-6 overflow-x-hidden">
      {/* 1. FULL-PAGE GREEN BACKGROUND WITH MOTHER-CHILD IMAGE ANCHORED ON THE LEFT */}
      <div
        className="absolute inset-y-0 left-0 w-full lg:w-[58%] xl:w-[60%] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Softly blended mother-child visual with focal point centered on mother & child faces */}
        <img
          src="/mother-child.png"
          alt=""
          className="h-full w-full object-cover object-[62%_30%] lg:object-[64%_28%] opacity-35 mix-blend-luminosity filter contrast-110"
        />

        {/* Gradient overlays: gentle on the left to reveal faces, smoothly fading into solid forest green #143D31 on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#143D31]/80 via-[#143D31]/60 to-[#143D31]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#143D31]/70 via-transparent to-[#143D31]/80" />
      </div>

      {/* Decorative botanical leaves positioned at page perimeter */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <SparshBotanical variant="top-left" opacity="opacity-25" className="top-0 left-0" />
        <SparshBotanical variant="top-right" opacity="opacity-20" className="top-0 right-0" />
        <SparshBotanical variant="bottom-left" opacity="opacity-25" className="bottom-0 left-0" />
        <SparshBotanical variant="bottom-right" opacity="opacity-20" className="bottom-0 right-0" />
      </div>

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 xl:gap-14 my-auto py-2 lg:py-0">

        {/* 2. LEFT-SIDE BRANDING / HERO CONTENT (Desktop) */}
        <section className="hidden lg:flex flex-col justify-center flex-1 max-w-lg xl:max-w-xl text-white pr-4 xl:pr-6 select-none">
          {/* Developmental Screening Badge */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#D2E3D8] border border-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D96B43]" />
              <span>{t('login.badge')}</span>
            </span>
          </div>

          {/* Core SPARSH Message */}
          <h1 className="mt-4 xl:mt-5 text-3xl lg:text-4xl xl:text-[42px] font-extrabold tracking-tight text-white leading-tight font-heading">
            {t('login.title')} <br />
            {t('login.titleLine2')}
          </h1>

          {/* Supporting Clinical Description */}
          <p className="mt-3 text-sm lg:text-base leading-relaxed text-[#D2E3D8] max-w-md">
            {t('login.desc')}
          </p>

          {/* Subtle Feature Highlight Chips */}
          <div className="grid grid-cols-2 gap-3 pt-5 max-w-md">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-3.5">
              <span className="font-bold text-white text-xs sm:text-sm block">{t('login.milestoneScreening')}</span>
              <span className="text-[#D2E3D8] text-[11px] sm:text-xs mt-0.5 block">{t('login.domains')}</span>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-3.5">
              <span className="font-bold text-white text-xs sm:text-sm block">{t('login.offlineFirst')}</span>
              <span className="text-[#D2E3D8] text-[11px] sm:text-xs mt-0.5 block">{t('login.syncDesc')}</span>
            </div>
          </div>

          {/* Institutional Alignment Footer */}
          <div className="mt-6 pt-4 border-t border-white/15 text-xs text-[#D2E3D8]/80 space-y-0.5">
            <p className="font-bold text-white">{t('login.footerTitle')}</p>
            <p className="text-[11px] text-[#D2E3D8]/75">{t('login.footerSubtitle')}</p>
          </div>
        </section>

        {/* Compact Mobile Brand Header (Visible only on < lg) */}
        <div className="lg:hidden text-center text-white mb-2 max-w-md mx-auto select-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#D2E3D8] border border-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D96B43]" />
            <span>{t('login.badge')}</span>
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            {t('login.title')} {t('login.titleLine2')}
          </h1>
          <p className="mt-1 text-xs text-[#D2E3D8]/90 max-w-xs mx-auto">
            {t('login.desc')}
          </p>
        </div>

        {/* 3. FLOATING LOGIN CARD CONTAINER */}
        <div className="w-full max-w-[460px] lg:max-w-[480px] xl:max-w-[500px] shrink-0 relative">
          {/* Subtle botanical decoration near floating card corner */}
          <SparshBotanical
            variant="bottom-left"
            opacity="opacity-15"
            className="-bottom-5 -left-5 hidden sm:block pointer-events-none"
          />

          {/* Floating White Card */}
          <section
            className="relative z-10 w-full rounded-[28px] bg-white border border-[#E5EBE7] shadow-[0_20px_50px_rgba(12,40,32,0.25)] p-5 sm:p-7 lg:py-6 lg:px-8 transition-all"
            aria-labelledby="login-heading"
          >
            {/* Top Bar: Back & Language Switcher */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EBE7] bg-[#FAFCFA] px-3 py-1.5 text-xs font-semibold text-[#5A6660] hover:text-[#1A201E] hover:bg-[#F3F6F4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30"
                aria-label={t('common.back')}
              >
                <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                <span>{t('common.back')}</span>
              </button>

              <LanguageSelector size="sm" />
            </div>

            {/* SPARSH Logo & Welcome Back */}
            <div className="text-center pt-2 sm:pt-3 pb-1">
              <BrandLogo className="h-11 w-11 sm:h-12 sm:w-12 mx-auto" showWordmark stacked />
              <h2
                id="login-heading"
                className="mt-2 sm:mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-[#1A201E] font-heading"
              >
                {t('login.welcomeBack')}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-[#5A6660]">
                {t('login.signInSubtitle')}
              </p>
              {(authError || firebaseConfigError) && (
                <div
                  className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 text-left"
                  role="status"
                >
                  {authError?.message || firebaseConfigError}
                </div>
              )}
            </div>

            {/* 4. LOGIN FORM */}
            <form onSubmit={submit} noValidate className="mt-4 sm:mt-5 space-y-3.5">
              {/* Registered Mobile */}
              <div className="space-y-1 text-left">
                <label htmlFor="login-mobile" className="block text-xs font-bold text-[#1A201E]">
                  {t('login.mobileLabel')} <span className="text-[#D96B43]">*</span>
                </label>
                <div
                  className={`flex min-h-[46px] sm:min-h-[48px] overflow-hidden rounded-xl border bg-[#FAFCFA] transition-all focus-within:bg-white focus-within:border-[#1B4D3E] focus-within:ring-2 focus-within:ring-[#1B4D3E]/20 ${
                    error && !/^\d{10}$/.test(mobile.replace(/\s/g, ''))
                      ? 'border-[#D32F2F]'
                      : 'border-[#E5EBE7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 border-r border-[#E5EBE7] bg-[#F5F8F6] px-3 text-[#5A6660] select-none">
                    <Icon name="user" className="h-4 w-4 text-[#729082]" />
                    <span className="text-xs font-bold text-[#1A201E]">+91</span>
                  </div>
                  <input
                    id="login-mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('login.mobilePlaceholder')}
                    autoComplete="tel"
                    className="w-full px-3 text-sm text-[#1A201E] outline-none placeholder:text-[#8E9C95] bg-transparent font-medium"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 text-left">
                <label htmlFor="login-password" className="block text-xs font-bold text-[#1A201E]">
                  {t('login.passwordLabel')} <span className="text-[#D96B43]">*</span>
                </label>
                <div
                  className={`flex min-h-[46px] sm:min-h-[48px] items-center overflow-hidden rounded-xl border bg-[#FAFCFA] px-3 transition-all focus-within:bg-white focus-within:border-[#1B4D3E] focus-within:ring-2 focus-within:ring-[#1B4D3E]/20 ${
                    error && password.length < 6 ? 'border-[#D32F2F]' : 'border-[#E5EBE7]'
                  }`}
                >
                  <Icon name="shield" className="h-4 w-4 text-[#729082] mr-2 shrink-0" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    autoComplete="current-password"
                    className="w-full text-sm text-[#1A201E] outline-none placeholder:text-[#8E9C95] bg-transparent font-medium"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-bold text-[#5A6660] hover:text-[#1B4D3E] ml-2 shrink-0 py-1 px-1.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#1B4D3E]"
                    aria-label={showPassword ? t('login.hide') : t('login.show')}
                  >
                    {showPassword ? t('login.hide') : t('login.show')}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right pt-0.5">
                <button
                  type="button"
                  onClick={() => alert(t('login.forgotAlert'))}
                  className="text-xs font-bold text-[#D96B43] hover:text-[#C85A32] hover:underline transition-colors focus:outline-none focus:underline"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div
                  className="rounded-xl bg-[#FDE8E8] p-2.5 text-xs font-medium text-[#D32F2F] border border-[#F8C4C4] flex items-start gap-2"
                  role="alert"
                >
                  <Icon name="alertTriangle" className="h-4 w-4 shrink-0 text-[#D32F2F] mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] sm:min-h-[50px] rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                    <span>{t('login.signingIn')}</span>
                  </>
                ) : (
                  <span>{t('login.signIn')}</span>
                )}
              </button>
            </form>

            {/* Sign Up / Worker Account Access */}
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 text-center text-xs text-[#5A6660] border-t border-[#E5EBE7]">
              <span>{t('login.needAccount')} </span>
              <button
                type="button"
                onClick={onRegister}
                className="font-bold text-[#D96B43] hover:text-[#C85A32] hover:underline transition-colors ml-1 focus:outline-none focus:underline"
              >
                {t('login.signUp')}
              </button>
            </div>
          </section>
        </div>

      </div>
    </main>
  )
}
