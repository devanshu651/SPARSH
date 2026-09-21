import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AuthShell from '../components/AuthShell'
import BrandLogo from '../components/BrandLogo'
import Button from '../components/Button'
import Input from '../components/Input'

import { authService, readableAuthError } from '../services/auth'
import { usersApi } from '../services/api'
import { useApp } from '../context/AppContext'
import { startDemoMode, demoAvailable } from '../services/demo'

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
      setError('Enter a valid 10-digit mobile number.')
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

      const profile = await usersApi.getMe()

      setCurrentWorker({
        ...profile,
        email: credential.user.email,
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

  return (
    <AuthShell>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="
          absolute
          left-6
          top-7
          z-30
          rounded-full
          bg-white/10
          p-2
          text-white/90
          transition
          hover:bg-white/20
          focus:outline-none
          focus:ring-2
          focus:ring-white
        "
        aria-label="Back to welcome screen"
      >
        ←
      </button>

      {/* Logo section */}
      <div className="relative z-10 shrink-0 px-7 pb-6 pt-10 text-center sm:px-10">

        {/* Language switch */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')
            }
            className="
              min-h-10
              rounded-full
              bg-white/15
              px-3
              text-xs
              font-bold
              text-white
              transition
              hover:bg-white/25
            "
          >
            {i18n.language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <BrandLogo className="mx-auto mt-2 h-[4.5rem] w-[4.5rem]" />

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
          SPARSH
        </h1>

        <p className="mt-1 text-[0.63rem] font-bold tracking-[0.12em] text-cyan-100">
          CHILD DEVELOPMENT SCREENING
        </p>

      </div>

      {/* Login form */}
      <form
        onSubmit={submit}
        noValidate
        className="
          relative
          z-20
          flex
          flex-1
          flex-col
          rounded-t-[2rem]
          bg-white
          px-6
          pb-7
          pt-6
          shadow-[0_-12px_30px_rgba(7,31,89,0.12)]
          sm:px-8
        "
      >

        {/* Heading */}
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900">
            {t('login.welcome')}
          </h2>

          <p className="mt-1 text-sm leading-5 text-neutral-500">
            Sign in to continue supporting children.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">

          {/* Mobile number */}
          <label className="block">

            <span className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Mobile number
            </span>

            <div
              className={`
                flex
                min-h-11
                overflow-hidden
                rounded-xl
                border
                bg-white
                transition
                focus-within:border-primary-700
                focus-within:ring-2
                focus-within:ring-primary-100
                ${
                  error &&
                  !/^\d{10}$/.test(mobile.replace(/\s/g, ''))
                    ? 'border-risk-high'
                    : 'border-neutral-200'
                }
              `}
            >

              <span className="flex items-center border-r border-neutral-200 px-3 text-sm font-semibold text-neutral-700">
                +91
              </span>

              <input
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value.replace(/[^\d\s]/g, '')
                  )
                }
                inputMode="numeric"
                autoComplete="tel"
                maxLength={12}
                placeholder="Enter 10-digit mobile number"
                className="
                  min-w-0
                  flex-1
                  px-3
                  text-sm
                  text-neutral-900
                  outline-none
                  placeholder:text-neutral-400
                "
              />

            </div>

          </label>

          {/* Password */}
          <div className="relative">

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute
                bottom-2.5
                right-3
                text-xs
                font-semibold
                text-primary-700
                hover:text-primary-900
              "
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="-mt-1 text-xs font-medium text-risk-high"
            >
              {error}
            </p>
          )}

        </div>

        {/* Login */}
        <Button
          type="submit"
          disabled={loading}
          className="mt-5 w-full"
        >
          {loading ? 'Signing in…' : 'Login to dashboard'}
        </Button>

        {/* Demo mode */}
        {demoAvailable && (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full"
            onClick={exploreDemo}
          >
            Explore demo without login
          </Button>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">

          <span className="h-px flex-1 bg-neutral-100" />

          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-400">
            or secure sign in
          </span>

          <span className="h-px flex-1 bg-neutral-100" />

        </div>

        {/* Fingerprint */}
        <button
          type="button"
          disabled
          title="Device biometric authentication requires native credential integration."
          className="
            flex
            min-h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-neutral-200
            text-sm
            font-semibold
            text-neutral-400
          "
        >
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full bg-neutral-50 text-sm"
          >
            ◉
          </span>

          Login with Fingerprint (coming soon)
        </button>

        {/* Register */}
        <p className="mt-auto pt-5 text-center text-xs text-neutral-500">

          New to SPARSH?{' '}

          <button
            type="button"
            onClick={onRegister}
            className="font-bold text-teal-700 underline underline-offset-2"
          >
            Register here
          </button>

        </p>

        <p className="mt-5 text-center text-[10px] text-neutral-400">
          Government of India · Ministry of Women &amp; Child Development
        </p>

      </form>

    </AuthShell>
  )
}