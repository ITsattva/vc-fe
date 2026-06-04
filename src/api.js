import axios from 'axios'

// All calls go through the /api prefix. Vite's dev proxy (see vite.config.js)
// strips /api and forwards to http://localhost:8080. The prefix keeps API
// requests from colliding with the SPA's own routes (/tasks, etc.).
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// The backend's GlobalExceptionHandler returns a structured ExceptionResponse:
//   { timestamp, status, error, message, path, fieldErrors: [{ field, message }] }
// Normalize it into a single Error message that pages can show, expanding any
// field-level validation errors so the user sees what to fix.
function toError(err) {
  const res = err.response
  if (res) {
    const data = res.data
    let msg
    if (typeof data === 'string' && data.trim()) {
      msg = data
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.fieldErrors) && data.fieldErrors.length) {
        const details = data.fieldErrors
          .map((f) => (f.field ? `${f.field}: ${f.message}` : f.message))
          .join('; ')
        msg = data.message ? `${data.message} — ${details}` : details
      } else {
        msg = data.message || data.error || JSON.stringify(data)
      }
    }
    return new Error(msg || `Request failed (HTTP ${res.status})`)
  }
  if (err.request) {
    return new Error('Cannot reach the backend. Is it running on :8080?')
  }
  return new Error(err.message || 'Unexpected error')
}

// Every endpoint now wraps its payload in an envelope, e.g.
//   list:   { message, tasks: [...] }
//   single: { message, task: {...} }
//   delete/assign: { message }   (no payload)
// `key` names the field to unwrap; when it's absent (or the body has no such
// field, as with delete/assign) the raw body is returned.
async function request(promise, key) {
  try {
    const res = await promise
    const data = res.data
    if (key && data && typeof data === 'object' && key in data) {
      return data[key]
    }
    return data
  } catch (err) {
    throw toError(err)
  }
}

// ---- Tasks ----
export const tasksApi = {
  list: () => request(client.get('/tasks'), 'tasks'),
  get: (id) => request(client.get(`/tasks/${id}`), 'task'),
  create: (task) => request(client.post('/tasks', task), 'task'),
  update: (id, task) => request(client.patch(`/tasks/${id}`, task), 'task'),
  remove: (id) => request(client.delete(`/tasks/${id}`)),
  assignProject: (id, projectId) =>
    request(client.patch(`/tasks/${id}/assignProject`, { id: projectId })),
  assignUser: (id, userId) =>
    request(client.patch(`/tasks/${id}/assignUser`, { id: userId })),
}

// ---- Projects ----
export const projectsApi = {
  list: () => request(client.get('/projects'), 'projects'),
  get: (id) => request(client.get(`/projects/${id}`), 'project'),
  create: (project) => request(client.post('/projects', project), 'project'),
  update: (id, project) => request(client.patch(`/projects/${id}`, project), 'project'),
  remove: (id) => request(client.delete(`/projects/${id}`)),
  assignOwner: (id, userId) =>
    request(client.patch(`/projects/${id}/assign`, { id: userId })),
}

// ---- Users ----
export const usersApi = {
  list: () => request(client.get('/users'), 'users'),
  get: (id) => request(client.get(`/users/${id}`), 'user'),
  create: (user) => request(client.post('/users', user), 'user'),
  update: (id, user) => request(client.patch(`/users/${id}`, user), 'user'),
  remove: (id) => request(client.delete(`/users/${id}`)),
}
