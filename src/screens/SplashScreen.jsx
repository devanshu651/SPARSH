import BrandLogo from '../components/BrandLogo'
import Button from '../components/Button'
import AuthShell from '../components/AuthShell'
import Icon from '../components/Icon'

const pillars = [
  { label: 'Assess', desc: 'Milestone observation' },
  { label: 'Screen', desc: 'Sensory checks' },
  { label: 'Respond', desc: 'Clinical referrals' },
  { label: 'Grow', desc: 'Holistic development' }
]

export default function SplashScreen({ onContinue }) {
  return (
    <>
      <main className="relative isolate flex h-[100svh] min-h-[640px] flex-col overflow-hidden bg-[#e9e8dc] text-white lg:hidden">
        <img
          src="/mother-child.png"
          alt="A caregiver sharing a joyful moment with a young child"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[54%_center]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(250,249,239,0.78)_0%,rgba(250,249,239,0.42)_23%,rgba(19,46,35,0.02)_43%,rgba(9,48,37,0.43)_65%,rgba(5,48,36,0.94)_100%)]" />

        <header className="flex shrink-0 flex-col items-center px-5 pt-[max(24px,env(safe-area-inset-top))] text-center text-[#17231e]">
          <BrandLogo className="h-[62px] w-[62px]" />
          <h1 className="mt-1 font-heading text-[24px] font-extrabold leading-none tracking-tight">SPARSH</h1>
          <p className="mt-1 max-w-[220px] text-[12px] font-medium leading-[1.35] text-neutral-700">
            Supporting Every<br />Child&apos;s Brighter Tomorrow
          </p>
        </header>

        <section className="mt-auto w-full px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-24">
          <h2 className="font-heading text-[30px] font-bold leading-[1.08] tracking-tight drop-shadow-sm">
            Early Steps<br />Brighter Futures
          </h2>
          <p className="mt-3 max-w-[290px] text-[14px] leading-[1.5] text-white/90">
            A digital companion for Anganwadi<br className="hidden min-[380px]:block" /> workers to track and support<br className="hidden min-[380px]:block" /> child development.
          </p>
          <Button
            variant="outline"
            size="md"
            className="relative mt-5 min-h-[52px] w-full rounded-[12px] border-white/65 bg-white/[0.06] text-[14px] font-semibold text-white backdrop-blur-[2px] hover:bg-white/10 focus:ring-white focus:ring-offset-primary-800"
            onClick={onContinue}
          >
            <span>Get Started</span>
            <Icon name="arrowRight" className="absolute right-4 h-4 w-4" />
          </Button>
        </section>
      </main>

      <div className="hidden lg:block">
        <AuthShell showBackground>
          <div className="flex flex-col justify-between py-6">
            <div className="mt-8 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                <Icon name="shield" className="h-3.5 w-3.5" />
                <span>Developmental Screening &amp; Follow-up Support</span>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                SPARSH Child Screening
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Standardized developmental delay identification and intervention platform for frontline Anganwadi and ASHA workers.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {pillars.map((item) => (
                  <div key={item.label} className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3">
                    <p className="text-xs font-bold text-primary-900">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <Button variant="primary" size="lg" className="w-full text-base font-bold shadow-xs" onClick={onContinue}>
                <span>Sign In to Your Centre</span>
                <Icon name="arrowRight" className="h-4 w-4" />
              </Button>
              <div className="rounded-lg border border-neutral-200/70 bg-neutral-50 p-3 text-center">
                <p className="text-xs text-neutral-500">
                  Authorized personnel only. Provisioned by District Health Society.
                </p>
              </div>
            </div>
          </div>
        </AuthShell>
      </div>
    </>
  )
}
