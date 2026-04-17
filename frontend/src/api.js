const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const getStoredAuth = () => {
  const raw = localStorage.getItem('curbcall-auth')
  return raw ? JSON.parse(raw) : null
}

export const setStoredAuth = (payload) => {
  localStorage.setItem('curbcall-auth', JSON.stringify(payload))
}

export const clearStoredAuth = () => {
  localStorage.removeItem('curbcall-auth')
}

export const apiFetch = async (path, options = {}) => {
  const auth = getStoredAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${response.status})`)
  }

  return response.json()
}
