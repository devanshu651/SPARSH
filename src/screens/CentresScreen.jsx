import { useState } from 'react'
import { centresApi } from '../services/api'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import BadgePill from '../components/BadgePill'

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
      setCentres(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

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
      if (e.status === 409) setFormErrors({ code: e.message })
      else if (e.status === 422) setFormErrors({ [e.message.split(':')[1]?.trim() || 'form']: e.message })
      else setFormErrors({ submit: e.message })
    } finally {
      setSaving(false)
    }
  }

  function edit(centre) {
    setForm({ code: centre.code, name: centre.name, district: centre.district, state: centre.state, address: centre.address })
    setEditingId(centre.id)
    setShowForm(true)
  }

  async function toggleActive(centre) {
    const confirmMsg = centre.active ? 'Deactivate this centre? It will no longer be available for new child registrations.' : 'Activate this centre?'
    if (!window.confirm(confirmMsg)) return

    try {
      await centresApi.update(centre.id, { active: !centre.active })
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <LoadingState label="Loading centres…" />
  if (error) return <ErrorState error={error} onRetry={load} />

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('dashboard')}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-lg font-bold text-primary-700 transition hover:bg-primary-100"
            >
              ←
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary-600">ADMIN CONSOLE</p>
              <h1 className="text-xl font-bold text-neutral-900">Centres</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-600 text-xl font-medium text-white shadow-md transition hover:bg-primary-700"
            aria-label="Create centre"
          >
            +
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-10 lg:py-8">
        {showForm && (
          <Card className="mb-5">
            <h2 className="mb-4 font-bold text-neutral-900">{editingId ? 'Edit Centre' : 'Create Centre'}</h2>
            <form onSubmit={submit} className="space-y-4 max-w-2xl">
              <Input label="Centre Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} error={formErrors.code} maxLength={40} />
              <Input label="Centre Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={formErrors.name} maxLength={160} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="District *" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} error={formErrors.district} maxLength={120} />
                <Input label="State *" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} error={formErrors.state} maxLength={120} />
              </div>
              <Input label="Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} error={formErrors.address} maxLength={500} />
              {formErrors.submit && <p className="text-xs text-risk-high">{formErrors.submit}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Update' : 'Create')}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {centres.length === 0 && !showForm && (
          <EmptyState title="No centres yet" detail="Create your first Anganwadi centre to get started." action={<Button className="mt-4" onClick={() => { resetForm(); setShowForm(true); }}>Create Centre</Button>} />
        )}

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Code</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Location</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {centres.map((centre) => (
                <tr key={centre.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-neutral-900">{centre.code}</td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{centre.name}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{centre.district}, {centre.state}</td>
                  <td className="px-4 py-3">
                    <BadgePill tone={centre.active ? 'normal' : 'moderate'}>{centre.active ? 'Active' : 'Inactive'}</BadgePill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" className="min-w-0" onClick={() => edit(centre)}>Edit</Button>
                      <Button variant={centre.active ? 'danger' : 'secondary'} className="min-w-0" onClick={() => toggleActive(centre)}>
                        {centre.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}