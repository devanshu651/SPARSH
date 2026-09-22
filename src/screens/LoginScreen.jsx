import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import Input from '../components/Input'
import Icon from '../components/Icon'
import { authService, readableAuthError } from '../services/auth'
import { usersApi } from '../services/api'
import { useApp } from '../context/AppContext'
import { startDemoMode } from '../services/demo'

export default function LoginScreen({ onBack, onLogin, onRegister }) {
  const { t, i18n } = useTranslation()
  const { setCurrentWorker, demoWorker } = useApp()

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

    try {
      const credential = await authService.signInWithEmailPassword(
        `${cleanMobile}@sparsh.local`,
        password
      )

      const meCall = usersApi.getMe()
      const profile = typeof meCall === 'function' ? await meCall() : await meCall

      setCurrentWorker({
        ...profile,
        email: credential.user.email
      })

      onLogin?.()
    } catch (err) {
      setError(readableAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  function exploreDemo() {
    startDemoMode()
    setCurrentWorker(demoWorker)
    onLogin?.()
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')
  }

  return (
    <AuthShell>
      <div className="space-y-6 py-4">

        {/* TOP CONTROLS */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-primary-800 hover:bg-neutral-50"
          >
            {i18n.language === 'en' ? 'हिंदी (Hindi)' : 'English'}
          </button>
        </div>

        {/* HEADING */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {t('login.welcome', 'Sign in to SPARSH')}
          </h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            Enter your registered Anganwadi worker mobile number and password.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={submit} noValidate className="space-y-4">

          {/* Mobile number with +91 prefix */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Registered Mobile Number *
            </span>
            <div className={`flex min-h-11 overflow-hidden rounded-lg border bg-white transition focus-within:border-primary-700 focus-within:ring-2 focus-within:ring-primary-100 ${
              error && !/^\d{10}$/.test(mobile.replace(/\s/g, ''))
                ? 'border-red-500'
                : 'border-neutral-300'
            }`}>
              <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-xs font-bold text-neutral-600">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your worker password"
              error={error && password.length < 6 ? 'Password is required' : ''}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-xs font-semibold text-primary-700 hover:text-primary-900"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-sm font-bold"
            disabled={loading}
            loading={loading}
          >
            Sign In to Field Dashboard
          </Button>

          {/* EXPLORE DEMO MODE */}
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs font-semibold border-teal-200 text-teal-800 bg-teal-50/50 hover:bg-teal-50"
              onClick={exploreDemo}
            >
              <span>Explore as Demo Health Worker (Offline Ready)</span>
            </Button>
          </div>
        </form>

        {/* WORKER ENROLMENT GUIDANCE */}
        <div className="border-t border-neutral-100 pt-4 text-center">
          <p className="text-xs text-neutral-500">
            Need account access for your Anganwadi centre?
          </p>
          <button
            type="button"
            onClick={onRegister}
            className="mt-1 text-xs font-bold text-primary-700 hover:text-primary-900 hover:underline"
          >
            View Worker Provisioning Instructions →
          </button>
        </div>

      </div>
    </AuthShell>
  )
}