import { useState } from 'react'
import AuthShell from '../components/AuthShell'
import BrandLogo from '../components/BrandLogo'
import Button from '../components/Button'
import Input from '../components/Input'

export default function LoginScreen({ onBack, onLogin }) {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function submit(event) {
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

    setError('')
    onLogin?.({ mobile: cleanMobile })
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

        <BrandLogo className="mx-auto h-[4.5rem] w-[4.5rem]" />

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
            Welcome back
          </h2>

          <p className="mt-1 text-sm leading-5 text-neutral-500">
            Sign in to continue monitoring child health and nutrition.
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
                className="min-w-0 flex-1 px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
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
              className="absolute bottom-2.5 right-3 text-xs font-semibold text-primary-700 hover:text-primary-900"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>

            <button
              type="button"
              className="mt-2 text-xs font-semibold text-primary-700 hover:text-primary-900"
            >
              Forgot password?
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

        {/* Login button */}
        <Button
          type="submit"
          className="mt-5 w-full"
        >
          Login to dashboard
        </Button>

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
          onClick={() => onLogin?.({ biometric: true })}
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
            text-primary-800
            transition
            hover:bg-primary-50
            focus:outline-none
            focus:ring-2
            focus:ring-primary-100
          "
        >

          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full bg-primary-50 text-sm"
          >
            ◉
          </span>

          Login with fingerprint

        </button>

        {/* Register */}
        <p className="mt-auto pt-5 text-center text-xs text-neutral-500">

          New to SPARSH?{' '}

          <button
            type="button"
            className="font-bold text-teal-600 hover:text-teal-700"
          >
            Register here
          </button>

        </p>

      </form>

    </AuthShell>
  )
}