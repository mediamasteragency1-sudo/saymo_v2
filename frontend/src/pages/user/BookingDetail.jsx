import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getBooking, updateBookingStatus } from '../../api/bookings'
import { getReviews } from '../../api/reviews'
import { useAuth } from '../../context/AuthContext'
import ReviewForm from '../../components/reviews/ReviewForm'
import './BookingDetail.css'

const STATUS_LABELS = {
  pending:   { label: 'En attente de confirmation', class: 'status-pending',   icon: '○' },
  confirmed: { label: 'Confirmée',                  class: 'status-confirmed', icon: '●' },
  cancelled: { label: 'Annulée',                    class: 'status-cancelled', icon: '✕' },
  completed: { label: 'Séjour terminé',             class: 'status-completed', icon: '✓' },
}

export default function BookingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [booking, setBooking]     = useState(null)
  const [review, setReview]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showReview, setShowReview] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    Promise.all([
      getBooking(id),
      getReviews({ user: user?.id }),
    ]).then(([bRes, rRes]) => {
      setBooking(bRes.data)
      const existing = rRes.data.find(r => r.booking === parseInt(id))
      if (existing) setReview(existing)
    }).finally(() => setLoading(false))
  }, [id, user])

  const handleCancel = async () => {
    if (!confirm('Annuler cette réservation ?')) return
    setCancelling(true)
    try {
      const { data } = await updateBookingStatus(id, 'cancelled')
      setBooking(data)
    } finally {
      setCancelling(false)
    }
  }

  const handleReviewSubmit = (newReview) => {
    setReview(newReview)
    setShowReview(false)
  }

  if (loading) return (
    <div className="page container">
      <div className="skeleton" style={{ height: 400, borderRadius: 4 }} />
    </div>
  )

  if (!booking) return (
    <div className="page container">
      <p>Réservation introuvable.</p>
      <Link to="/bookings" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>← Retour</Link>
    </div>
  )

  const status = STATUS_LABELS[booking.status] || { label: booking.status, class: '', icon: '○' }
  const placeholder = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'
  const nights = booking.nights || 0
  const canReview = booking.status === 'completed' && !review
  const canCancel = booking.status === 'pending'

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="booking-detail-header">
          <button onClick={() => navigate('/bookings')} className="btn btn-ghost btn-sm">← Mes réservations</button>
          <span className="booking-detail-id">Réservation #{booking.id}</span>
        </div>

        <div className="booking-detail-layout">
          {/* Left — Info */}
          <div className="booking-detail-main">

            {/* Status banner */}
            <div className={`status-banner ${status.class}`}>
              <span className="status-banner-icon">{status.icon}</span>
              <div>
                <p className="status-banner-label">{status.label}</p>
                <p className="status-banner-sub">
                  Réservé le {new Date(booking.created_at).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Property card */}
            <Link to={`/listings/${booking.property?.id}`} className="booking-property-card card">
              <img
                src={booking.property?.primary_image || placeholder}
                alt={booking.property?.title}
                onError={e => { e.target.src = placeholder }}
                className="booking-property-img"
              />
              <div className="booking-property-info">
                <p className="booking-property-city">{booking.property?.city}</p>
                <h2 className="booking-property-title">{booking.property?.title}</h2>
                <p className="booking-property-meta">
                  {booking.property?.property_type} · {booking.property?.max_guests} voyageurs max
                </p>
              </div>
              <span className="booking-property-arrow">→</span>
            </Link>

            {/* Dates & details */}
            <div className="booking-detail-section card">
              <h3 className="booking-detail-section-title">Détails du séjour</h3>
              <div className="booking-detail-grid">
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Arrivée</span>
                  <span className="booking-detail-value">
                    {new Date(booking.start_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Départ</span>
                  <span className="booking-detail-value">
                    {new Date(booking.end_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Durée</span>
                  <span className="booking-detail-value">{nights} nuit{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Voyageurs</span>
                  <span className="booking-detail-value">{booking.guests}</span>
                </div>
              </div>
              {booking.message && (
                <div className="booking-detail-message">
                  <span className="booking-detail-label">Votre message à l'hôte</span>
                  <p>"{booking.message}"</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="booking-detail-actions">
              {canCancel && (
                <button
                  className="btn btn-sm"
                  style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              )}
              {canReview && (
                <button className="btn btn-primary" onClick={() => setShowReview(true)}>
                  Laisser un avis
                </button>
              )}
              {review && (
                <div className="review-submitted">
                  <span>Avis déposé — {review.rating}/5</span>
                  <div className="review-stars-small">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                        fill={i < review.rating ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                </div>
              )}
              <Link to={`/messages/${booking.id}`} className="btn btn-ghost btn-sm">
                Message l'hôte
              </Link>
            </div>
          </div>

          {/* Right — Price summary */}
          <div className="booking-detail-sidebar">
            <div className="price-summary card">
              <h3 className="price-summary-title">Récapitulatif</h3>
              <div className="price-summary-lines">
                <div className="price-line">
                  <span>{parseFloat(booking.property?.price_per_night || 0).toFixed(0)} € × {nights} nuit{nights > 1 ? 's' : ''}</span>
                  <span className="price">{parseFloat(booking.total_price).toFixed(0)} €</span>
                </div>
                <hr className="divider" style={{ borderStyle: 'dashed', margin: '12px 0' }} />
                <div className="price-line price-line-total">
                  <span>Total payé</span>
                  <span className="price">{parseFloat(booking.total_price).toFixed(0)} €</span>
                </div>
              </div>
            </div>

            <div className="host-info-card card">
              <h3 className="host-info-title">Votre hôte</h3>
              <div className="host-mini">
                <div className="host-mini-avatar">
                  {booking.property?.host?.name?.charAt(0).toUpperCase() || 'H'}
                </div>
                <div>
                  <p className="host-mini-name">{booking.property?.host?.name || 'Hôte'}</p>
                  <p className="host-mini-label">Hôte SAYMO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <ReviewForm
          booking={booking}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  )
}
