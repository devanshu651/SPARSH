import AuthShell from '../components/AuthShell'
import BrandLogo from '../components/BrandLogo'
import Button from '../components/Button'

export default function WorkerRegistrationScreen({ onBack }) {
  return (
    <AuthShell>
      <div className="relative flex flex-1 flex-col bg-white px-6 py-8">
        <button type="button" onClick={onBack} className="min-h-11 self-start text-sm font-bold text-primary-800">← Back to login</button>
        <div className="mt-8 text-center"><BrandLogo className="mx-auto h-20 w-20" /><h1 className="mt-4 text-2xl font-extrabold text-neutral-900">Register for SPARSH</h1></div>
        <div className="mt-8 rounded-2xl bg-primary-50 p-5 text-sm leading-6 text-primary-950"><p className="font-bold">Worker accounts are provisioned securely by a supervisor or administrator.</p><p className="mt-2">Your account needs a verified Firebase identity, role, and assigned Anganwadi centre before child records can be accessed.</p></div>
        <div className="mt-5 rounded-2xl border border-neutral-200 p-5 text-sm text-neutral-600"><p className="font-semibold text-neutral-900">To get access</p><ol className="mt-2 list-decimal space-y-2 pl-5"><li>Contact your supervisor or district administrator.</li><li>Provide your mobile number and assigned centre details.</li><li>Return here and sign in once your account is activated.</li></ol></div>
        <Button className="mt-auto w-full" onClick={onBack}>I have an account — sign in</Button>
      </div>
    </AuthShell>
  )
}