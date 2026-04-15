import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getNotifications, markRead, markAllRead } from '../api/notifications'
import { useAuth } from './AuthContext'

const NotifContext = createContext(null)

export function NotifProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await getNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unread_count)
    } catch {
      // Silently fail
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkRead = async (id) => {
    await markRead(id)
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <NotifContext.Provider value={{
      notifications, unreadCount, fetchNotifications,
      markRead: handleMarkRead, markAllRead: handleMarkAllRead
    }}>
      {children}
    </NotifContext.Provider>
  )
}

export function useNotif() {
  const ctx = useContext(NotifContext)
  if (!ctx) throw new Error('useNotif must be used within NotifProvider')
  return ctx
}
