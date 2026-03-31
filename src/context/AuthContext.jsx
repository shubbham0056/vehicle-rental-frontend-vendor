import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('vendor_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, msg: data.errors ? data.errors.map(e => e.msg).join(' · ') : (data.msg || 'Login failed') }
    if (data.role !== 'vendor') return { success: false, msg: 'Access denied. Vendor accounts only.' }

    const userData = { email: data.email, name: data.name, role: data.role, token: data.token, refreshToken: data.refreshToken }
    sessionStorage.setItem('vendor_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true }
  }

  // Returns a valid access token, refreshing if needed
  const getToken = useCallback(async () => {
    const stored = sessionStorage.getItem('vendor_user')
    if (!stored) return null
    const userData = JSON.parse(stored)

    // Try to refresh
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: userData.refreshToken }),
      })
      if (!res.ok) { logout(); return null; }
      const data = await res.json()
      const updated = { ...userData, token: data.token, refreshToken: data.refreshToken }
      sessionStorage.setItem('vendor_user', JSON.stringify(updated))
      setUser(updated)
      return data.token
    } catch {
      return userData.token
    }
  }, [])

  // Authenticated fetch — auto-refreshes on 401
  const authFetch = useCallback(async (url, options = {}) => {
    const stored = sessionStorage.getItem('vendor_user')
    if (!stored) return null
    const { token } = JSON.parse(stored)

    const makeRequest = (t) => {
      const isFormData = options.body instanceof FormData
      return fetch(url, {
        ...options,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...options.headers,
          Authorization: `Bearer ${t}`,
        },
      })
    }

    let res = await makeRequest(token)
    if (res.status === 401) {
      const newToken = await getToken()
      if (!newToken) return res
      res = await makeRequest(newToken)
    }
    return res
  }, [getToken])

  const logout = useCallback(async () => {
    const stored = sessionStorage.getItem('vendor_user')
    if (stored) {
      const { refreshToken } = JSON.parse(stored)
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {})
    }
    sessionStorage.removeItem('vendor_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
