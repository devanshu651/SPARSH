import { useState } from 'react'
import { usersApi } from '../services/api'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import BadgePill from '../components/BadgePill'

const ROLE_OPTIONS = [
  { value: 'worker', label: 'Anganwadi Worker' },
  { value: 'supervisor', label: 'Supervisor' },
]

const initialForm = { name: '', mobile: '', password: '', role: 'worker', centre_ids: [] }

export default function UsersScreen({ onNavigate }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [centreOptions, setCentreOptions] = useState([])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await usersApi.list()
      setUsers(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadCentres() {
    try {
      const { centresApi } = await import('../services/api')
      const data = await centresApi.list()
      setCentreOptions(data.filter(c => c.active))
    } catch {
      // ignore
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
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (editingId === null) {
      const mobile = form.mobile.replace(/\s/g, '')
      if (!/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number.'
      if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    }
    if (!form.role) e.role = 'Select a role.'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        const updateData = { name: form.name.trim() }
        if (form.role) updateData.role = form.role
        if (form.centre_ids) updateData.centre_ids = form.centre_ids
        await usersApi.update(editingId, updateData)
      } else {
        await usersApi.create({
          name: form.name.trim(),
          mobile: form.mobile.replace(/\s/g, ''),
          password: form.password,
          role: form.role,
          centre_ids: form.centre_ids,
        })
      }
      resetForm()
      await load()
    } catch (e) {
      if (e.status === 409) setFormErrors({ submit: e.message })
      else if (e.status === 422) setFormErrors({ form: e.message })
      else setFormErrors({ submit: e.message })
    } finally {
      setSaving(false)
    }
  }

  function edit(user) {
    setForm({
      name: user.name,
      mobile: '',
      password: '',
      role: user.role,
      centre_ids: user.centre_ids || [],
    })
    setEditingId(user.uid)
    setShowForm(true)
  }

  async function toggleActivation(user) {
    const confirmMsg = user.disabled ? 'Enable this user account?' : 'Disable this user account? They will no longer be able to sign in.'
    if (!window.confirm(confirmMsg)) return

    try {
      await usersApi.setActivation(user.uid, !user.disabled)
      await load()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <LoadingState label="Loading users…" />
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
              <h1 className="text-xl font-bold text-neutral-900">Users</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); loadCentres(); setShowForm(true); }}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-600 text-xl font-medium text-white shadow-md transition hover:bg-primary-700"
            aria-label="Create user"
          >
            +
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5 lg:px-10 lg:py-8">
        {showForm && (
          <Card className="mb-5">
            <h2 className="mb-4 font-bold text-neutral-900">{editingId ? 'Edit User' : 'Create Worker / Supervisor'}</h2>
            <form onSubmit={submit} className="space-y-4 max-w-2xl">
              <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={formErrors.name} maxLength={120} />
              {editingId === null && (
                <>
                  <Input label="Mobile Number (10 digits) *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/[^\d\s]/g, '') })} error={formErrors.mobile} inputMode="tel" maxLength={12} placeholder="98765 43210" />
                  <Input label="Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} error={formErrors.password} autoComplete="new-password" />
                </>
              )}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-neutral-700">Role *</span>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
                  disabled={editingId !== null && form.role === 'admin'}
                >
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {formErrors.role && <span className="mt-1.5 block text-xs text-risk-high">{formErrors.role}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-neutral-700">Assigned Centres</span>
                <div className="mt-1.5 space-y-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-xl p-3">
                  {centreOptions.length === 0 ? (
                    <p className="text-xs text-neutral-400">No active centres available. Create centres first.</p>
                  ) : (
                    centreOptions.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.centre_ids.includes(c.id)}
                          onChange={e => setForm({ ...form, centre_ids: e.target.checked ? [...form.centre_ids, c.id] : form.centre_ids.filter(id => id !== c.id) })}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-700 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{c.name} ({c.code})</span>
                      </label>
                    ))
                  )}
                </div>
              </label>
              {formErrors.submit && <p className="text-xs text-risk-high">{formErrors.submit}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Update' : 'Create')}</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {users.length === 0 && !showForm && (
          <EmptyState title="No users yet" detail="Provision your first Anganwadi worker or supervisor." action={<Button className="mt-4" onClick={() => { resetForm(); loadCentres(); setShowForm(true); }}>Create User</Button>} />
        )}

        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Role</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Centres</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{user.name}</td>
                  <td className="px-4 py-3">
                    <BadgePill tone={user.role === 'admin' ? 'info' : user.role === 'supervisor' ? 'moderate' : 'normal'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </BadgePill>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {user.centre_ids && user.centre_ids.length > 0 ? user.centre_ids.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <BadgePill tone={user.disabled ? 'moderate' : 'normal'}>{user.disabled ? 'Disabled' : 'Active'}</BadgePill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'admin' && (
                        <Button variant="secondary" className="min-w-0" onClick={() => edit(user)}>Edit</Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button variant={user.disabled ? 'secondary' : 'danger'} className="min-w-0" onClick={() => toggleActivation(user)}>
                          {user.disabled ? 'Enable' : 'Disable'}
                        </Button>
                      )}
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