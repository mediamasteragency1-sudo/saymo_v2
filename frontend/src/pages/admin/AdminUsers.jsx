import React, { useState, useEffect } from 'react'
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../../api/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminGetUsers()
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (id, role) => {
    try {
      const { data } = await adminUpdateUser(id, { role })
      setUsers((prev) => prev.map((u) => u.id === id ? data : u))
    } catch {}
  }

  const handleToggleActive = async (user) => {
    try {
      const { data } = await adminUpdateUser(user.id, { is_active: !user.is_active })
      setUsers((prev) => prev.map((u) => u.id === user.id ? data : u))
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await adminDeleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {}
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Utilisateurs ({users.length})</h1>

        <input
          className="form-input"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 400, marginBottom: 24 }}
        />

        {loading ? (
          <div className="skeleton" style={{ height: 400, borderRadius: 4 }} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--color-border)' }}>
                  {['Nom', 'Email', 'Rôle', 'Actif', 'Inscription', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '0.5px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-muted)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{ border: '0.5px solid var(--color-border)', borderRadius: 2, padding: '4px 8px', fontSize: 12, fontFamily: 'var(--font-body)' }}
                      >
                        <option value="visitor">Visiteur</option>
                        <option value="user">Utilisateur</option>
                        <option value="host">Hôte</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleToggleActive(u)} className={`tag ${u.is_active ? '' : 'tag-inactive'}`}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn btn-sm"
                        style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
