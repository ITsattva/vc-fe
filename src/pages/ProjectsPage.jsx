import { useEffect, useState } from 'react'
import { projectsApi, usersApi } from '../api.js'
import { indexById } from '../constants.js'

const EMPTY_FORM = { name: '', description: '' }

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
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
      const [p, u] = await Promise.all([projectsApi.list(), usersApi.list()])
      setProjects(p)
      setUsers(u)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const usersById = indexById(users)

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
  }

  function startEdit(project) {
    setEditingId(project.id)
    setForm({
      name: project.name || '',
      description: project.description || '',
    })
    setFormError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validate() {
    if (form.name.trim().length < 2 || form.name.trim().length > 255) {
      return 'Name must be between 2 and 255 characters.'
    }
    if (form.description && form.description.length > 5000) {
      return 'Description must be at most 5000 characters.'
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
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
    }
    try {
      if (editingId) {
        await projectsApi.update(editingId, payload)
      } else {
        await projectsApi.create(payload)
      }
      resetForm()
      await load()
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function runAction(fn) {
    setError(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  function remove(project) {
    if (!confirm(`Delete project "${project.name}"?`)) return
    runAction(() => projectsApi.remove(project.id))
  }

  function assignOwner(project, value) {
    runAction(() => projectsApi.assignOwner(project.id, Number(value)))
  }

  return (
    <div>
      <div className="page-head">
        <h2>Projects</h2>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="banner error">{error}</div>}

      <form className="panel" onSubmit={submit}>
        <h3>{editingId ? `Edit project #${editingId}` : 'New project'}</h3>
        {formError && <div className="banner error">{formError}</div>}
        <div className="form-grid">
          <div className="field">
            <label>Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Project name"
            />
            <span className="hint">Required, 2–255 characters.</span>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional, max 5000 characters"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create project'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <h3>All projects ({projects.length})</h3>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="empty">No projects yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Tasks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td><strong>{project.name}</strong></td>
                  <td className="muted">
                    {project.description || '—'}
                  </td>
                  <td>
                    <select
                      value={project.ownerId ?? ''}
                      onChange={(e) => assignOwner(project, e.target.value)}
                    >
                      <option value="" disabled>
                        {project.ownerId
                          ? usersById[project.ownerId]?.username ?? `#${project.ownerId}`
                          : 'Assign owner…'}
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </td>
                  <td>{project.tasks ? project.tasks.length : 0}</td>
                  <td className="row-actions">
                    <button className="link" onClick={() => startEdit(project)}>Edit</button>
                    <button className="link danger" onClick={() => remove(project)}>Delete</button>
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
