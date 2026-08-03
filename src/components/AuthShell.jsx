export default function AuthShell({ children, className = '' }) {
  return (
    <main className="grid min-h-screen overflow-hidden bg-slate-100 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <section className="relative hidden overflow-hidden bg-health-gradient p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-300/15 blur-3xl" />
        <p className="relative text-sm font-semibold tracking-[0.2em] text-white/70">SPARSH HEALTH PLATFORM</p>
        <div className="relative max-w-xl"><p className="text-5xl font-bold leading-tight">Early detection for every child.</p><p className="mt-5 max-w-md text-lg leading-8 text-white/75">A trusted platform for assessment, screening, response and holistic child development.</p></div>
        <p className="relative text-sm text-white/55">Smart Platform for Assessment of Response, Screening &amp; Holistic Development</p>
      </section>
      <section className={`relative flex min-h-screen items-stretch justify-center bg-health-gradient sm:p-6 lg:bg-white ${className}`}>
        <div className="relative flex w-full max-w-[30rem] flex-1 flex-col overflow-hidden bg-health-gradient shadow-2xl sm:min-h-[46rem] sm:flex-none sm:rounded-[2rem] lg:my-auto lg:min-h-[46rem]">
          {children}
        </div>
      </section>
    </main>
  )
}