import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHostProperties, deleteProperty, updateProperty } from '../../api/properties'

const MOD_BADGE = {
  pending:  { label: 'En attente de validation', style: { background: '#FFF8E7', color: '#92400E', border: '0.5px solid #F0D060' } },
  approved: null,
  rejected: { label: 'Rejeté par l\'admin', style: { background: '#FEF2F2', color: '#991B1B', border: '0.5px solid #FECACA' } },
}

export default function HostProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHostProperties()
      .then(({ data }) => setProperties(data))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (property) => {
    try {
      const { data } = await updateProperty(property.id, { is_active: !property.is_active })
      setProperties((prev) => prev.map((p) => p.id === property.id ? { ...p, is_active: data.is_active } : p))
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce logement ?')) return
    try {
      await deleteProperty(id)
      setProperties((prev) => prev.filter((p) => p.id !== id))
    } catch {}
  }

  const placeholder = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=80'

  return (
    <div className="page fade-in">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Mes logements</h1>
          <Link to="/host/properties/new" className="btn btn-primary">+ Nouveau</Link>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 4 }} />
        ) : properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            <p style={{ marginBottom: 16 }}>Aucun logement publié.</p>
            <Link to="/host/properties/new" className="btn btn-primary">Créer mon premier logement</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {properties.map((p) => (
              <div key={p.id} className="card" style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 20, alignItems: 'center', padding: 16 }}>
                <img
                  src={p.primary_image || placeholder}
                  alt={p.title}
                  onError={(e) => { e.target.src = placeholder }}
                  style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.city}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="price" style={{ fontSize: 15 }}>{parseFloat(p.price_per_night).toFixed(0)} €/nuit</span>
                    <span className="tag">{p.max_guests} voyageurs</span>
                    <span className={`tag ${p.is_active ? '' : 'tag-inactive'}`}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {MOD_BADGE[p.moderation_status] && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', padding: '2px 8px', borderRadius: 100,
                        ...MOD_BADGE[p.moderation_status].style
                      }}>
                        {MOD_BADGE[p.moderation_status].label}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleToggle(p)} className="btn btn-muted btn-sm">
                    {p.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <Link to={`/host/properties/${p.id}/availability`} className="btn btn-ghost btn-sm">Disponibilités</Link>
                  <Link to={`/host/properties/${p.id}/edit`} className="btn btn-ghost btn-sm">Modifier</Link>
                  <button onClick={() => handleDelete(p.id)} className="btn btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
