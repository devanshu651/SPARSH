import { useState, useEffect } from 'react'
import { usersApi, centresApi } from '../services/api'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import BadgePill from '../components/BadgePill'
import Icon from '../components/Icon'

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
  const [centresLoading, setCentresLoading] = useState(false)
  const [centreLoadError, setCentreLoadError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await usersApi.list()
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function loadCentres() {
    setCentresLoading(true)
    setCentreLoadError(null)
    try {
      const data = await centresApi.list()
      setCentreOptions(Array.isArray(data) ? data.filter(c => c.active) : [])
    } catch (err) {
      setCentreLoadError(err)
    } finally {
      setCentresLoading(false)
    }
  }

  function resetForm() {
    setForm(initialForm)
    setFormErrors({})
    setEditingId(null)
    setShowForm(false)
  }

  function createUser() {
    resetForm()
    setShowForm(true)
    loadCentres()
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (editingId === null) {
      const rawMobile = form.mobile.replace(/\D/g, '')
      if (rawMobile.length !== 10) e.mobile = 'Mobile number must be exactly 10 digits.'
      if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    }
    if (!form.role) e.role = 'Select a role.'
    if (!form.centre_ids.length) e.centre_ids = 'Assign at least one active centre.'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(event) {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        await usersApi.update(editingId, {
          name: form.name,
          role: form.role,
          centre_ids: form.centre_ids
        })
      } else {
        await usersApi.create({
          name: form.name,
          mobile: form.mobile.replace(/\D/g, ''),
          password: form.password,
          role: form.role,
          centre_ids: form.centre_ids
        })
      }
      resetForm()
      await load()
    } catch (e) {
      setFormErrors({ submit: e.message || 'Failed to save user account.' })
    } finally {
      setSaving(false)
    }
  }

  function edit(user) {
    setForm({
      name: user.name,
      mobile: user.mobile || '',
      password: '',
      role: user.role,
      centre_ids: user.centre_ids || []
    })
    setEditingId(user.uid)
    setShowForm(true)
    loadCentres()
  }

  async function toggleActivation(user) {
    const confirmMsg = user.disabled ? 'Enable this user account?' : 'Disable this user account?'
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1A201E]">User Accounts</h2>
          <p className="text-xs text-[#5A6660]">Manage Anganwadi health workers and supervisors</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={createUser}
        >
          <Icon name="plus" className="h-4 w-4 mr-1" />
          <span>Add User</span>
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#E5EBE7] bg-white p-5 shadow-2xs">
          <h3 className="text-sm font-semibold text-[#1A201E] mb-4">
            {editingId ? 'Edit User' : 'Create New User Account'}
          </h3>
          <form onSubmit={submit} className="space-y-4 max-w-2xl">
            <Input
              label="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={formErrors.name}
              maxLength={120}
            />

            {editingId === null && (
              <>
                <Input
                  label="Mobile Number *"
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  error={formErrors.mobile}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                />
                <Input
                  label="Initial Password *"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={formErrors.password}
                />
              </>
            )}

            <Select
              label="Role *"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>

            {/* Assigned Centres */}
            <div>
              <label className="block text-xs font-semibold text-[#1A201E] mb-1.5">
                Assigned Centres *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-[#E5EBE7] p-3">
                {centresLoading ? (
                  <p className="text-xs text-[#5A6660]">Loading active centres…</p>
                ) : centreLoadError ? (
                  <div className="space-y-2">
                    <p className="text-xs text-[#D96B43]">Unable to load active centres: {centreLoadError.message}</p>
                    <Button type="button" size="sm" variant="secondary" onClick={loadCentres}>Retry</Button>
                  </div>
                ) : centreOptions.length === 0 ? (
                  <p className="text-xs text-[#8E9C95]">No active centres available. Create centres first.</p>
                ) : (
                  centreOptions.map((c) => (
                    <label key={c.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#1A201E]">
                      <input
                        type="checkbox"
                        checked={form.centre_ids.includes(c.id)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            centre_ids: e.target.checked
                              ? [...form.centre_ids, c.id]
                              : form.centre_ids.filter((id) => id !== c.id)
                          })
                        }
                        className="h-4 w-4 rounded border-[#CBD5D0] text-[#1B4D3E] focus:ring-[#1B4D3E]"
                      />
                      <span>{c.name} ({c.code})</span>
                    </label>
                  ))
                )}
              </div>
              {formErrors.centre_ids && <p className="mt-1 text-xs text-[#D32F2F]">{formErrors.centre_ids}</p>}
            </div>

            {formErrors.submit && <p className="text-xs text-[#D32F2F]">{formErrors.submit}</p>}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={saving || centresLoading || Boolean(centreLoadError) || centreOptions.length === 0}
              >
                {saving ? 'Saving…' : (editingId ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {users.length === 0 && !showForm ? (
        <EmptyState
          title="No users found"
          detail="Create your first healthcare worker account."
          action={
            <Button variant="primary" className="mt-4" onClick={createUser}>
              Add User
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5EBE7] bg-white shadow-2xs">
          <table className="w-full text-left" role="grid">
            <thead>
              <tr className="border-b border-[#E5EBE7] bg-[#F9FBFA]">
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Name</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Role</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#5A6660]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EBE7]">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-[#F9FBFA] transition">
                  <td className="px-4 py-3 text-xs font-semibold text-[#1A201E]">{user.name}</td>
                  <td className="px-4 py-3 text-xs text-[#5A6660] capitalize">{user.role}</td>
                  <td className="px-4 py-3">
                    <BadgePill tone={user.disabled ? 'risk' : 'normal'}>
                      {user.disabled ? 'Disabled' : 'Active'}
                    </BadgePill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => edit(user)}>
                        Edit
                      </Button>
                      <Button
                        variant={user.disabled ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => toggleActivation(user)}
                      >
                        {user.disabled ? 'Enable' : 'Disable'}
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
