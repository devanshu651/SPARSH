import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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

    const centreId = currentWorker?.centre_ids?.[0]
    if (!centreId) {
      setErrors({ submit: 'Your worker account has no assigned centre. Ask an administrator to assign one.' })
      return
    }

    setSaving(true)
    setErrors({})

    try {
      const childPayload = {
        name: form.name.trim(),
        date_of_birth: form.dob,
        child_identifier: form.childIdentifier.trim() || `AW-${Date.now().toString().slice(-4)}`,
        sex: form.gender || null,
        guardian_name: form.guardianName ? form.guardianName.trim() : null,
        guardian_phone: form.mobile ? form.mobile.replace(/\s/g, '') : null,
        centre_id: centreId,
        centre_name: 'Assigned Anganwadi Centre'
      }

      const createCall = childrenApi.create(childPayload)
      const res = typeof createCall === 'function' ? await createCall(childPayload) : await createCall

      if (form.weight || form.height || form.muac) {
        try {
          const healthPayload = {
            measured_on: new Date().toISOString().slice(0, 10),
            weight_kg: form.weight ? parseFloat(form.weight) : null,
            height_cm: form.height ? parseFloat(form.height) : null,
            muac_mm: form.muac ? parseFloat(form.muac) : null
          }
          const vCall = childrenApi.healthData(res.id, healthPayload)
          if (typeof vCall === 'function') await vCall(res.id, healthPayload)
          else await vCall
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
      <AppLayout active="children" onNavigate={onNavigate} title={t('registration.enrolmentComplete')}>
        <div className="max-w-md mx-auto py-8 text-center space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E8F5EE] text-[#2D7A58] border border-[#C6E7D5]">
            <Icon name="checkCircle" className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-[#1A201E] font-heading">
            {t('registration.registeredSuccess')}
          </h2>

          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 text-left text-xs space-y-2 shadow-card">
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">{t('registration.fullName')}:</span>
              <span className="font-bold text-[#1A201E]">{savedChild.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">{t('registration.anganwadiId')}:</span>
              <span className="font-mono font-bold text-[#1B4D3E]">{savedChild.child_identifier || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-[#F3F6F4] pb-2">
              <span className="text-[#5A6660]">{t('registration.ageGender')}:</span>
              <span className="font-bold text-[#1A201E]">
                {savedChild.age_months !== null && savedChild.age_months !== undefined ? `${savedChild.age_months} ${t('registration.months')}` : '—'} • {savedChild.gender || savedChild.sex}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6660]">{t('registration.guardian')}:</span>
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
              <span>{t('registration.beginScreening')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSavedChild(null)
                setForm({ ...initial, childIdentifier: `AW-${Math.floor(1000 + Math.random() * 9000)}` })
              }}
              className="w-full min-h-[44px] rounded-xl border border-[#E5EBE7] bg-white text-xs font-bold text-[#1A201E] hover:bg-[#FAFCFA]"
            >
              {t('registration.registerAnother')}
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
      title={t('registration.title')}
      subtitle={t('registration.subtitle')}
    >
      <div className="max-w-2xl mx-auto space-y-5 pt-1 pb-16">

        <form onSubmit={submit} className="space-y-5">
          {/* SECTION 1: BASIC INFORMATION (EXACT MATCH TO SCREEN 5 IN REFERENCE) */}
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-[#1A201E] font-heading border-b border-[#F3F6F4] pb-2">
              {t('registration.basicInfo')}
            </h2>

            {/* Child's Name */}
            <Input
              label={t('registration.childName')}
              required
              value={form.name}
              onChange={update('name')}
              error={errors.name}
              placeholder={t('registration.childNamePlaceholder')}
            />

            {/* Date of Birth with Age Preview */}
            <div className="space-y-1">
              <Input
                label={t('registration.dob')}
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
                  <span>
                    {t('registration.calculatedAge', {
                      years: Math.floor(ageMonths / 12),
                      months: ageMonths % 12,
                      total: ageMonths
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Gender Segmented Buttons matching Screen 5: [ Male ] [ Female ] [ Other ] */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#1A201E]">
                {t('registration.gender')} <span className="text-[#D32F2F]">*</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: t('registration.male') },
                  { id: 'female', label: t('registration.female') },
                  { id: 'other', label: t('registration.other') }
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
              {t('registration.additionalInfo')}
            </h2>

            {/* Anganwadi Centre Dropdown */}
            <Select
              label={t('registration.centre')}
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
              label={t('registration.guardianName')}
              value={form.guardianName}
              onChange={update('guardianName')}
              placeholder={t('registration.guardianPlaceholder')}
            />

            {/* Contact Number */}
            <Input
              label={t('registration.contactNumber')}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={update('mobile')}
              error={errors.mobile}
              placeholder={t('registration.contactPlaceholder')}
              leftIcon={<span className="text-xs font-bold text-[#5A6660]">+91</span>}
            />

            {/* Anganwadi Child Identifier */}
            <Input
              label={t('registration.childId')}
              value={form.childIdentifier}
              onChange={update('childIdentifier')}
              placeholder="e.g. AW-0482"
              helperText={t('registration.childIdHelper')}
            />
          </div>

          {/* SECTION 3: OPTIONAL ANTHROPOMETRIC GROWTH CHECK */}
          <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1A201E]">
                  {t('registration.growthVitals')}
                </h2>
                <p className="text-[11px] text-[#5A6660]">{t('registration.vitalsDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOptionalVitals(!showOptionalVitals)}
                className="text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                {showOptionalVitals ? t('registration.hideVitals') : t('registration.addVitals')}
              </button>
            </div>

            {showOptionalVitals && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Input
                  label={t('registration.weight')}
                  type="number"
                  step="0.05"
                  value={form.weight}
                  onChange={update('weight')}
                  placeholder="e.g. 9.4"
                />
                <Input
                  label={t('registration.height')}
                  type="number"
                  step="0.1"
                  value={form.height}
                  onChange={update('height')}
                  placeholder="e.g. 78.5"
                />
                <Input
                  label={t('registration.muac')}
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
              <span>{saving ? t('registration.registering') : t('registration.registerButton')}</span>
            </button>
          </div>
        </form>

      </div>
    </AppLayout>
  )
}

