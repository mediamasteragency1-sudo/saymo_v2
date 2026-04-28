import { useState, useEffect } from 'react'
import { getHostBookings, updateBookingStatus } from '../../api/bookings'

const STATUS_LABELS = {
  pending: { label: 'En attente', class: 'status-pending' },
  confirmed: { label: 'Confirmé', class: 'status-confirmed' },
  cancelled: { label: 'Annulé', class: 'status-cancelled' },
  completed: { label: 'Terminé', class: 'status-completed' },
}

export default function HostBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getHostBookings()
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id, status) => {
    try {
      const { data } = await updateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => b.id === id ? data : b))
    } catch {}
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Réservations reçues</h1>

        <div className="bookings-filters" style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ padding: '8px 18px', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', border: '0.5px solid var(--color-border)', borderRadius: 2, background: filter === f ? 'var(--color-primary)' : 'white', color: filter === f ? 'white' : 'var(--color-muted)', cursor: 'pointer' }}
            >
              {f === 'all' ? 'Toutes' : STATUS_LABELS[f]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 4 }} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
            Aucune réservation.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((b) => {
              const status = STATUS_LABELS[b.status] || { label: b.status, class: '' }
              return (
                <div key={b.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, padding: 20, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{b.user_name}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{b.user_email}</span>
                      <span className={`booking-status ${status.class}`}>{status.label}</span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{b.property?.title} — {b.property?.city}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                      {new Date(b.start_date).toLocaleDateString('fr-FR')} → {new Date(b.end_date).toLocaleDateString('fr-FR')}
                      {' '}({b.nights} nuit{b.nights > 1 ? 's' : ''}) · {b.guests} voyageur{b.guests > 1 ? 's' : ''}
                    </p>
                    {b.message && <p style={{ fontSize: 12, color: 'var(--color-muted)', fontStyle: 'italic', marginTop: 4 }}>"{b.message}"</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className="price" style={{ fontSize: 20 }}>{parseFloat(b.total_price).toFixed(0)} €</span>
                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {b.stripe_payment_intent_id ? (
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px', background: '#FFF8E7', color: '#92400E', border: '0.5px solid #F0D060', borderRadius: 2 }}>
                            Paiement en attente
                          </span>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatus(b.id, 'confirmed')}>
                            Confirmer
                          </button>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                          onClick={() => handleStatus(b.id, 'cancelled')}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
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
