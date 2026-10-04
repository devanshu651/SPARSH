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
        <span className="mb-1.5 block text-xs font-bold text-[#1A201E]">
          {label} {required && <span className="text-[#D32F2F]">*</span>}
        </span>
      )}
      <div className="relative flex items-center">
        <select
          id={id}
          className={`min-h-[48px] w-full appearance-none rounded-xl border border-[#E5EBE7] bg-white pl-3.5 pr-10 text-sm text-[#1A201E] outline-none transition focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#E8F0EC] ${
            error ? 'border-[#D32F2F] focus:border-[#D32F2F] focus:ring-[#FDE8E8]' : ''
          }`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3.5 text-[#5A6660]">
          <Icon name="chevronDown" className="h-4 w-4" />
        </div>
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-[#D32F2F]" role="alert">{error}</span>
      ) : helperText ? (
        <span className="mt-1.5 block text-xs text-[#5A6660]">{helperText}</span>
      ) : null}
    </label>
  )
}
