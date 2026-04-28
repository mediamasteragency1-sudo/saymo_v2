import { useState, useEffect } from 'react'
import { adminGetBookings, adminDeleteBooking } from '../../api/admin'

const STATUS_LABELS = {
  pending:   { label: 'En attente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmée',   color: '#10b981' },
  cancelled: { label: 'Annulée',     color: '#ef4444' },
  completed: { label: 'Terminée',    color: '#6b7280' },
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    adminGetBookings()
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réservation définitivement ?')) return
    setDeleting(id)
    try {
      await adminDeleteBooking(id)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch {}
    setDeleting(null)
  }

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase()
    return (
      b.user_name?.toLowerCase().includes(q) ||
      b.user_email?.toLowerCase().includes(q) ||
      b.property?.title?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Réservations ({bookings.length})</h1>

        <input
          className="form-input"
          placeholder="Rechercher par locataire, email ou logement..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 440, marginBottom: 24 }}
        />

        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 4 }} />
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--color-muted)' }}>Aucune réservation trouvée.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--color-border)' }}>
                  {['#', 'Locataire', 'Logement', 'Dates', 'Nuits', 'Voyageurs', 'Total', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const status = STATUS_LABELS[b.status] ?? { label: b.status, color: '#6b7280' }
                  return (
                    <tr key={b.id} style={{ borderBottom: '0.5px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px', color: 'var(--color-muted)' }}>#{b.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{b.user_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{b.user_email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.property?.title ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{b.property?.city}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(b.start_date).toLocaleDateString('fr-FR')} → {new Date(b.end_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{b.nights}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{b.guests}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{b.total_price} €</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                          background: status.color + '1a',
                          color: status.color,
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                          onClick={() => handleDelete(b.id)}
                          disabled={deleting === b.id}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
