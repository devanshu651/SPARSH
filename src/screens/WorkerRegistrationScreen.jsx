import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import Card from '../components/Card'
import Icon from '../components/Icon'

export default function WorkerRegistrationScreen({ onBack }) {
  return (
    <AuthShell>
      <div className="space-y-6 py-4">

        {/* TOP BACK */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            <Icon name="shield" className="h-3.5 w-3.5" />
            <span>Official Provisioning</span>
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Healthcare Worker Access
          </h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm leading-relaxed">
            Worker accounts are securely provisioned by your District Health Society or Child Development Project Officer (CDPO).
          </p>
        </div>

        <Card title="How to Activate Your Centre Account" subtitle="Required credentials for field access">
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-800 text-[11px] font-bold text-white">
                1
              </span>
              <div>
                <p className="font-bold text-neutral-900">Contact District Health Supervisor / CDPO</p>
                <p className="mt-0.5 text-neutral-500">Provide your verified mobile number and assigned Anganwadi Centre code.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-800 text-[11px] font-bold text-white">
                2
              </span>
              <div>
                <p className="font-bold text-neutral-900">Receive Authorization Credentials</p>
                <p className="mt-0.5 text-neutral-500">Your supervisor will issue your temporary password and configure ward cohort permissions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-800 text-[11px] font-bold text-white">
                3
              </span>
              <div>
                <p className="font-bold text-neutral-900">Sign In & Begin Screenings</p>
                <p className="mt-0.5 text-neutral-500">Sign in using your mobile number and start tracking child developmental milestones.</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={onBack}
          >
            I Have an Account — Sign In
          </Button>
        </div>

      </div>
    </AuthShell>
  )
}