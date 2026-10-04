import BrandLogo from './BrandLogo'

export default function AuthShell({
  children,
  className = '',
  showBackground = false
}) {
  return (
    <main className="grid min-h-screen bg-neutral-50 lg:grid-cols-12">
      {/* LEFT SIDE INSTITUTIONAL BRAND PANEL */}
      <section
        className={`relative hidden overflow-hidden text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:col-span-7 xl:p-16 ${
          showBackground
            ? 'bg-primary-950'
            : 'bg-gradient-to-br from-primary-950 via-primary-900 to-teal-950'
        }`}
      >
        {/* Mother-child background image — ONLY when showBackground is true (Splash) */}
        {showBackground && (
          <div className="absolute inset-0">
            <img
              src="/mother-child.png"
              alt=""
              className="h-full w-full object-cover object-center opacity-45 mix-blend-luminosity"
            />
            {/* Dark navy overlay: heavier on the left for maximum text contrast, lighter on the right to keep mother and child clearly visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-950/85 to-primary-950/60" />
          </div>
        )}

        {/* Top brand header */}
        <div className="relative z-10">
          <BrandLogo className="h-10 w-10" showWordmark light />
        </div>

        {/* Core clinical messaging */}
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-teal-200 ring-1 ring-inset ring-white/15">
            Developmental screening and follow-up support
          </span>

          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Early detection for every child. Brighter developmental futures.
          </h2>

          <p className="text-sm leading-relaxed text-teal-100">
            SPARSH equips Anganwadi and community healthcare workers with standardized milestone screening,
            growth monitoring, and timely DEIC clinical referral pathways.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
              <span className="font-bold text-white block">Milestone Screening</span>
              <span className="text-teal-100 text-[11px]">5 Developmental Domains</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5">
              <span className="font-bold text-white block">Offline First</span>
              <span className="text-teal-100 text-[11px]">Syncs in Remote Sub-centres</span>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-teal-100 border-t border-white/15 pt-6">
          <p className="font-semibold text-white">
            Smart Platform for Assessment of Response, Screening & Holistic Development
          </p>
          <p className="mt-1 text-[11px] text-teal-100/80">
            Supporting community health workers across India
          </p>
        </div>
      </section>

      {/* RIGHT SIDE INTERACTIVE FORM PANEL */}
      <section className={`relative flex flex-col justify-center bg-white p-4 py-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-5 ${className}`}>
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </section>
    </main>
  )
}
