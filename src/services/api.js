import { authService } from './auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  const user = authService.getCurrentUser()
  if (!user) throw new ApiError('Your session has ended. Please sign in again.', 401)

  let token
  try {
    token = await user.getIdToken()
  } catch {
    throw new ApiError('Unable to verify your session. Please sign in again.', 401)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('Unable to connect to SPARSH server. Check your network connection and try again.')
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event('sparsh:unauthorized'))
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }
  if (response.ok) return response.status === 204 ? null : response.json()

  const payload = await response.json().catch(() => null)
  const detail = payload?.detail
  if (response.status >= 500) {
    throw new ApiError(typeof detail === 'string' ? detail : 'SPARSH server is unavailable. Please try again shortly.', response.status)
  }
  throw new ApiError(typeof detail === 'object' ? detail.message || `Request failed (${response.status})` : detail || `Request failed (${response.status})`, response.status)
}

export const usersApi = {
  getMe: () => apiRequest('/users/me'),
  list: () => apiRequest('/users'),
  create: (data) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (uid, data) => apiRequest(`/users/${uid}`, { method: 'PATCH', body: JSON.stringify(data) }),
  setActivation: (uid, disabled) => apiRequest(`/users/${uid}/activation`, { method: 'PATCH', body: JSON.stringify({ disabled }) }),
}

export const centresApi = {
  list: () => apiRequest('/centres'),
  create: (data) => apiRequest('/centres', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/centres/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const childrenApi = {
  list: () => apiRequest('/children'),
  get: (id) => apiRequest(`/children/${id}`),
  create: (data) => apiRequest('/children', { method: 'POST', body: JSON.stringify(data) }),
  healthData: (id, data) => apiRequest(`/children/${id}/health-data`, { method: 'POST', body: JSON.stringify(data) }),
  healthHistory: (id) => apiRequest(`/children/${id}/health-data`),
  history: (id) => apiRequest(`/children/${id}/history`),
}

export const screeningsApi = {
  milestones: (childId) => apiRequest(`/children/${childId}/milestones`),
  submit: (data) => apiRequest('/screenings', { method: 'POST', body: JSON.stringify(data) }),
  risk: (id) => apiRequest(`/screenings/${id}/risk`),
}

export const assistantApi = {
  respond: (data) => apiRequest('/assistant/respond', { method: 'POST', body: JSON.stringify(data) }),
}

export const referralsApi = {
  create: (data) => apiRequest('/referrals', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => apiRequest(`/referrals/${id}`),
  byScreening: (id) => apiRequest(`/referrals/screening/${id}`),
}
