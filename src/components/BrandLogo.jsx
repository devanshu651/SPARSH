export default function BrandLogo({ className = 'h-16 w-16', showWordmark = false, light = false }) {
  const textColor = light ? 'text-white' : 'text-primary-800'
  return (
    <div className="flex items-center gap-3">
      <div className={`grid place-items-center rounded-[1.35rem] bg-white/15 p-1.5 shadow-[0_10px_28px_rgba(9,36,96,0.22)] ring-1 ring-white/25 ${className}`}>
        <img src="/sparsh-logo.svg" alt="SPARSH logo" className="h-full w-full" />
      </div>
      {showWordmark && <div className={textColor}><p className="text-xl font-extrabold tracking-[0.08em]">SPARSH</p><p className="text-[0.6rem] font-semibold tracking-[0.13em] opacity-80">EARLY DETECTION, BRIGHTER FUTURES</p></div>}
    </div>
  )
}