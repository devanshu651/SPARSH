export default function BrandLogo({ className = 'h-10 w-10', showWordmark = false, showTagline = false, light = false, stacked = false }) {
  const textColor = light ? 'text-white' : 'text-primary-900'
  const subColor = light ? 'text-teal-200' : 'text-teal-700'
  const logoMark = (
    <div className={`grid place-items-center rounded-xl p-0.5 ${className}`}>
      <img src="/sparsh-logo.svg" alt="SPARSH logo" className="h-full w-full object-contain" />
    </div>
  )

  if (stacked) {
    return (
      <div className="flex flex-col items-center text-center">
        {logoMark}
        {showWordmark && (
          <div className={`mt-2 ${textColor}`}>
            <p className="font-heading text-xl font-extrabold tracking-tight">SPARSH</p>
            {showTagline && <p className={`mt-1 max-w-xs text-xs font-medium ${subColor}`}>Child Development Screening</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      {logoMark}
      {showWordmark && (
        <div className={textColor}>
          <p className="text-base font-bold tracking-tight leading-tight">SPARSH</p>
          <p className={`text-[10px] font-medium tracking-wide ${subColor}`}>{showTagline ? 'Supporting Every Child’s Brighter Tomorrow' : 'Child Development Screening'}</p>
        </div>
      )}
    </div>
  )
}
