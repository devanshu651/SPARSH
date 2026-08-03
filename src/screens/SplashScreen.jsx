import BrandLogo from '../components/BrandLogo'
import Button from '../components/Button'
import AuthShell from '../components/AuthShell'

const capabilities = ['ASSESS', 'SCREEN', 'RESPOND', 'GROW']

export default function SplashScreen({ onContinue }) {
  return (
    <AuthShell>
      <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -right-20 top-24 h-52 w-52 rounded-full border border-white/10" /><div className="absolute -left-24 bottom-24 h-72 w-72 rounded-full border border-white/10" /></div>
      <div className="relative flex flex-1 flex-col px-7 pb-8 pt-14 sm:px-10">
        <div className="flex justify-end"><span className="rounded-full bg-white/10 px-3 py-1 text-[0.65rem] font-semibold tracking-wider text-white/75 ring-1 ring-white/15">v1.0</span></div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BrandLogo className="h-24 w-24" />
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white">SPARSH</h1>
          <p className="mt-1 text-[0.68rem] font-bold tracking-[0.14em] text-cyan-100">CHILD DEVELOPMENT SCREENING</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">Early detection. Brighter futures.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">{capabilities.map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1.5 text-[0.61rem] font-bold tracking-wide text-white/90 ring-1 ring-white/20">{item}</span>)}</div>
        </div>
        <Button onClick={onContinue} className="w-full border border-white/25 bg-white/15 shadow-none backdrop-blur hover:bg-white/25 focus:ring-white">Get Started <span aria-hidden="true" className="ml-2 text-base">→</span></Button>
        <p className="mt-5 text-center text-[0.64rem] leading-5 text-white/55">© {new Date().getFullYear()} SPARSH. Supporting every child&apos;s potential.</p>
      </div>
    </AuthShell>
  )
}