import { useState, useEffect } from 'react'
import { adminGetReports, adminResolveReport } from '../../api/admin'
import './AdminReports.css'

const REASON_LABELS = {
  inappropriate: 'Contenu inapproprié',
  fraud:         'Fraude',
  spam:          'Spam',
  inaccurate:    'Informations inexactes',
  other:         'Autre',
}

const TABS = [
  { key: 'pending',  label: 'En attente' },
  { key: 'resolved', label: 'Résolus' },
  { key: 'dismissed', label: 'Ignorés' },
]

export default function AdminReports() {
  const [tab, setTab]         = useState('pending')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [acting, setActing]   = useState(null)
  const [noteMap, setNoteMap] = useState({})

  const load = (s) => {
    setLoading(true)
    adminGetReports(s)
      .then(r => setReports(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab) }, [tab])

  const resolve = async (id, newStatus) => {
    setActing(id)
    try {
      await adminResolveReport(id, { status: newStatus, admin_note: noteMap[id] || '' })
      setReports(prev => prev.filter(r => r.id !== id))
    } catch {}
    setActing(null)
  }

  return (
    <div className="page-content container">
      <div className="admin-reports-header">
        <h1 className="page-title">Signalements</h1>
        <p className="page-subtitle">Gérez les signalements soumis par les utilisateurs</p>
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
      ) : reports.length === 0 ? (
        <div className="admin-empty card">
          Aucun signalement {TABS.find(t => t.key === tab)?.label.toLowerCase()}.
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="card report-card">
              <div className="report-body">
                <div className="report-meta">
                  <span className={`reason-badge reason-${report.reason}`}>
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                  <span className="report-id">#{report.id}</span>
                  <span className="report-date">
                    {new Date(report.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="report-content">
                  <p className="report-from">
                    Signalé par <strong>{report.reporter_name}</strong>
                    {report.property_title && (
                      <> · Logement : <strong>{report.property_title}</strong></>
                    )}
                    {report.review && (
                      <> · Avis #{report.review}</>
                    )}
                  </p>
                  {report.description && (
                    <p className="report-desc">"{report.description}"</p>
                  )}
                </div>

                {tab === 'pending' && (
                  <div className="report-note-wrap">
                    <textarea
                      className="report-note-input"
                      placeholder="Note admin (optionnelle)"
                      value={noteMap[report.id] || ''}
                      onChange={e => setNoteMap(prev => ({ ...prev, [report.id]: e.target.value }))}
                      rows={2}
                    />
                  </div>
                )}

                {report.admin_note && tab !== 'pending' && (
                  <p className="report-admin-note">Note : {report.admin_note}</p>
                )}
              </div>

              {tab === 'pending' && (
                <div className="report-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => resolve(report.id, 'resolved')}
                    disabled={acting === report.id}
                  >
                    Résoudre
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => resolve(report.id, 'dismissed')}
                    disabled={acting === report.id}
                  >
                    Ignorer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
