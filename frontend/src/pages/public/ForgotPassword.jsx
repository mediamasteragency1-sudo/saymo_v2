import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
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
          {sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <h1 className="auth-title">E-mail envoyé</h1>
                <p className="auth-subtitle" style={{ marginTop: 8 }}>
                  Si <strong>{email}</strong> est associé à un compte, vous recevrez un lien de réinitialisation.
                </p>
              </div>
              <Link to="/login" className="btn btn-primary auth-submit" style={{ textAlign: 'center', display: 'block' }}>
                Retour à la connexion
              </Link>
            </>
          ) : (
            <>
              <h1 className="auth-title">Mot de passe oublié ?</h1>
              <p className="auth-subtitle">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Adresse e-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="vous@exemple.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
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
