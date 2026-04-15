import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirm: '', role: 'user'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const { data } = await register(form)
      loginUser(data.user, { access: data.access, refresh: data.refresh })
      navigate('/test') // Always take the test after registration
    } catch (err) {
      setErrors(err.response?.data || {})
    } finally {
      setLoading(false)
    }
  }

  const getError = (field) => errors[field]?.[0] || errors[field] || ''

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">SAYMO</Link>
          <p className="auth-tagline">Rejoignez la communauté SAYMO</p>
        </div>

        <div className="auth-card card">
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-subtitle">Commencez votre aventure</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                className="form-input"
                placeholder="Marie Dupont"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {getError('name') && <p className="form-error">{getError('name')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="marie@exemple.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {getError('email') && <p className="form-error">{getError('email')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="8 caractères minimum"
                required
                minLength="8"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {getError('password') && <p className="form-error">{getError('password')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
              />
              {getError('password_confirm') && <p className="form-error">{getError('password_confirm')}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Vous êtes</label>
              <select
                className="form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">Voyageur</option>
                <option value="host">Hôte (je propose un logement)</option>
              </select>
            </div>

            {getError('non_field_errors') && (
              <p className="form-error">{getError('non_field_errors')}</p>
            )}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="auth-switch">
            Déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80"
          alt="Beautiful property"
        />
        <div className="auth-visual-overlay">
          <blockquote className="auth-quote">
            "Chaque voyage commence<br />
            par un premier pas."
          </blockquote>
        </div>
      </div>
    </div>
  )
}
