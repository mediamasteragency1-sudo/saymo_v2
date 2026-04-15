import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const loginUser = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
