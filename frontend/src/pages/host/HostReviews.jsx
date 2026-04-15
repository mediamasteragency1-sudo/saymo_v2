import React, { useState, useEffect } from 'react'
import { getReviews, replyToReview } from '../../api/reviews'
import { getHostProperties } from '../../api/properties'
import './HostReviews.css'

function Stars({ rating }) {
  return (
    <div className="host-review-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

function ReplyForm({ reviewId, existing, onSaved }) {
  const [open, setOpen]     = useState(false)
  const [text, setText]     = useState(existing || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const { data } = await replyToReview(reviewId, text)
      onSaved(data)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        className={`reply-toggle ${existing ? 'has-reply' : ''}`}
        onClick={() => setOpen(true)}
      >
        {existing ? 'Modifier la réponse' : '+ Répondre'}
      </button>
    )
  }

  return (
    <div className="reply-editor">
      <textarea
        className="form-input reply-textarea"
        rows="3"
        placeholder="Répondez publiquement à cet avis..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="reply-editor-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Annuler</button>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading || !text.trim()}>
          {loading ? 'Enregistrement...' : 'Publier la réponse'}
        </button>
      </div>
    </div>
  )
}

export default function HostReviews() {
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filterProp, setFilterProp] = useState('all')
  const [properties, setProperties] = useState([])

  useEffect(() => {
    getHostProperties().then(({ data }) => {
      setProperties(data)
      // Fetch reviews for all host properties
      return Promise.all(data.map(p => getReviews({ property: p.id })))
    }).then(responses => {
      const all = responses.flatMap(r => r.data)
      setReviews(all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    }).finally(() => setLoading(false))
  }, [])

  const handleReplySaved = (updatedReview) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r))
  }

  const filtered = filterProp === 'all'
    ? reviews
    : reviews.filter(r => r.property === parseInt(filterProp))

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0,
  }))

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Avis reçus</h1>

        {/* Stats header */}
        {reviews.length > 0 && (
          <div className="reviews-stats card">
            <div className="reviews-stats-score">
              <span className="reviews-big-score">{avgRating}</span>
              <div>
                <Stars rating={Math.round(parseFloat(avgRating))} />
                <p className="reviews-count-label">{reviews.length} avis au total</p>
              </div>
            </div>
            <div className="reviews-distribution">
              {ratingDist.map(({ star, count, pct }) => (
                <div key={star} className="dist-row">
                  <span className="dist-star">{star}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#0A0A0A' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dist-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        {properties.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              className={`filter-btn ${filterProp === 'all' ? 'active' : ''}`}
              onClick={() => setFilterProp('all')}
            >
              Tous
            </button>
            {properties.map(p => (
              <button
                key={p.id}
                className={`filter-btn ${filterProp === String(p.id) ? 'active' : ''}`}
                onClick={() => setFilterProp(String(p.id))}
              >
                {p.title.length > 28 ? p.title.slice(0, 28) + '…' : p.title}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 4 }} />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Aucun avis pour le moment.</p>
            <p style={{ fontSize: 13 }}>Les avis apparaissent après chaque séjour terminé.</p>
          </div>
        ) : (
          <div className="host-reviews-list">
            {filtered.map(r => (
              <div key={r.id} className="host-review-card card">
                <div className="host-review-header">
                  <div className="host-review-user">
                    <div className="host-review-avatar">
                      {r.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="host-review-name">{r.user_name}</p>
                      <p className="host-review-property">{r.property_title}</p>
                    </div>
                  </div>
                  <div className="host-review-meta">
                    <Stars rating={r.rating} />
                    <p className="host-review-date">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <p className="host-review-comment">{r.comment}</p>

                {/* Existing reply */}
                {r.host_reply && (
                  <div className="host-review-reply">
                    <p className="host-review-reply-label">Votre réponse</p>
                    <p className="host-review-reply-text">{r.host_reply}</p>
                  </div>
                )}

                {/* Reply form */}
                <div className="host-review-reply-section">
                  <ReplyForm
                    reviewId={r.id}
                    existing={r.host_reply}
                    onSaved={handleReplySaved}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
