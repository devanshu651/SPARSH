import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import Icon from '../components/Icon'

export default function WorkerRegistrationScreen({ onBack }) {
  return (
    <AuthShell>
      <div className="space-y-6 py-4">
        {/* Top Back */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EBE7] px-3 py-1.5 text-xs font-semibold text-[#5A6660] hover:bg-[#F9FBFA] transition"
        >
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF2EE] px-3 py-1 text-xs font-semibold text-[#1B4D3E] border border-[#D5E3DB]">
            <Icon name="shield" className="h-3.5 w-3.5" />
            <span>Account provisioning</span>
          </div>

          <h1 className="mt-3 text-xl font-bold tracking-tight text-[#1A201E] sm:text-2xl">
            Healthcare Worker Access
          </h1>
          <p className="mt-1 text-xs text-[#5A6660] sm:text-sm leading-relaxed">
            Worker accounts are securely provisioned by your District Health Society or Child Development Project Officer (CDPO).
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#1A201E]">How to Activate Your Centre Account</h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B4D3E] text-[11px] font-bold text-white">
                1
              </span>
              <div>
                <p className="font-semibold text-[#1A201E]">Contact District Health Supervisor / CDPO</p>
                <p className="mt-0.5 text-[#5A6660]">Provide your verified mobile number and assigned Anganwadi Centre code.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B4D3E] text-[11px] font-bold text-white">
                2
              </span>
              <div>
                <p className="font-semibold text-[#1A201E]">Receive Authorization Credentials</p>
                <p className="mt-0.5 text-[#5A6660]">Your supervisor will issue your temporary password and configure ward cohort permissions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B4D3E] text-[11px] font-bold text-white">
                3
              </span>
              <div>
                <p className="font-semibold text-[#1A201E]">Sign In & Begin Screenings</p>
                <p className="mt-0.5 text-[#5A6660]">Sign in using your credentials and start tracking child developmental milestones.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Button
            variant="primary"
            className="w-full text-sm font-semibold py-3"
            onClick={onBack}
          >
            I Have an Account — Sign In
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
