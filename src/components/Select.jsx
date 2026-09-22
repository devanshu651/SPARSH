import Icon from './Icon'

export default function Select({
  label,
  id,
  error,
  helperText,
  required = false,
  className = '',
  children,
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
        <select
          id={id}
          className={`min-h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-10 text-sm text-neutral-900 outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100 ${
            error ? 'border-red-500 focus:border-red-600 focus:ring-red-100' : 'border-neutral-300'
          }`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 text-neutral-500">
          <Icon name="chevronDown" className="h-4 w-4" />
        </div>
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">{error}</span>
      ) : helperText ? (
        <span className="mt-1.5 block text-xs text-neutral-500">{helperText}</span>
      ) : null}
    </label>
  )
}
