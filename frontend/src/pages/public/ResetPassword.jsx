import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/auth'
import './Auth.css'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(uid, token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">SAYMO</Link>
          <p className="auth-tagline">Trouvez le logement qui vous ressemble</p>
        </div>

        <div className="auth-card card">
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <h1 className="auth-title">Mot de passe mis à jour</h1>
              <p className="auth-subtitle" style={{ marginTop: 8 }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Nouveau mot de passe</h1>
              <p className="auth-subtitle">Choisissez un mot de passe d'au moins 8 caractères.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Réinitialiser'}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login">← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
          alt="Beautiful property"
        />
        <div className="auth-visual-overlay" />
      </div>
    </div>
  )
}
