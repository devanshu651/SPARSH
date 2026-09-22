const variants = {
  primary: 'bg-primary-800 text-white hover:bg-primary-900 border border-primary-900/10 shadow-sm focus:ring-primary-700',
  secondary: 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 shadow-sm focus:ring-primary-700',
  teal: 'bg-teal-700 text-white hover:bg-teal-800 border border-teal-800/20 shadow-sm focus:ring-teal-600',
  outline: 'bg-transparent text-primary-800 border border-primary-300 hover:bg-primary-50 focus:ring-primary-700',
  danger: 'bg-red-700 text-white hover:bg-red-800 border border-red-800/20 shadow-sm focus:ring-red-600',
  destructive: 'bg-red-700 text-white hover:bg-red-800 border border-red-800/20 shadow-sm focus:ring-red-600',
  ghost: 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-neutral-400'
}

const sizes = {
  sm: 'min-h-9 px-3 py-1.5 text-xs',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-5 py-3 text-base'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
