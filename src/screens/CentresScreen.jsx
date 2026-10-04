import { useState, useEffect } from 'react'
import { centresApi } from '../services/api'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import Button from '../components/Button'
import Input from '../components/Input'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'

const initialForm = { code: '', name: '', district: '', state: '', address: '' }

export default function CentresScreen({ onNavigate }) {
  const [centres, setCentres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await centresApi.list()
      setCentres(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setForm(initialForm)
    setFormErrors({})
    setEditingId(null)
    setShowForm(false)
  }

  function validate() {
    const e = {}
    if (!form.code.trim()) e.code = 'Centre code is required.'
    if (!form.name.trim()) e.name = 'Centre name is required.'
    if (!form.district.trim()) e.district = 'District is required.'
    if (!form.state.trim()) e.state = 'State is required.'
    if (!form.address.trim()) e.address = 'Address is required.'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        await centresApi.update(editingId, form)
      } else {
        await centresApi.create(form)
      }
      resetForm()
      await load()
    } catch (e) {
      setFormErrors({ submit: e.message || 'Failed to save centre.' })
    } finally {
      setSaving(false)
    }
  }

  function edit(centre) {
    setEditingId(centre.id)
    setForm({
      code: centre.code,
      name: centre.name,
      district: centre.district,
      state: centre.state,
      address: centre.address
    })
    setFormErrors({})
    setShowForm(true)
  }

  async function toggleActive(centre) {
    try {
      await centresApi.update(centre.id, { active: !centre.active })
      await load()
    } catch (e) {
      setError(e)
    }
  }

  if (loading) return <LoadingState label="Loading centres…" />
  if (error) return <ErrorState error={error} onRetry={load} />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1A201E]">Anganwadi Centres</h2>
          <p className="text-xs text-[#5A6660]">Manage registered centres and geographical jurisdictions</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Icon name="plus" className="h-4 w-4 mr-1" />
          <span>Add Centre</span>
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-[#1A201E] mb-4">
            {editingId ? 'Edit Centre' : 'Create New Centre'}
          </h3>
          <form onSubmit={submit} className="space-y-4 max-w-2xl">
            <Input
              label="Centre Code *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              error={formErrors.code}
              maxLength={40}
              placeholder="e.g. AWW-MH-2847"
            />
            <Input
              label="Centre Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={formErrors.name}
              maxLength={160}
              placeholder="e.g. Ward 4 Balwadi Centre"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="District *"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                error={formErrors.district}
                maxLength={120}
              />
              <Input
                label="State *"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                error={formErrors.state}
                maxLength={120}
              />
            </div>
            <Input
              label="Address *"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              error={formErrors.address}
              maxLength={500}
            />
            {formErrors.submit && <p className="text-xs text-[#D32F2F]">{formErrors.submit}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : (editingId ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {centres.length === 0 && !showForm ? (
        <EmptyState
          title="No centres yet"
          detail="Create your first Anganwadi centre to get started."
          action={
            <Button variant="primary" className="mt-4" onClick={() => { resetForm(); setShowForm(true); }}>
              Create Centre
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5EBE7] bg-white shadow-2xs">
          <table className="w-full text-left" role="grid">
            <thead>
              <tr className="border-b border-[#E5EBE7] bg-[#F9FBFA]">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Code</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Name</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Location</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE7]">
              {centres.map((centre) => (
                <tr key={centre.id} className="hover:bg-[#F9FBFA] transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1A201E]">{centre.code}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[#1A201E]">{centre.name}</td>
                  <td className="px-4 py-3 text-xs text-[#5A6660]">{centre.district}, {centre.state}</td>
                  <td className="px-4 py-3">
                    <BadgePill tone={centre.active ? 'normal' : 'neutral'}>
                      {centre.active ? 'Active' : 'Inactive'}
                    </BadgePill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => edit(centre)}>
                        Edit
                      </Button>
                      <Button
                        variant={centre.active ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => toggleActive(centre)}
                      >
                        {centre.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}