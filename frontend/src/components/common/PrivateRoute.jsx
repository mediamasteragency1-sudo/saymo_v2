import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: 200, height: 24 }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
