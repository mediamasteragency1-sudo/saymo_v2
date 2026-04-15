import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await login(form)
      loginUser(data.user, { access: data.access, refresh: data.refresh })
      if (data.should_take_test) {
        navigate('/test')
      } else {
        navigate(from)
      }
    } catch (err) {
      const data = err.response?.data
      setError(
        typeof data === 'string' ? data :
        Object.values(data || {}).flat().join(' ') || 'Identifiants incorrects.'
      )
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
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-subtitle">Bienvenue à nouveau</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="vous@exemple.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
          alt="Beautiful property"
        />
        <div className="auth-visual-overlay">
          <blockquote className="auth-quote">
            "Le voyage, c'est la seule chose qu'on achète<br />
            qui nous rend plus riche."
          </blockquote>
        </div>
      </div>
    </div>
  )
}
