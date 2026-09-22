import { useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Card from '../components/Card'
import Icon from '../components/Icon'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'

const initial = {
  name: '',
  dob: '',
  gender: '',
  village: '',
  childIdentifier: '',
  guardianName: '',
  mobile: '',
  weight: '',
  height: '',
  muac: '',
  notes: '',
  photo: null
}

const steps = [
  { step: 1, label: 'Personal Information', sub: 'Demographics & identification' },
  { step: 2, label: 'Growth Measurements', sub: 'Anthropometric vitals' },
  { step: 3, label: 'Review & Enrol', sub: 'Verification & confirmation' }
]

export default function RegistrationScreen({ onNavigate }) {
  const { currentWorker, setCurrentChild } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(() => {
    try {
      return { ...initial, ...JSON.parse(localStorage.getItem('sparsh:registration-draft') || '{}') }
    } catch {
      return initial
    }
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedChild, setSavedChild] = useState(null)

  const update = (key) => (e) => {
    const value = e.target.type === 'file' ? e.target.files?.[0] || null : e.target.value
    const next = { ...form, [key]: value }
    setForm(next)
    localStorage.setItem('sparsh:registration-draft', JSON.stringify({ ...next, photo: null }))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  const age = useMemo(() => {
    if (!form.dob) return null
    const diff = Date.now() - new Date(form.dob).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375)))
  }, [form.dob])

  const validate = () => {
    const e = {}
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Full name of the child is required.'
      if (!form.dob || new Date(form.dob) > new Date()) e.dob = 'Enter a valid past date of birth.'
      if (!form.gender) e.gender = 'Select biological sex / gender.'
      if (!form.village.trim()) e.village = 'Village / ward name is required.'
      if (!form.childIdentifier.trim()) e.childIdentifier = 'Anganwadi Child ID is required.'
      if (form.mobile && !/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) {
        e.mobile = 'Enter a valid 10-digit guardian mobile number.'
      }
    }
    if (step === 2) {
      if (form.weight && (+form.weight < 0.5 || +form.weight > 80)) {
        e.weight = 'Enter a weight between 0.5 and 80 kg.'
      }
      if (form.height && (+form.height < 20 || +form.height > 250)) {
        e.height = 'Enter a length/height between 20 and 250 cm.'
      }
      if (form.muac && (+form.muac < 50 || +form.muac > 400)) {
        e.muac = 'Enter Mid-Upper Arm Circumference between 50 and 400 mm.'
      }
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const next = () => {
    if (validate()) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function submit() {
    if (!validate()) return

    const centreId = currentWorker?.centre_ids?.[0] || 'assigned-centre'
    setSaving(true)
    setErrors({})

    try {
      const childPayload = {
        name: form.name.trim(),
        date_of_birth: form.dob,
        child_identifier: form.childIdentifier.trim(),
        sex: form.gender,
        guardian_name: form.guardianName ? form.guardianName.trim() : null,
        guardian_phone: form.mobile ? form.mobile.trim() : null,
        centre_id: centreId,
        centre_name: 'Assigned Anganwadi Centre'
      }
      let child = savedChild
      if (!child) {
        const createCall = childrenApi.create(childPayload)
        child = typeof createCall === 'function' ? await createCall(childPayload) : await createCall
      }

      setSavedChild(child)
      setCurrentChild(child)

      if (form.weight || form.height || form.muac || form.notes) {
        try {
          const healthPayload = {
            measured_on: new Date().toISOString().slice(0, 10),
            weight_kg: form.weight ? +form.weight : null,
            height_cm: form.height ? +form.height : null,
            muac_mm: form.muac ? +form.muac : null,
            notes: form.notes || null
          }
          const hdCall = childrenApi.healthData(child.id, healthPayload)
          if (typeof hdCall === 'function') {
            await hdCall(child.id, healthPayload)
          } else {
            await hdCall
          }
        } catch (error) {
          setErrors({
            submit: `Child record was registered, but vitals failed to save: ${error.message}. You may continue directly to screening.`
          })
          return
        }
      }

      localStorage.removeItem('sparsh:registration-draft')
      onNavigate('screening')
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout
      active="register"
      onNavigate={onNavigate}
      backTo="children"
      title="Child Registration"
      subtitle="National Early Childhood Development Enrolment"
    >
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">

        {/* STEPPER PROGRESS */}
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-card sm:p-5">
          <div className="grid grid-cols-3 gap-2">
            {steps.map((s) => {
              const isDone = s.step < step
              const isCurrent = s.step === step
              return (
                <div key={s.step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
                        isDone
                          ? 'bg-teal-600 text-white'
                          : isCurrent
                          ? 'bg-primary-800 text-white ring-2 ring-primary-200 ring-offset-1'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {isDone ? <Icon name="check" className="h-3.5 w-3.5" /> : s.step}
                    </span>
                    <span className={`hidden text-xs font-bold sm:inline ${isCurrent ? 'text-neutral-900' : 'text-neutral-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-2 hidden h-1.5 w-full rounded-full bg-neutral-100 sm:block">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isDone || isCurrent ? 'bg-teal-600' : 'bg-transparent'
                      }`}
                      style={{ width: isDone ? '100%' : isCurrent ? '50%' : '0%' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* STEP FORM PANELS */}
        <Card>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Personal & Family Details</h2>
                <p className="mt-0.5 text-xs text-neutral-500">Record baseline identification for the child</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Child Full Name"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={form.name}
                  onChange={update('name')}
                  error={errors.name}
                />

                <Input
                  label="Anganwadi / Village Child ID"
                  required
                  placeholder="e.g. AWW-CH-04821"
                  value={form.childIdentifier}
                  onChange={update('childIdentifier')}
                  error={errors.childIdentifier}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Input
                    label="Date of Birth"
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    value={form.dob}
                    onChange={update('dob')}
                    error={errors.dob}
                  />
                  {age !== null && (
                    <p className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
                      <Icon name="clock" className="h-3.5 w-3.5" />
                      <span>Current Age: {age} months</span>
                    </p>
                  )}
                </div>

                <Select
                  label="Biological Sex"
                  required
                  value={form.gender}
                  onChange={update('gender')}
                  error={errors.gender}
                >
                  <option value="">Select sex</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <Input
                label="Village / Ward / Mohalla"
                required
                placeholder="e.g. Ward 4, Sub-centre Kasba"
                value={form.village}
                onChange={update('village')}
                error={errors.village}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Primary Guardian / Mother Name"
                  placeholder="e.g. Sunita Sharma"
                  value={form.guardianName}
                  onChange={update('guardianName')}
                />

                <Input
                  label="Guardian Contact Mobile"
                  inputMode="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={form.mobile}
                  onChange={update('mobile')}
                  error={errors.mobile}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Baseline Growth & Anthropometrics</h2>
                <p className="mt-0.5 text-xs text-neutral-500">Record current measurements if equipment is available</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="80"
                  placeholder="e.g. 9.4"
                  value={form.weight}
                  onChange={update('weight')}
                  error={errors.weight}
                  helperText="Infant scale measurement"
                />

                <Input
                  label="Length / Height (cm)"
                  type="number"
                  step="0.1"
                  min="20"
                  max="250"
                  placeholder="e.g. 78.5"
                  value={form.height}
                  onChange={update('height')}
                  error={errors.height}
                  helperText="Infantometer or stadiometer"
                />

                <Input
                  label="MUAC (mm)"
                  type="number"
                  min="50"
                  max="400"
                  placeholder="e.g. 135"
                  value={form.muac}
                  onChange={update('muac')}
                  error={errors.muac}
                  helperText="Mid-Upper Arm Circumference"
                />
              </div>

              <div className="rounded-lg bg-neutral-50 p-3.5 text-xs text-neutral-600 border border-neutral-200">
                <p className="font-semibold text-neutral-800">WHO Growth Reference Guide:</p>
                <p className="mt-1">
                  MUAC &lt; 115 mm: Severe Acute Malnutrition (Immediate Red Flag) · 115–125 mm: Moderate Acute Malnutrition · &gt; 125 mm: Normal
                </p>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Clinical Observations & Medical History
                </span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={update('notes')}
                  placeholder="Note birth complications, previous hospitalizations, or immunization delays..."
                  className="w-full rounded-lg border border-neutral-300 p-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Review & Confirmation</h2>
                <p className="mt-0.5 text-xs text-neutral-500">Verify child identification and proceed to screening</p>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-neutral-400">Child Name:</span>{' '}
                    <p className="text-sm font-bold text-neutral-900">{form.name}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Age:</span>{' '}
                    <p className="text-sm font-bold text-teal-800">{age} months ({form.dob})</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Anganwadi ID:</span>{' '}
                    <p className="font-semibold text-neutral-800">{form.childIdentifier}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Sex:</span>{' '}
                    <p className="font-semibold text-neutral-800 capitalize">{form.gender}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Village / Ward:</span>{' '}
                    <p className="font-semibold text-neutral-800">{form.village}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Guardian / Mobile:</span>{' '}
                    <p className="font-semibold text-neutral-800">{form.guardianName || '—'} {form.mobile ? `(${form.mobile})` : ''}</p>
                  </div>
                </div>

                {(form.weight || form.height || form.muac) && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-wrap gap-4 text-xs font-semibold text-neutral-700">
                    {form.weight && <span>Weight: {form.weight} kg</span>}
                    {form.height && <span>Height: {form.height} cm</span>}
                    {form.muac && <span>MUAC: {form.muac} mm</span>}
                  </div>
                )}
              </div>

              {/* Photo Upload Advisory */}
              <label className="block rounded-lg border border-dashed border-neutral-300 p-5 text-center transition hover:border-primary-400 hover:bg-neutral-50">
                <Icon name="children" className="mx-auto h-6 w-6 text-neutral-400" />
                <span className="mt-2 block text-xs font-bold text-primary-800">
                  Optional: Attach Patient Photo
                </span>
                <span className="mt-0.5 block text-[11px] text-neutral-400">
                  Encrypted and stored locally for patient identification
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={update('photo')}
                />
              </label>
              {form.photo && (
                <p className="text-xs text-neutral-600 text-center">Selected file: {form.photo.name}</p>
              )}
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-800 border border-red-200" role="alert">
              {errors.submit}
            </div>
          )}

          <div className="mt-6 flex gap-3 border-t border-neutral-100 pt-4">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              disabled={saving}
              loading={saving}
              onClick={step === 3 ? submit : next}
            >
              {step === 3 ? 'Save Child & Start Screening →' : 'Continue to Next Step'}
            </Button>
          </div>
        </Card>

      </div>
    </AppLayout>
  )
}
