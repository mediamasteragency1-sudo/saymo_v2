import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateMe } from '../../api/auth'
import './Profile.css'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user.name })
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(user.avatar_url)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')

    const formData = new FormData()
    formData.append('name', form.name)
    if (avatar) formData.append('avatar', avatar)

    try {
      const { data } = await updateMe(formData)
      updateUser(data)
      setSuccess(true)
    } catch (err) {
      setError('Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  const ROLE_LABELS = { user: 'Voyageur', host: 'Hôte', admin: 'Administrateur', visitor: 'Visiteur' }

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrap">
                {preview ? (
                  <img src={preview} alt={user.name} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="avatar-upload-btn" title="Changer la photo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              </div>
              <h2 className="profile-name">{user.name}</h2>
              <span className="tag">{ROLE_LABELS[user.role] || user.role}</span>
            </div>

            <div className="profile-info-card card">
              <div className="info-row">
                <span className="info-label">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Membre depuis</span>
                <span>{new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="profile-form-section">
            <h1 style={{ fontSize: 28, marginBottom: 32 }}>Mon profil</h1>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Nom complet</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} />
                <p className="form-error" style={{ color: 'var(--color-muted)' }}>L'email ne peut pas être modifié</p>
              </div>

              {success && (
                <p style={{ color: 'var(--color-success)', fontSize: 14 }}>
                  Profil mis à jour avec succès.
                </p>
              )}
              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
