import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminGetAnalytics } from '../../api/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetAnalytics()
      .then(({ data }) => setAnalytics(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Utilisateurs totaux', value: analytics?.users?.total, sub: `+${analytics?.users?.new_last_30_days} ce mois` },
    { label: 'Logements actifs', value: analytics?.properties?.active, sub: `${analytics?.properties?.total} total` },
    { label: 'Réservations totales', value: analytics?.bookings?.total, sub: `${analytics?.bookings?.recent} récentes` },
    { label: 'Revenus totaux', value: `${analytics?.revenue?.total?.toFixed(0)} €`, sub: 'Réservations confirmées', isPrice: true },
  ]

  return (
    <div className="page fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36 }}>Administration</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">Utilisateurs</Link>
            <Link to="/admin/properties" className="btn btn-ghost btn-sm">Logements</Link>
            <Link to="/admin/bookings" className="btn btn-ghost btn-sm">Réservations</Link>
            <Link to="/admin/reports" className="btn btn-ghost btn-sm">Signalements</Link>
          </div>
        </div>

        {/* KPI stats */}
        <div className="admin-stats">
          {stats.map((s, i) => (
            <div key={i} className="admin-stat-card card">
              <span className={`admin-stat-value ${s.isPrice ? 'price' : ''}`}>{s.value}</span>
              <span className="admin-stat-label">{s.label}</span>
              <span className="admin-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        {analytics?.bookings_by_month?.length > 0 && (
          <div className="admin-chart card">
            <h2 style={{ fontSize: 18, marginBottom: 24 }}>Réservations par mois</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.bookings_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E3" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Instrument Sans' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Instrument Sans' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 2, border: '0.5px solid #E5E5E3',
                    fontFamily: 'Instrument Sans', fontSize: 13,
                  }}
                />
                <Bar dataKey="count" fill="#0A0A0A" radius={[2, 2, 0, 0]} name="Réservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick links */}
        <div className="admin-quick-links">
          <Link to="/admin/users" className="admin-link-card card">
            <span style={{ fontSize: 32, fontFamily: 'var(--font-display)' }}>{analytics?.users?.total}</span>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>Utilisateurs</span>
            <span className="admin-link-arrow">→</span>
          </Link>
          <Link to="/admin/properties" className="admin-link-card card">
            <span style={{ fontSize: 32, fontFamily: 'var(--font-display)' }}>{analytics?.properties?.total}</span>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>Logements</span>
            <span className="admin-link-arrow">→</span>
          </Link>
          <Link to="/admin/bookings" className="admin-link-card card">
            <span style={{ fontSize: 32, fontFamily: 'var(--font-display)' }}>{analytics?.bookings?.total}</span>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)' }}>Réservations</span>
            <span className="admin-link-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
