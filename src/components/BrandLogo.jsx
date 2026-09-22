export default function BrandLogo({ className = 'h-10 w-10', showWordmark = false, light = false }) {
  const textColor = light ? 'text-white' : 'text-primary-900'
  const subColor = light ? 'text-teal-200' : 'text-teal-700'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`grid place-items-center rounded-lg p-0.5 ${className}`}>
        <img src="/sparsh-logo.svg" alt="SPARSH logo" className="h-full w-full object-contain" />
      </div>
      {showWordmark && (
        <div className={textColor}>
          <p className="text-base font-bold tracking-tight leading-tight">SPARSH</p>
          <p className={`text-[9px] font-semibold uppercase tracking-wider ${subColor}`}>
            Child Development Screening
          </p>
        </div>
      )}
    </div>
  )
}