import React, { createContext, useContext, useState } from 'react'
import apiClient, { setAuthToken } from '@healthcare/api/src/client'

type Credentials = { email: string; password: string }

type AuthContextType = {
  user: any | null
  login: (c: Credentials) => Promise<void>
  logout: () => Promise<void>
  register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  async function login({ email, password }: Credentials) {
    const res = await apiClient.post('/api/auth/login', { email, password }, { withCredentials: true })
    const accessToken = res.data?.data?.accessToken
    if (accessToken) {
      setAuthToken(accessToken)
      try {
        const profile = await apiClient.get('/api/auth/me')
        setUser(profile.data?.data || null)
      } catch (_) {
        setUser(res.data?.data?.user || null)
      }
    } else {
      throw new Error('No access token returned')
    }
  }

  async function register(payload: { email: string; password: string; firstName?: string; lastName?: string }) {
    const res = await apiClient.post('/api/auth/register', payload)
    return res.data?.data
  }

  async function logout() {
    try {
      await apiClient.post('/api/auth/logout')
    } catch (e) {
      // ignore
    }
    setAuthToken(null)
    setUser(null)
  }

  // attempt to refresh access token on mount
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await apiClient.post('/api/auth/refresh', {}, { withCredentials: true })
        const accessToken = res.data?.data?.accessToken
        if (accessToken) {
          setAuthToken(accessToken)
          try {
            const profile = await apiClient.get('/api/auth/me')
            if (mounted) setUser(profile.data?.data || null)
          } catch (_) {
            // ignore
          }
        }
      } catch (e) {
        // no-op
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return <AuthContext.Provider value={{ user, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default useAuth
