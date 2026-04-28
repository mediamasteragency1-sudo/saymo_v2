import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty } from '../../api/properties'
import { createBooking } from '../../api/bookings'
import { addFavorite, getFavorites, removeFavorite } from '../../api/favorites'
import { getReviews } from '../../api/reviews'
import { useAuth } from '../../context/AuthContext'
import ReportForm from '../../components/reports/ReportForm'
import PaymentModal from '../../components/payment/PaymentModal'
import './PropertyDetail.css'

function Stars({ rating, size = 14 }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <svg key={i} width={size} height={size} viewBox="0 0 24 24"
      fill={i < Math.round(rating) ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ))
}

export default function PropertyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [property, setProperty] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [favoriteId, setFavoriteId] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  const [showReport, setShowReport] = useState(false)
  const [pendingBooking, setPendingBooking]     = useState(null)
  const [clientSecret, setClientSecret]         = useState('')
  const [booking, setBooking] = useState({ start_date: '', end_date: '', guests: 1, message: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      getProperty(id),
      getReviews({ property: id }),
    ]).then(([propRes, revRes]) => {
      setProperty(propRes.data)
      setReviews(revRes.data)
    }).finally(() => setLoading(false))

    if (user) {
      getFavorites().then(({ data }) => {
        const fav = data.find((f) => f.property.id === parseInt(id))
        if (fav) setFavoriteId(fav.id)
      }).catch(() => {})
    }
  }, [id, user])

  const nights = booking.start_date && booking.end_date
    ? Math.max(0, (new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))
    : 0

  const totalPrice = nights * (property?.price_per_night || 0)

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setBookingLoading(true)
    setBookingError('')
    try {
      const { data } = await createBooking({ property: parseInt(id), ...booking })
      setPendingBooking(data)
      setClientSecret(data.client_secret)
    } catch (err) {
      const data = err.response?.data
      setBookingError(
        typeof data === 'string' ? data :
        Object.values(data || {}).flat().join(' ') || 'Erreur lors de la réservation.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) { navigate('/login'); return }
    if (favoriteId) {
      await removeFavorite(favoriteId)
      setFavoriteId(null)
    } else {
      const { data } = await addFavorite(parseInt(id))
      setFavoriteId(data.id)
    }
  }

  if (loading) return (
    <div className="page container">
      <div className="skeleton" style={{ height: 480, borderRadius: 4 }} />
    </div>
  )

  if (!property) return (
    <div className="page container">
      <p>Logement introuvable.</p>
    </div>
  )

  const placeholder = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
  const images = property.images?.length ? property.images : [{ image_url: placeholder, id: 0 }]

  return (
    <div className="property-detail page fade-in">
      <div className="container">
        {/* Gallery */}
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img
              src={images[activeImage]?.image_url || placeholder}
              alt={property.title}
              onError={(e) => { e.target.src = placeholder }}
            />
          </div>
          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className={`detail-thumb ${i === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img.image_url} alt="" onError={(e) => { e.target.src = placeholder }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-layout">
          {/* Left: info */}
          <div className="detail-info">
            <div className="detail-header">
              <div>
                <p className="detail-city">{property.city}</p>
                <h1 className="detail-title">{property.title}</h1>
                <div className="detail-meta">
                  {property.avg_rating && (
                    <span className="detail-rating stars">
                      <Stars rating={property.avg_rating} />
                      <span>{property.avg_rating} ({reviews.length} avis)</span>
                    </span>
                  )}
                  <span className="tag">{property.property_type}</span>
                  <span>{property.max_guests} voyageurs</span>
                  <span>{property.num_bedrooms} ch.</span>
                  <span>{property.num_bathrooms} sdb.</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={`favorite-btn ${favoriteId ? 'active' : ''}`} onClick={handleFavorite}>
                  <svg width="22" height="22" viewBox="0 0 24 24"
                    fill={favoriteId ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {user && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: 'var(--color-muted)' }}
                    onClick={() => setShowReport(true)}
                  >
                    Signaler
                  </button>
                )}
              </div>
            </div>

            <hr className="divider" />

            <div className="detail-host">
              <div className="host-avatar">
                {property.host?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="host-label">Hôte</p>
                <p className="host-name">{property.host?.name}</p>
              </div>
            </div>

            <hr className="divider" />

            <div className="detail-description">
              <h2>À propos de ce logement</h2>
              <p>{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <>
                <hr className="divider" />
                <div className="detail-amenities">
                  <h2>Équipements</h2>
                  <div className="amenities-grid">
                    {property.amenities.map((a) => (
                      <span key={a.id} className="amenity-item">{a.name}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {reviews.length > 0 && (
              <>
                <hr className="divider" />
                <div className="detail-reviews">
                  <h2>Avis ({reviews.length})</h2>
                  <div className="reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="review-item">
                        <div className="review-header">
                          <div className="review-avatar">{r.user_name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <p className="review-name">{r.user_name}</p>
                            <div className="stars review-stars">
                              <Stars rating={r.rating} size={12} />
                            </div>
                          </div>
                          <span className="review-date">
                            {new Date(r.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                        {r.host_reply && (
                          <div className="review-reply">
                            <p className="review-reply-label">Réponse de l'hôte</p>
                            <p>{r.host_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: booking widget */}
          <div className="booking-widget-wrap">
            <div className="booking-widget card">
              <div className="booking-widget-header">
                <span className="price booking-price">
                  {parseFloat(property.price_per_night).toFixed(0)} €
                </span>
                <span className="booking-night">/ nuit</span>
              </div>

              <hr className="divider" style={{ margin: '16px 0', borderStyle: 'dashed' }} />

              {bookingSuccess ? (
                <div className="booking-success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <p>Réservation envoyée !</p>
                  <a href="/bookings" className="btn btn-ghost btn-sm">Voir mes réservations</a>
                </div>
              ) : (
                <form className="booking-form" onSubmit={handleBooking}>
                  <div className="booking-dates">
                    <div className="form-group">
                      <label className="form-label">Arrivée</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={booking.start_date}
                        onChange={(e) => setBooking({ ...booking, start_date: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Départ</label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        min={booking.start_date || new Date().toISOString().split('T')[0]}
                        value={booking.end_date}
                        onChange={(e) => setBooking({ ...booking, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Voyageurs</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={property.max_guests}
                      value={booking.guests}
                      onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message (optionnel)</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Présentez-vous à l'hôte..."
                      value={booking.message}
                      onChange={(e) => setBooking({ ...booking, message: e.target.value })}
                    />
                  </div>

                  {nights > 0 && (
                    <div className="booking-summary">
                      <div className="booking-line">
                        <span>{parseFloat(property.price_per_night).toFixed(0)} € × {nights} nuit{nights > 1 ? 's' : ''}</span>
                        <span className="price">{totalPrice.toFixed(0)} €</span>
                      </div>
                      <hr className="divider" style={{ margin: '12px 0' }} />
                      <div className="booking-line booking-total">
                        <span>Total</span>
                        <span className="price">{totalPrice.toFixed(0)} €</span>
                      </div>
                    </div>
                  )}

                  {bookingError && <p className="form-error">{bookingError}</p>}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={bookingLoading}>
                    {bookingLoading ? 'Réservation...' : 'Réserver'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      {showReport && (
        <ReportForm
          propertyId={parseInt(id)}
          onClose={() => setShowReport(false)}
        />
      )}

      {pendingBooking && clientSecret && (
        <PaymentModal
          booking={pendingBooking}
          clientSecret={clientSecret}
          onSuccess={() => {
            setPendingBooking(null)
            setClientSecret('')
            setBookingSuccess(true)
          }}
          onClose={() => {
            setPendingBooking(null)
            setClientSecret('')
          }}
        />
      )}
    </div>
  )
}
