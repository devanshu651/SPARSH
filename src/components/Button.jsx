const variants = {
  primary: 'bg-[#1B4D3E] text-white hover:bg-[#143D31] border border-[#143D31]/10 shadow-xs focus:ring-[#1B4D3E]',
  secondary: 'bg-white text-[#1A201E] border border-[#E5EBE7] hover:bg-[#F5F8F6] shadow-xs focus:ring-[#1B4D3E]',
  sage: 'bg-[#EBF2EE] text-[#1B4D3E] border border-[#D5E3DB] hover:bg-[#D5E3DB] shadow-xs focus:ring-[#1B4D3E]',
  terracotta: 'bg-[#D96B43] text-white hover:bg-[#C85A32] border border-[#C85A32]/20 shadow-xs focus:ring-[#D96B43]',
  outline: 'bg-transparent text-[#1B4D3E] border border-[#1B4D3E] hover:bg-[#EBF2EE] focus:ring-[#1B4D3E]',
  danger: 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] border border-[#B71C1C]/20 shadow-xs focus:ring-[#D32F2F]',
  destructive: 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] border border-[#B71C1C]/20 shadow-xs focus:ring-[#D32F2F]',
  ghost: 'bg-transparent text-[#5A6660] hover:text-[#1A201E] hover:bg-[#F5F8F6] focus:ring-[#5A6660]'
}

const sizes = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs',
  md: 'min-h-[44px] px-4 py-2.5 text-sm',
  lg: 'min-h-[50px] px-5 py-3 text-base'
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
