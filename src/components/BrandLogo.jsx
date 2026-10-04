export default function BrandLogo({
  className = 'h-10 w-10',
  showWordmark = false,
  showTagline = false,
  light = false,
  stacked = false
}) {
  const textColor = light ? 'text-white' : 'text-[#1A201E]'
  const subColor = light ? 'text-[#D2E3D8]' : 'text-[#5A6660]'

  const logoMark = (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Central warm terracotta fruit / sun circle */}
      <circle cx="32" cy="18" r="7" fill="#D96B43" />

      {/* Main dark forest green right leaf */}
      <path
        d="M32 28C36 28 47 31 47 44C47 48 44 51 38 49C31 47 30 38 32 28Z"
        fill="#1B4D3E"
      />

      {/* Sage green left leaf */}
      <path
        d="M32 30C27 30 17 33 17 44C17 47 20 50 25 48C31 45 31 38 32 30Z"
        fill="#729082"
      />

      {/* Small warm terracotta accent leaf / petal */}
      <path
        d="M26 23C23 24 20 27 21 30C22 32 25 32 27 30C28 27 28 24 26 23Z"
        fill="#D96B43"
      />

      {/* Soft connecting stem curve */}
      <path
        d="M32 32C32 40 33 48 31 52"
        stroke="#1B4D3E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )

  if (stacked) {
    return (
      <div className="flex flex-col items-center text-center">
        {logoMark}
        {showWordmark && (
          <div className={`mt-2 ${textColor}`}>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading">SPARSH</h1>
            {showTagline && (
              <p className={`mt-1 text-xs font-medium max-w-xs ${subColor}`}>
                Supporting Every Child&apos;s Brighter Tomorrow
              </p>
            )}
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
          <p className="text-base font-bold tracking-tight leading-tight font-heading">SPARSH</p>
          {showTagline ? (
            <p className={`text-[10px] font-medium leading-tight ${subColor}`}>
              Supporting Every Child&apos;s Brighter Tomorrow
            </p>
          ) : (
            <p className={`text-[10px] font-medium tracking-wide ${subColor}`}>
              Child Development Screening
            </p>
          )}
        </div>
      )}
    </div>
  )
}