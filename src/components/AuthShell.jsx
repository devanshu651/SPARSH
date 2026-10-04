import BrandLogo from './BrandLogo'
import SparshBotanical from './SparshBotanical'

export default function AuthShell({
  children,
  className = '',
  showBackground = true
}) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-12 relative overflow-hidden">
      {/* LEFT SIDE INSTITUTIONAL BRAND PANEL (Desktop >= 1024px) */}
      <section className="relative hidden overflow-hidden text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:col-span-7 xl:p-16 bg-[#1B4D3E]">
        {/* Mother-child background image with dark forest green overlay */}
        {showBackground && (
          <div className="absolute inset-0">
            <img
              src="/mother-child.png"
              alt=""
              className="h-full w-full object-cover object-center opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143D31]/95 via-[#1B4D3E]/85 to-[#1B4D3E]/60" />
          </div>
        )}

        <SparshBotanical variant="top-right" opacity="opacity-30" />

        {/* Top brand header */}
        <div className="relative z-10">
          <BrandLogo className="h-11 w-11" showWordmark light />
        </div>

        {/* Core clinical messaging matching reference tone */}
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-[#D2E3D8] border border-white/20">
            Supporting Every Child&apos;s Brighter Tomorrow
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight font-heading">
            Early Steps. <br />
            Brighter Futures.
          </h2>

          <p className="text-sm leading-relaxed text-[#D2E3D8]">
            A digital companion for Anganwadi workers to track and support child development across frontline communities in India.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="font-bold text-white block">RBSK Standard</span>
              <span className="text-[#D2E3D8] text-[11px]">5 Developmental Domains</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs">
              <span className="font-bold text-white block">Offline First</span>
              <span className="text-[#D2E3D8] text-[11px]">Syncs in Remote Sub-centres</span>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-[#D2E3D8] border-t border-white/15 pt-5">
          <p className="font-bold text-white">
            SPARSH Child Development Screening
          </p>
          <p className="mt-0.5 text-[11px] text-[#D2E3D8]/80">
            National Health Mission & Child Welfare Alignment
          </p>
        </div>
      </section>

      {/* RIGHT SIDE INTERACTIVE FORM PANEL */}
      <section className={`flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-5 relative ${className}`}>
        <SparshBotanical variant="top-left" opacity="opacity-20" />
        <SparshBotanical variant="bottom-right" opacity="opacity-25" />

        <div className="mx-auto w-full max-w-md relative z-10">
          {children}
        </div>
      </section>
    </main>
  )
}