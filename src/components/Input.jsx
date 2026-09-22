export default function Input({
  label,
  id,
  error,
  helperText,
  required = false,
  className = '',
  leftIcon,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`min-h-11 w-full rounded-lg border bg-white text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-100 ${
            leftIcon ? 'pl-10 pr-3.5' : 'px-3.5'
          } ${
            error ? 'border-red-500 focus:border-red-600 focus:ring-red-100' : 'border-neutral-300'
          }`}
          {...props}
        />
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">{error}</span>
      ) : helperText ? (
        <span className="mt-1.5 block text-xs text-neutral-500">{helperText}</span>
      ) : null}
    </label>
  )
}
