import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBookings, updateBookingStatus } from '../../api/bookings'
import './Bookings.css'

const STATUS_LABELS = {
  pending: { label: 'En attente', class: 'status-pending' },
  confirmed: { label: 'Confirmé', class: 'status-confirmed' },
  cancelled: { label: 'Annulé', class: 'status-cancelled' },
  completed: { label: 'Terminé', class: 'status-completed' },
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getBookings()
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return
    try {
      const { data } = await updateBookingStatus(id, 'cancelled')
      setBookings((prev) => prev.map((b) => b.id === id ? data : b))
    } catch {}
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Mes réservations</h1>

        <div className="bookings-filters">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Toutes' : STATUS_LABELS[f]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 4 }} />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Aucune réservation {filter !== 'all' ? STATUS_LABELS[filter]?.label?.toLowerCase() : ''}.</p>
            <Link to="/listings" className="btn btn-ghost">Explorer les logements</Link>
          </div>
        ) : (
          <div className="bookings-table">
            {filtered.map((b) => {
              const status = STATUS_LABELS[b.status] || { label: b.status, class: '' }
              const placeholder = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'
              return (
                <div key={b.id} className="booking-card card">
                  <div className="booking-card-image">
                    <img
                      src={b.property?.primary_image || placeholder}
                      alt={b.property?.title}
                      onError={(e) => { e.target.src = placeholder }}
                    />
                  </div>
                  <div className="booking-card-info">
                    <div className="booking-card-top">
                      <h3 className="booking-card-title">
                        <Link to={`/listings/${b.property?.id}`}>{b.property?.title}</Link>
                      </h3>
                      <span className={`booking-status ${status.class}`}>{status.label}</span>
                    </div>
                    <p className="booking-card-city">{b.property?.city}</p>
                    <div className="booking-card-dates">
                      <span>
                        {new Date(b.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="booking-arrow">→</span>
                      <span>
                        {new Date(b.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="booking-nights">({b.nights} nuit{b.nights > 1 ? 's' : ''})</span>
                    </div>
                    <div className="booking-card-bottom">
                      <span className="price booking-total-price">
                        {parseFloat(b.total_price).toFixed(0)} €
                      </span>
                      <div className="booking-actions">
                        <Link to={`/bookings/${b.id}`} className="btn btn-ghost btn-sm">Détails</Link>
                        {b.status === 'pending' && (
                          <button
                            className="btn btn-sm"
                            style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                            onClick={() => handleCancel(b.id)}
                          >
                            Annuler
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <Link
                            to={`/listings/${b.property?.id}`}
                            className="btn btn-ghost btn-sm"
                          >
                            Laisser un avis
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
