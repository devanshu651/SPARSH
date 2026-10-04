import { useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Input from '../components/Input'
import Select from '../components/Select'
import Icon from '../components/Icon'
import { childrenApi } from '../services/api'
import { useApp } from '../context/AppContext'

const initial = {
  name: '',
  dob: '',
  gender: '',
  village: 'Ward 4',
  childIdentifier: '',
  guardianName: '',
  mobile: '',
  weight: '',
  height: '',
  muac: '',
  notes: '',
  centreId: ''
}

export default function RegistrationScreen({ onNavigate }) {
  const { currentWorker, setCurrentChild } = useApp()
  const [form, setForm] = useState(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('sparsh:registration-draft') || '{}')
      return { ...initial, ...draft, childIdentifier: draft.childIdentifier || `AW-${Math.floor(1000 + Math.random() * 9000)}` }
    } catch {
      return { ...initial, childIdentifier: `AW-${Math.floor(1000 + Math.random() * 9000)}` }
    }
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [savedChild, setSavedChild] = useState(null)
  const [showOptionalVitals, setShowOptionalVitals] = useState(false)

  const update = (key) => (e) => {
    const value = e.target.value
    const next = { ...form, [key]: value }
    setForm(next)
    localStorage.setItem('sparsh:registration-draft', JSON.stringify(next))
    setErrors((p) => ({ ...p, [key]: '' }))
  }

  const setGender = (g) => {
    const next = { ...form, gender: g }
    setForm(next)
    localStorage.setItem('sparsh:registration-draft', JSON.stringify(next))
    setErrors((p) => ({ ...p, gender: '' }))
  }

  const ageMonths = useMemo(() => {
    if (!form.dob) return null
    const diff = Date.now() - new Date(form.dob).getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 30.4375)))
  }, [form.dob])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = "Child's full name is required."
    if (!form.dob || new Date(form.dob) > new Date()) e.dob = 'Valid date of birth is required.'
    if (!form.gender) e.gender = 'Please select child gender.'
    if (form.mobile && !/^\d{10}$/.test(form.mobile.replace(/\s/g, ''))) {
      e.mobile = 'Enter a valid 10-digit contact number.'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return

    const centreId = currentWorker?.centre_ids?.[0] || 'AWC-MH-2025'
    setSaving(true)
    setErrors({})

    try {
      const payload = {
        name: form.name.trim(),
        sex: form.gender,
        gender: form.gender,
        dob: form.dob,
        village: form.village.trim() || 'Ward 4',
        child_identifier: form.childIdentifier.trim() || `AW-${Date.now().toString().slice(-4)}`,
        guardian_name: form.guardianName.trim() || 'Primary Guardian',
        phone: form.mobile.replace(/\s/g, '') || null,
        centre_id: centreId
      }

      const createCall = childrenApi.create(payload)
      const res = typeof createCall === 'function' ? await createCall(payload) : await createCall

      if (form.weight || form.height || form.muac) {
        try {
          const vCall = childrenApi.healthData(res.id, {
            measured_on: new Date().toISOString(),
            weight_kg: form.weight ? parseFloat(form.weight) : null,
            height_cm: form.height ? parseFloat(form.height) : null,
            muac_mm: form.muac ? parseFloat(form.muac) : null
          })
          if (typeof vCall === 'function') await vCall(res.id)
        } catch {
          // Non-blocking
        }
      }

      localStorage.removeItem('sparsh:registration-draft')
      setSavedChild(res)
      setCurrentChild(res)
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to enroll child. Please check network and try again.' })
    } finally {
      setSaving(false)
    }
  }

  // SUCCESS CONFIRMATION SCREEN
  if (savedChild) {
    return (
      <AppLayout active="children" onNavigate={onNavigate} title="Enrolment Complete">
        <div className="max-w-md mx-auto py-8 text-center space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E8F5EE] text-[#2D7A58] border border-[#C6E7D5]">
            <Icon name="checkCircle" className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-[#1A201E] font-heading">
            Child Registered Successfully!
          </h2>

          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 text-left text-xs space-y-2 shadow-card">
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">Full Name:</span>
              <span className="font-bold text-[#1A201E]">{savedChild.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">Anganwadi ID:</span>
              <span className="font-mono font-bold text-[#1B4D3E]">{savedChild.child_identifier || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">Age / Gender:</span>
              <span className="font-bold text-[#1A201E]">
                {savedChild.age_months !== null && savedChild.age_months !== undefined ? `${savedChild.age_months} months` : '—'} • {savedChild.gender || savedChild.sex}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6660]">Guardian:</span>
              <span className="font-bold text-[#1A201E]">{savedChild.guardian_name || '—'}</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => onNavigate?.('screening')}
              className="w-full min-h-[50px] rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white font-bold text-sm shadow-card flex items-center justify-center gap-2"
            >
              <Icon name="screening" className="h-4 w-4" />
              <span>Begin Milestone Screening Now →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedChild(null)
                setForm({ ...initial, childIdentifier: `AW-${Math.floor(1000 + Math.random() * 9000)}` })
              }}
              className="w-full min-h-[44px] rounded-xl border border-[#E5EBE7] bg-white text-xs font-bold text-[#1A201E] hover:bg-[#FAFCFA]"
            >
              + Register Another Child
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      active="register"
      onNavigate={onNavigate}
      backTo="children"
      title="Register Child"
      subtitle="Enroll new child into Anganwadi health cohort"
    >
      <div className="max-w-2xl mx-auto space-y-5 pt-1 pb-16">

        <form onSubmit={submit} className="space-y-5">
          {/* SECTION 1: BASIC INFORMATION (EXACT MATCH TO SCREEN 5 IN REFERENCE) */}
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-[#1A201E] font-heading border-b border-[#F3F6F4] pb-2">
              Basic Information
            </h2>

            {/* Child's Name */}
            <Input
              label="Child's Name"
              required
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              placeholder="Enter child's full name"
            />

            {/* Date of Birth with Age Preview */}
            <div className="space-y-1">
              <Input
                label="Date of Birth"
                required
                type="date"
                value={form.dob}
                onChange={update('dob')}
                error={errors.dob}
                leftIcon={<Icon name="calendar" className="h-4 w-4" />}
              />
              {ageMonths !== null && (
                <div className="flex items-center gap-2 text-xs text-[#1B4D3E] font-semibold pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]" />
                  <span>Calculated Age: {Math.floor(ageMonths / 12)} years {ageMonths % 12} months ({ageMonths} months)</span>
                </div>
              )}
            </div>

            {/* Gender Segmented Buttons matching Screen 5: [ Male ] [ Female ] [ Other ] */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#1A201E]">
                Gender <span className="text-[#D32F2F]">*</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                  { id: 'other', label: 'Other' }
                ].map((g) => {
                  const isSelected = form.gender === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`min-h-[44px] rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs'
                          : 'bg-white text-[#5A6660] border-[#E5EBE7] hover:bg-[#FAFCFA]'
                      }`}
                    >
                      {g.label}
                    </button>
                  )
                })}
              </div>
              {errors.gender && (
                <span className="block text-xs font-medium text-[#D32F2F]">{errors.gender}</span>
              )}
            </div>
          </div>

          {/* SECTION 2: ADDITIONAL INFORMATION (MATCHING SCREEN 5 IN REFERENCE) */}
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-[#1A201E] font-heading border-b border-[#F3F6F4] pb-2">
              Additional Information
            </h2>

            {/* Anganwadi Centre Dropdown */}
            <Select
              label="Anganwadi Centre"
              required
              value={form.centreId || currentWorker?.centre_ids?.[0] || ''}
              onChange={update('centreId')}
            >
              <option value={currentWorker?.centre_ids?.[0] || 'AWC-MH-2025'}>
                {currentWorker?.centre_ids?.[0] ? `Centre: ${currentWorker.centre_ids[0]}` : 'Ward 4 Sub-centre (AWC-MH-2025)'}
              </option>
              <option value="AWC-MH-2026">Ward 5 Centre (AWC-MH-2026)</option>
              <option value="AWC-MH-2027">Village Sub-centre (AWC-MH-2027)</option>
            </Select>

            {/* Parent / Guardian Name */}
            <Input
              label="Parent / Guardian Name"
              value={form.guardianName}
              onChange={update('guardianName')}
              placeholder="Enter name"
            />

            {/* Contact Number */}
            <Input
              label="Contact Number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={update('mobile')}
              error={errors.mobile}
              placeholder="Enter contact number"
              leftIcon={<span className="text-xs font-bold text-[#5A6660]">+91</span>}
            />

            {/* Anganwadi Child Identifier */}
            <Input
              label="Anganwadi Child ID"
              value={form.childIdentifier}
              onChange={update('childIdentifier')}
              placeholder="e.g. AW-0482"
              helperText="Official registry identification code"
            />
          </div>

          {/* SECTION 3: OPTIONAL ANTHROPOMETRIC GROWTH CHECK */}
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1A201E]">
                  Initial Growth Vitals
                </h2>
                <p className="text-[11px] text-[#5A6660]">Optional height, weight, and MUAC</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionalVitals(!showOptionalVitals)}
                className="text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                {showOptionalVitals ? 'Hide' : '+ Add Vitals'}
              </button>
            </div>

            {showOptionalVitals && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.05"
                  value={form.weight}
                  onChange={update('weight')}
                  placeholder="e.g. 9.4"
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={update('height')}
                  placeholder="e.g. 78.5"
                />
                <Input
                  label="MUAC (mm)"
                  type="number"
                  step="1"
                  value={form.muac}
                  onChange={update('muac')}
                  placeholder="e.g. 132"
                />
              </div>
            )}
          </div>

          {errors.submit && (
            <div className="rounded-xl bg-[#FDE8E8] p-3 text-xs text-[#D32F2F] border border-[#F8C4C4]">
              {errors.submit}
            </div>
          )}

          {/* PRIMARY SUBMIT BUTTON MATCHING SCREEN 5 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[50px] rounded-xl bg-[#1B4D3E] hover:bg-[#143D31] text-white font-bold text-sm shadow-card flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Icon name="userPlus" className="h-4 w-4" />
              <span>{saving ? 'Registering Child…' : 'Register Child'}</span>
            </button>
          </div>
        </form>

      </div>
    </AppLayout>
  )
}
