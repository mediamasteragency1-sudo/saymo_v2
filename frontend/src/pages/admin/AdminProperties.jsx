import { useState, useEffect } from 'react'
import { adminGetProperties, adminModerateProperty, adminDeleteProperty } from '../../api/admin'
import './AdminProperties.css'

const TABS = [
  { key: 'pending',  label: 'En attente' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Rejetés' },
]

const MOD_LABELS = {
  pending:  { label: 'En attente', cls: 'mod-pending' },
  approved: { label: 'Approuvé',   cls: 'mod-approved' },
  rejected: { label: 'Rejeté',     cls: 'mod-rejected' },
}

export default function AdminProperties() {
  const [tab, setTab]             = useState('pending')
  const [properties, setProperties] = useState([])
  const [loading, setLoading]     = useState(false)
  const [acting, setActing]       = useState(null)

  const load = (status) => {
    setLoading(true)
    adminGetProperties({ moderation_status: status })
      .then(r => setProperties(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab) }, [tab])

  const moderate = async (id, newStatus) => {
    setActing(id)
    try {
      await adminModerateProperty(id, { moderation_status: newStatus })
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch {}
    setActing(null)
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce logement définitivement ?')) return
    setActing(id)
    try {
      await adminDeleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch {}
    setActing(null)
  }

  return (
    <div className="page-content container">
      <div className="admin-props-header">
        <h1 className="page-title">Modération des logements</h1>
        <p className="page-subtitle">Approuver ou rejeter les logements soumis par les hôtes</p>
      </div>

      <div className="mod-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`mod-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">Chargement...</div>
      ) : properties.length === 0 ? (
        <div className="admin-empty card">
          Aucun logement {TABS.find(t => t.key === tab)?.label.toLowerCase()}.
        </div>
      ) : (
        <div className="mod-props-list">
          {properties.map(prop => (
            <div key={prop.id} className="card mod-prop-card">
              <div className="mod-prop-img-wrap">
                {prop.primary_image ? (
                  <img
                    src={prop.primary_image.image}
                    alt={prop.title}
                    className="mod-prop-img"
                  />
                ) : (
                  <div className="mod-prop-img-placeholder">
                    <span>Photo manquante</span>
                  </div>
                )}
              </div>

              <div className="mod-prop-body">
                <div className="mod-prop-meta-top">
                  <span className={`mod-badge ${MOD_LABELS[prop.moderation_status]?.cls}`}>
                    {MOD_LABELS[prop.moderation_status]?.label}
                  </span>
                  <span className="mod-prop-id">#{prop.id}</span>
                </div>
                <h3 className="mod-prop-title">{prop.title}</h3>
                <p className="mod-prop-location">{prop.city}</p>
                <p className="mod-prop-host">
                  Hôte : <strong>{prop.host_name || '—'}</strong>
                </p>
                <p className="mod-prop-price">{prop.price_per_night} €/nuit</p>
                {prop.description && (
                  <p className="mod-prop-desc">{prop.description.slice(0, 160)}…</p>
                )}
              </div>

              <div className="mod-prop-actions">
                {tab === 'pending' && (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => moderate(prop.id, 'approved')}
                      disabled={acting === prop.id}
                    >
                      Approuver
                    </button>
                    <button
                      className="btn btn-outline btn-sm mod-reject-btn"
                      onClick={() => moderate(prop.id, 'rejected')}
                      disabled={acting === prop.id}
                    >
                      Rejeter
                    </button>
                  </>
                )}
                {tab === 'rejected' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => moderate(prop.id, 'approved')}
                    disabled={acting === prop.id}
                  >
                    Réapprouver
                  </button>
                )}
                {tab === 'approved' && (
                  <button
                    className="btn btn-outline btn-sm mod-reject-btn"
                    onClick={() => moderate(prop.id, 'rejected')}
                    disabled={acting === prop.id}
                  >
                    Suspendre
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm mod-delete-btn"
                  onClick={() => remove(prop.id)}
                  disabled={acting === prop.id}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
