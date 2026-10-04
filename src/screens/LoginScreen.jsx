import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AuthShell from '../components/AuthShell'
import BrandLogo from '../components/BrandLogo'
import SparshBotanical from '../components/SparshBotanical'
import Icon from '../components/Icon'
import { authService, readableAuthError } from '../services/auth'
import { useApp } from '../context/AppContext'
import { firebaseConfigError } from '../lib/firebase'

export default function LoginScreen({ onBack, onLogin, onRegister }) {
  const { t, i18n } = useTranslation()
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

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')
  }

  return (
    <AuthShell showBackground>
      <div className="space-y-4 sm:space-y-6 py-2 relative">
        <SparshBotanical variant="top-left" opacity="opacity-20" />
        <SparshBotanical variant="bottom-right" opacity="opacity-25" />

        {/* Top Controls: Back and Language Toggle */}
        <div className="flex items-center justify-between relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EBE7] bg-white px-3 py-1.5 text-xs font-semibold text-[#5A6660] hover:bg-[#F5F8F6] transition-colors"
          >
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className="rounded-xl border border-[#E5EBE7] bg-white px-3 py-1.5 text-xs font-semibold text-[#1B4D3E] hover:bg-[#EBF2EE] transition-colors"
          >
            {i18n.language === 'en' ? 'हिंदी (Hindi)' : 'English'}
          </button>
        </div>

        {/* Centered SPARSH Logo & Welcome Back matching Screen 2 in reference */}
        <div className="text-center pt-2 relative z-10">
          <BrandLogo className="h-14 w-14 mx-auto" showWordmark stacked />
          <h2 className="mt-4 text-xl font-bold tracking-tight text-[#1A201E] font-heading">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs text-[#5A6660]">
            Sign in to continue to SPARSH
          </p>
          {(authError || firebaseConfigError) && (
            <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" role="status">
              {authError?.message || firebaseConfigError}
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={submit} noValidate className="space-y-4 relative z-10">
          {/* Mobile / Phone Input with Icon */}
          <div className="space-y-1">
            <span className="block text-xs font-bold text-[#1A201E]">
              Registered Mobile *
            </span>
            <div
              className={`flex min-h-[48px] overflow-hidden rounded-xl border bg-white transition-all focus-within:border-[#1B4D3E] focus-within:ring-2 focus-within:ring-[#E8F0EC] ${
                error && !/^\d{10}$/.test(mobile.replace(/\s/g, ''))
                  ? 'border-[#D32F2F]'
                  : 'border-[#E5EBE7]'
              }`}
            >
              <div className="flex items-center gap-1.5 border-r border-[#E5EBE7] bg-[#FAFCFA] px-3 text-[#5A6660]">
                <Icon name="user" className="h-4 w-4 text-[#8E9C95]" />
                <span className="text-xs font-bold text-[#1A201E]">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-3 text-sm text-[#1A201E] outline-none placeholder:text-[#8E9C95] bg-transparent"
              />
            </div>
          </div>

          {/* Password Input with Lock Icon & Toggle */}
          <div className="space-y-1">
            <span className="block text-xs font-bold text-[#1A201E]">
              Password *
            </span>
            <div
              className={`flex min-h-[48px] items-center overflow-hidden rounded-xl border bg-white px-3 transition-all focus-within:border-[#1B4D3E] focus-within:ring-2 focus-within:ring-[#E8F0EC] ${
                error && password.length < 6 ? 'border-[#D32F2F]' : 'border-[#E5EBE7]'
              }`}
            >
              <Icon name="shield" className="h-4 w-4 text-[#8E9C95] mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full text-sm text-[#1A201E] outline-none placeholder:text-[#8E9C95] bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-[#5A6660] hover:text-[#1B4D3E] ml-2 shrink-0"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Forgot Password Right Aligned in Terracotta */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => alert('Password reset link sent to your registered mobile number.')}
              className="text-xs font-bold text-[#D96B43] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-[#FDE8E8] p-3 text-xs font-medium text-[#D32F2F] border border-[#F8C4C4]" role="alert">
              {error}
            </div>
          )}

          {/* Large Dark Forest Green Sign In Button matching reference */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[50px] rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        {/* Worker Provisioning / Sign Up link in Terracotta matching reference */}
        <div className="pt-2 text-center text-xs text-[#5A6660] relative z-10">
          <span>Need account access for your Anganwadi centre? </span>
          <button
            type="button"
            onClick={onRegister}
            className="font-bold text-[#D96B43] hover:underline"
          >
            Sign Up
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
