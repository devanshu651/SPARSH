export default function Input({
  label,
  id,
  error,
  helperText,
  required = false,
  className = '',
  leftIcon,
  rightIcon,
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
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 text-[#5A6660]">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          className={`min-h-[48px] w-full rounded-xl border border-[#E5EBE7] bg-white text-sm text-[#1A201E] outline-none transition placeholder:text-[#8E9C95] focus:border-[#1B4D3E] focus:ring-2 focus:ring-[#E8F0EC] ${
            leftIcon ? 'pl-11 pr-3.5' : rightIcon ? 'pl-3.5 pr-11' : 'px-3.5'
          } ${
            error ? 'border-[#D32F2F] focus:border-[#D32F2F] focus:ring-[#FDE8E8]' : ''
          }`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-[#5A6660]">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-[#D32F2F]" role="alert">{error}</span>
      ) : helperText ? (
        <span className="mt-1.5 block text-xs text-[#5A6660]">{helperText}</span>
      ) : null}
    </label>
  )
}
