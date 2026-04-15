import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotif } from '../../context/NotifContext'
import { getBookings } from '../../api/bookings'
import './Dashboard.css'

const STATUS_LABELS = {
  pending: { label: 'En attente', class: 'status-pending' },
  confirmed: { label: 'Confirmé', class: 'status-confirmed' },
  cancelled: { label: 'Annulé', class: 'status-cancelled' },
  completed: { label: 'Terminé', class: 'status-completed' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead } = useNotif()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookings()
      .then(({ data }) => setBookings(data.slice(0, 5)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Bonjour, {user.name.split(' ')[0]}</h1>
            <p className="dashboard-subtitle">Voici un aperçu de votre activité</p>
          </div>
          <div className="dashboard-quick-links">
            <Link to="/listings" className="btn btn-ghost btn-sm">Explorer</Link>
            <Link to="/recommendations" className="btn btn-primary btn-sm">Mes recommandations</Link>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent bookings */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Réservations récentes</h2>
              <Link to="/bookings" className="section-link">Voir tout →</Link>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 200, borderRadius: 4 }} />
            ) : bookings.length === 0 ? (
              <div className="empty-card card">
                <p>Aucune réservation pour le moment.</p>
                <Link to="/listings" className="btn btn-ghost btn-sm">Explorer les logements</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((b) => {
                  const status = STATUS_LABELS[b.status] || { label: b.status, class: '' }
                  return (
                    <Link key={b.id} to={`/bookings/${b.id}`} className="booking-row card">
                      <div className="booking-row-info">
                        <p className="booking-row-property">{b.property?.title}</p>
                        <p className="booking-row-dates">
                          {new Date(b.start_date).toLocaleDateString('fr-FR')} →{' '}
                          {new Date(b.end_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="booking-row-right">
                        <span className={`booking-status ${status.class}`}>{status.label}</span>
                        <span className="price booking-row-price">
                          {parseFloat(b.total_price).toFixed(0)} €
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                Notifications
                {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
              </h2>
            </div>

            {notifications.length === 0 ? (
              <div className="empty-card card">
                <p>Aucune notification.</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item card ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => !n.is_read && markRead(n.id)}
                  >
                    <div className="notif-dot" />
                    <div className="notif-content">
                      <p className="notif-message">{n.message}</p>
                      <p className="notif-time">
                        {new Date(n.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Profile CTA */}
        <div className="profile-cta card">
          <div>
            <h3>Complétez votre profil voyageur</h3>
            <p>Passez le test psychologique pour des recommandations ultra-personnalisées</p>
          </div>
          <Link to="/test" className="btn btn-primary">Passer le test</Link>
        </div>
      </div>
    </div>
  )
}
