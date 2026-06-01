import { useEffect, useState } from 'react'
import { usersApi } from '../api.js'
import { ROLES } from '../constants.js'

const EMPTY_FORM = { username: '', email: '', password: '', role: 'USER' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setUsers(await usersApi.list())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
  }

  function startEdit(user) {
    setEditingId(user.id)
    // Password is write-only and never returned, so it stays blank on edit.
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
    })
    setFormError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validate() {
    if (form.username.trim().length < 2 || form.username.trim().length > 255) {
      return 'Username must be between 2 and 255 characters.'
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || form.email.length > 255) {
      return 'A valid email (max 255 characters) is required.'
    }
    // Password is required on create only.
    if (!editingId && (form.password.length < 8 || form.password.length > 255)) {
      return 'Password must be between 8 and 255 characters.'
    }
    if (editingId && form.password && (form.password.length < 8 || form.password.length > 255)) {
      return 'Password must be between 8 and 255 characters.'
    }
    return null
  }

  async function submit(e) {
    e.preventDefault()
    const v = validate()
    if (v) {
      setFormError(v)
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editingId) {
        // Only send the password if the user typed a new one.
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
        }
        if (form.password) payload.password = form.password
        await usersApi.update(editingId, payload)
      } else {
        await usersApi.create({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        })
      }
      resetForm()
      await load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(user) {
    if (!confirm(`Delete user "${user.username}"?`)) return
    setError(null)
    try {
      await usersApi.remove(user.id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>😺 Users</h2>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="banner error">{error}</div>}

      <form className="panel" onSubmit={submit}>
        <h3>{editingId ? `Edit user #${editingId}` : 'New user'}</h3>
        {formError && <div className="banner error">{formError}</div>}
        <div className="form-grid">
          <div className="field">
            <label>Username *</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
            />
            <span className="hint">Required, 2–255 characters.</span>
          </div>
          <div className="field">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
            />
            <span className="hint">Required, valid email.</span>
          </div>
          <div className="field">
            <label>Password {editingId ? '' : '*'}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? 'Leave blank to keep current' : '8–255 characters'}
            />
            <span className="hint">
              {editingId ? 'Optional — only set to change it.' : 'Required, 8–255 characters.'}
            </span>
          </div>
          <div className="field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <h3>All users ({users.length})</h3>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty">No users yet — invite your first hooman. 🐾</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'priority-HIGH' : 'status-TODO'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="row-actions">
                    <button className="link" onClick={() => startEdit(user)}>Edit</button>
                    <button className="link danger" onClick={() => remove(user)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
