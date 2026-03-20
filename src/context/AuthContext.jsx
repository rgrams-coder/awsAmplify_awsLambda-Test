import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const SESSION_MS = 2 * 60 * 60 * 1000 // 2 hours

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('token_expiry')
    clearTimeout(timerRef.current)
    setUser(null)
  }, [])

  const scheduleAutoLogout = useCallback((expiresAt) => {
    clearTimeout(timerRef.current)
    const delay = expiresAt - Date.now()
    if (delay <= 0) { logout(); return }
    timerRef.current = setTimeout(logout, delay)
  }, [logout])

  const setSession = useCallback((userData, token, expiresIn) => {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem('token', token)
    localStorage.setItem('token_expiry', expiresAt)
    setUser(userData)
    scheduleAutoLogout(expiresAt)
  }, [scheduleAutoLogout])

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const expiry = Number(localStorage.getItem('token_expiry'))
    if (token && expiry && expiry > Date.now()) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(userData => {
          setUser(userData)
          scheduleAutoLogout(expiry)
        })
        .catch(logout)
        .finally(() => setLoading(false))
    } else {
      logout()
      setLoading(false)
    }
    return () => clearTimeout(timerRef.current)
  }, [logout, scheduleAutoLogout])

  return (
    <AuthContext.Provider value={{ user, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
