import { useEffect, useState } from 'react'
import { tasksApi, projectsApi, usersApi } from '../api.js'
import { STATUSES, PRIORITIES, indexById } from '../constants.js'
import Badge from '../components/Badge.jsx'

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
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
      // Projects/users are used to label and populate the assign dropdowns.
      const [t, p, u] = await Promise.all([
        tasksApi.list(),
        projectsApi.list(),
        usersApi.list(),
      ])
      setTasks(t)
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

  const projectsById = indexById(projects)
  const usersById = indexById(users)

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
  }

  function startEdit(task) {
    setEditingId(task.id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: task.dueDate || '',
    })
    setFormError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validate() {
    if (form.title.trim().length < 2 || form.title.trim().length > 255) {
      return 'Title must be between 2 and 255 characters.'
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
    // Only send fields the API accepts on create/edit (assignee/project are
    // set through the dedicated assign endpoints, not here).
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    }
    try {
      if (editingId) {
        await tasksApi.update(editingId, payload)
      } else {
        await tasksApi.create(payload)
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

  function remove(task) {
    if (!confirm(`Delete task "${task.title}"?`)) return
    runAction(() => tasksApi.remove(task.id))
  }

  function assignProject(task, value) {
    runAction(() => tasksApi.assignProject(task.id, Number(value)))
  }

  function assignUser(task, value) {
    runAction(() => tasksApi.assignUser(task.id, Number(value)))
  }

  return (
    <div>
      <div className="page-head">
        <h2>📋 Tasks</h2>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      {error && <div className="banner error">{error}</div>}

      <form className="panel" onSubmit={submit}>
        <h3>{editingId ? `Edit task #${editingId}` : 'New task'}</h3>
        {formError && <div className="banner error">{formError}</div>}
        <div className="form-grid">
          <div className="field">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
            />
            <span className="hint">Required, 2–255 characters.</span>
          </div>
          <div className="field">
            <label>Status *</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Priority *</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create task'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="panel">
        <h3>All tasks ({tasks.length})</h3>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="empty">No tasks yet — time for a catnap. 😴</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Assignee</th>
                <th>Project</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    {task.description && (
                      <div className="muted" style={{ fontSize: 12 }}>
                        {task.description}
                      </div>
                    )}
                  </td>
                  <td><Badge kind="status" value={task.status} /></td>
                  <td><Badge kind="priority" value={task.priority} /></td>
                  <td>{task.dueDate || <span className="muted">—</span>}</td>
                  <td>
                    <select
                      value={task.assigneeId ?? ''}
                      onChange={(e) => assignUser(task, e.target.value)}
                    >
                      <option value="" disabled>
                        {task.assigneeId
                          ? usersById[task.assigneeId]?.username ?? `#${task.assigneeId}`
                          : 'Assign user…'}
                      </option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={task.projectId ?? ''}
                      onChange={(e) => assignProject(task, e.target.value)}
                    >
                      <option value="" disabled>
                        {task.projectId
                          ? projectsById[task.projectId]?.name ?? `#${task.projectId}`
                          : 'Assign project…'}
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="row-actions">
                    <button className="link" onClick={() => startEdit(task)}>Edit</button>
                    <button className="link danger" onClick={() => remove(task)}>Delete</button>
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
