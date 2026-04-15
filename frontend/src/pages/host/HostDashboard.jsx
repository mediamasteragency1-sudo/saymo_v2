import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHostProperties } from '../../api/properties'
import { getHostBookings, updateBookingStatus } from '../../api/bookings'
import './HostDashboard.css'

export default function HostDashboard() {
  const [properties, setProperties] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getHostProperties(),
      getHostBookings(),
    ]).then(([propRes, bookRes]) => {
      setProperties(propRes.data)
      setBookings(bookRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const stats = {
    total_properties: properties.length,
    active_properties: properties.filter((p) => p.is_active).length,
    pending_bookings: bookings.filter((b) => b.status === 'pending').length,
    confirmed_bookings: bookings.filter((b) => b.status === 'confirmed').length,
    total_revenue: bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
  }

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="host-header">
          <div>
            <h1 className="dashboard-title">Espace Hôte</h1>
            <p className="dashboard-subtitle">Gérez vos logements et réservations</p>
          </div>
          <Link to="/host/properties/new" className="btn btn-primary">+ Nouveau logement</Link>
        </div>

        {/* Stats */}
        <div className="host-stats">
          <div className="stat-card card">
            <span className="stat-value">{stats.total_properties}</span>
            <span className="stat-label">Logements</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{stats.active_properties}</span>
            <span className="stat-label">Actifs</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value">{stats.pending_bookings}</span>
            <span className="stat-label">En attente</span>
          </div>
          <div className="stat-card card">
            <span className="stat-value price">{stats.total_revenue.toFixed(0)} €</span>
            <span className="stat-label">Revenus totaux</span>
          </div>
        </div>

        <div className="host-grid">
          {/* Properties */}
          <div>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <h2 className="section-title">Mes logements</h2>
              <Link to="/host/properties" className="section-link">Gérer →</Link>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 200, borderRadius: 4 }} />
            ) : (
              <div className="host-properties-list">
                {properties.slice(0, 5).map((p) => {
                  const placeholder = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'
                  return (
                    <Link key={p.id} to={`/host/properties/${p.id}/edit`} className="host-property-row card">
                      <img
                        src={p.primary_image || placeholder}
                        alt={p.title}
                        onError={(e) => { e.target.src = placeholder }}
                        className="host-prop-thumb"
                      />
                      <div className="host-prop-info">
                        <p className="host-prop-title">{p.title}</p>
                        <p className="host-prop-city">{p.city}</p>
                      </div>
                      <div className="host-prop-right">
                        <span className="price">{parseFloat(p.price_per_night).toFixed(0)} €/nuit</span>
                        <span className={`tag ${p.is_active ? '' : 'tag-inactive'}`}>
                          {p.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <h2 className="section-title">Réservations récentes</h2>
              <Link to="/host/bookings" className="section-link">Voir tout →</Link>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 200, borderRadius: 4 }} />
            ) : (
              <div className="bookings-list">
                {bookings.filter((b) => b.status === 'pending').slice(0, 5).map((b) => (
                  <div key={b.id} className="host-booking-row card">
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{b.user_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.property?.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                        {b.start_date} → {b.end_date}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="price" style={{ fontSize: 15 }}>
                        {parseFloat(b.total_price).toFixed(0)} €
                      </span>
                      <ConfirmButtons bookingId={b.id} onUpdate={(updated) => {
                        setBookings((prev) => prev.map((bk) => bk.id === updated.id ? updated : bk))
                      }} />
                    </div>
                  </div>
                ))}
                {bookings.filter((b) => b.status === 'pending').length === 0 && (
                  <div className="card" style={{ padding: 24, color: 'var(--color-muted)', fontSize: 14, textAlign: 'center' }}>
                    Aucune réservation en attente
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmButtons({ bookingId, onUpdate }) {
  const [loading, setLoading] = useState(false)

  const handle = async (status) => {
    setLoading(true)
    try {
      const { data } = await updateBookingStatus(bookingId, status)
      onUpdate(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => handle('confirmed')}
        disabled={loading}
        style={{ padding: '4px 12px', fontSize: 11 }}
      >
        Confirmer
      </button>
      <button
        className="btn btn-sm"
        onClick={() => handle('cancelled')}
        disabled={loading}
        style={{ padding: '4px 12px', fontSize: 11, borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
      >
        Refuser
      </button>
    </div>
  )
}
