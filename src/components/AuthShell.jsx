export default function AuthShell({
  children,
  className = '',
  showBackground = false,
}) {
  return (
    <main className="grid min-h-screen overflow-hidden bg-slate-100 lg:grid-cols-[minmax(0,1fr)_30rem]">

      {/* LEFT SIDE */}
      <section
        className={`relative hidden min-h-screen overflow-hidden text-white lg:flex lg:flex-col ${
          showBackground ? '' : 'bg-health-gradient'
        }`}
      >
        {/* Mother & child background - ONLY when requested */}
        {showBackground && (
          <>
            <img
              src="/mother-child.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Blue → teal overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/75 to-teal-500/55" />
          </>
        )}

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />

        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 bottom-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -right-20 top-24 h-52 w-52 rounded-full border border-white/10" />
        </div>

        {/* LEFT CONTENT */}
        <div className="relative z-10 flex min-h-screen flex-col justify-between p-14">

          <p className="text-sm font-semibold tracking-[0.2em] text-white/70">
            SPARSH HEALTH PLATFORM
          </p>

          <div className="max-w-xl">
            <p className="text-5xl font-bold leading-tight">
              Early detection for
              <br />
              every child.
            </p>

            <p className="mt-5 max-w-md text-lg leading-8 text-white/75">
              A trusted platform for assessment, screening,
              <br />
              response and holistic child development.
            </p>
          </div>

          <p className="text-sm text-white/55">
            Smart Platform for Assessment of Response, Screening &amp; Holistic Development
          </p>

        </div>
      </section>

      {/* RIGHT SIDE */}
      <section
        className={`relative flex min-h-screen items-center justify-center bg-health-gradient sm:p-6 lg:bg-white ${className}`}
      >
        {/* Main application card */}
        <div
          className="
            relative
            flex
            h-full
            min-h-screen
            w-full
            flex-col
            overflow-hidden
            bg-health-gradient
            shadow-2xl

            sm:h-auto
            sm:min-h-[46rem]
            sm:max-w-[30rem]
            sm:rounded-[2rem]

            lg:h-[46rem]
            lg:min-h-0
            lg:max-w-[30rem]
            lg:rounded-[2rem]
          "
        >
          {children}
        </div>
      </section>

    </main>
  )
}