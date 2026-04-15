import React, { useState, useEffect } from 'react'
import { createReview } from '../../api/reviews'
import './ReviewForm.css'

export default function ReviewForm({ booking, onSubmit, onClose }) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setError('Choisissez une note.'); return }
    setLoading(true)
    setError('')
    try {
      const { data } = await createReview({
        property: booking.property.id,
        booking:  booking.id,
        rating,
        comment,
      })
      onSubmit(data)
    } catch (err) {
      const d = err.response?.data
      setError(
        typeof d === 'string' ? d :
        Object.values(d || {}).flat().join(' ') || 'Erreur lors de la soumission.'
      )
    } finally {
      setLoading(false)
    }
  }

  const LABELS = ['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent']
  const displayRating = hovered || rating

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={e => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2 className="review-modal-title">Laisser un avis</h2>
          <button className="review-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="review-modal-property">
          <p className="review-property-name">{booking.property?.title}</p>
          <p className="review-property-dates">
            {new Date(booking.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} →{' '}
            {new Date(booking.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {/* Star rating */}
          <div className="review-stars-section">
            <label className="form-label">Note globale</label>
            <div className="review-stars-picker">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  className={`star-btn ${n <= displayRating ? 'filled' : ''}`}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(n)}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24"
                    fill={n <= displayRating ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="review-rating-label">{LABELS[displayRating]}</p>
            )}
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">Votre commentaire *</label>
            <textarea
              className="form-input"
              rows="5"
              placeholder="Décrivez votre expérience : l'accueil, le logement, l'environnement..."
              required
              minLength={20}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <p className="review-char-count">{comment.length} caractère{comment.length !== 1 ? 's' : ''} (20 min.)</p>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="review-form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
              {loading ? 'Publication...' : 'Publier mon avis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
