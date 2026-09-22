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
    <AuthShell showBackground>
      <div className="flex flex-col justify-between py-6">
        {/* Mobile brand header */}
        <div className="flex items-center justify-between lg:hidden">
          <BrandLogo className="h-8 w-8" showWordmark />
          <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
            v1.2
          </span>
        </div>

        <div className="mt-8 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            <Icon name="shield" className="h-3.5 w-3.5" />
            <span>National Health Platform</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            SPARSH Child Screening
          </h1>

          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            Standardized developmental delay identification and intervention platform for frontline Anganwadi and ASHA workers.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {pillars.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-neutral-200 bg-neutral-50/70 p-3"
              >
                <p className="text-xs font-bold text-primary-900">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-bold shadow-xs"
            onClick={onContinue}
          >
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
  )
}