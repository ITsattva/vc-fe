import axios from 'axios'

// All calls go through the /api prefix. Vite's dev proxy (see vite.config.js)
// strips /api and forwards to http://localhost:8080. The prefix keeps API
// requests from colliding with the SPA's own routes (/tasks, etc.).
const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// The backend has no global exception handler, so failures may come back as
// 400/500 with varying bodies. Normalize them into a single Error message
// that pages can show to the user.
function toError(err) {
  const res = err.response
  if (res) {
    const data = res.data
    let msg
    if (typeof data === 'string' && data.trim()) {
      msg = data
    } else if (data && typeof data === 'object') {
      msg = data.message || data.error || JSON.stringify(data)
    }
    return new Error(msg || `Request failed (HTTP ${res.status})`)
  }
  if (err.request) {
    return new Error('Cannot reach the backend. Is it running on :8080?')
  }
  return new Error(err.message || 'Unexpected error')
}

async function request(promise) {
  try {
    const res = await promise
    return res.data
  } catch (err) {
    throw toError(err)
  }
}

// ---- Tasks ----
export const tasksApi = {
  list: () => request(client.get('/tasks')),
  get: (id) => request(client.get(`/tasks/${id}`)),
  create: (task) => request(client.post('/tasks', task)),
  update: (id, task) => request(client.patch(`/tasks/${id}`, task)),
  remove: (id) => request(client.delete(`/tasks/${id}`)),
  assignProject: (id, projectId) =>
    request(client.patch(`/tasks/${id}/assignProject`, { id: projectId })),
  assignUser: (id, userId) =>
    request(client.patch(`/tasks/${id}/assignUser`, { id: userId })),
}

// ---- Projects ----
export const projectsApi = {
  list: () => request(client.get('/projects')),
  get: (id) => request(client.get(`/projects/${id}`)),
  create: (project) => request(client.post('/projects', project)),
  update: (id, project) => request(client.patch(`/projects/${id}`, project)),
  remove: (id) => request(client.delete(`/projects/${id}`)),
  assignOwner: (id, userId) =>
    request(client.patch(`/projects/${id}/assign`, { id: userId })),
}

// ---- Users ----
export const usersApi = {
  list: () => request(client.get('/users')),
  get: (id) => request(client.get(`/users/${id}`)),
  create: (user) => request(client.post('/users', user)),
  update: (id, user) => request(client.patch(`/users/${id}`, user)),
  remove: (id) => request(client.delete(`/users/${id}`)),
}
