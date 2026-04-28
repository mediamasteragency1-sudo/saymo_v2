import { useState, useEffect } from 'react'
import { adminGetReviews, adminDeleteReview } from '../../api/admin'

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, color: '#F59E0B' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetReviews()
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return
    setDeleting(id)
    try {
      await adminDeleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch {}
    setDeleting(null)
  }

  const filtered = reviews.filter(r =>
    !search ||
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.property_title?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Avis</h1>
        <p className="page-subtitle">Modérez les avis laissés par les voyageurs</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ maxWidth: 360 }}
          placeholder="Rechercher par utilisateur, logement…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty card">Aucun avis trouvé.</div>
      ) : (
        <div className="reports-list">
          {filtered.map(r => (
            <div key={r.id} className="card report-card">
              <div className="report-body">
                <div className="report-meta">
                  <Stars rating={r.rating} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user_name}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>→</span>
                  <span style={{ fontSize: 13 }}>{r.property_title}</span>
                  <span className="report-date">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="report-desc">"{r.comment}"</p>
                {r.host_reply && (
                  <p className="report-admin-note">Réponse hôte : {r.host_reply}</p>
                )}
              </div>
              <div className="report-actions">
                <button
                  className="btn btn-sm"
                  style={{ background: '#FEF2F2', color: '#991B1B', border: '0.5px solid #FECACA' }}
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                >
                  {deleting === r.id ? '…' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
