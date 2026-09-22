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
      className={`rounded-xl border border-neutral-200/85 bg-white shadow-card ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className={`flex items-center justify-between gap-3 px-5 py-4 ${headerBorder ? 'border-b border-neutral-100' : ''}`}>
          <div>
            {title && <h2 className="text-base font-bold text-neutral-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={hasHeader ? 'p-5' : 'p-5'}>
        {children}
      </div>
    </section>
  )
}
