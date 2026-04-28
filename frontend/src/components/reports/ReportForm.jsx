import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createReport } from '../../api/reports'
import './ReportForm.css'

const REASONS = [
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'fraud',         label: 'Fraude' },
  { value: 'spam',          label: 'Spam' },
  { value: 'inaccurate',   label: 'Informations inexactes' },
  { value: 'other',        label: 'Autre' },
]

export default function ReportForm({ propertyId, reviewId, onClose }) {
  const [reason, setReason]       = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) { setError('Choisissez un motif.'); return }
    setLoading(true)
    setError('')
    try {
      await createReport({
        ...(propertyId ? { property: propertyId } : {}),
        ...(reviewId   ? { review: reviewId }     : {}),
        reason,
        description,
      })
      setSuccess(true)
    } catch (err) {
      const d = err.response?.data
      setError(
        typeof d === 'string' ? d :
        Object.values(d || {}).flat().join(' ') || 'Erreur lors du signalement.'
      )
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="report-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2 className="report-modal-title">Signaler</h2>
          <button className="report-modal-close" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="report-success">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p>Signalement envoyé. Notre équipe va examiner ce contenu.</p>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Motif du signalement *</label>
              <div className="report-reasons">
                {REASONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`report-reason-btn ${reason === r.value ? 'active' : ''}`}
                    onClick={() => setReason(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Détails (optionnel)</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Décrivez le problème..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="report-form-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !reason}>
                {loading ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
