export default function Card({
  title,
  subtitle,
  action,
  headerBorder = true,
  className = '',
  children,
  ...props
}) {
  const hasHeader = title || subtitle || action

  return (
    <section
      className={`rounded-2xl border border-[#E5EBE7] bg-white shadow-card ${className}`}
      {...props}
    >
      {hasHeader && (
        <div
          className={`flex items-center justify-between gap-3 px-5 py-4 ${
            headerBorder ? 'border-b border-[#F3F6F4]' : ''
          }`}
        >
          <div>
            {title && <h2 className="text-base font-bold text-[#1A201E]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-[#5A6660]">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </section>
  )
}
