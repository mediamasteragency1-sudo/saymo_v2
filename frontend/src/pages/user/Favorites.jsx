import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, removeFavorite } from '../../api/favorites'
import PropertyCard from '../../components/properties/PropertyCard'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavorites(data))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id) => {
    await removeFavorite(id)
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="page fade-in">
      <div className="container">
        <h1 className="page-title">Mes favoris</h1>

        {loading ? (
          <div className="grid-properties">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 300, borderRadius: 4 }} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            <p style={{ marginBottom: 16 }}>Vous n'avez pas encore de favoris.</p>
            <Link to="/listings" className="btn btn-ghost">Explorer les logements</Link>
          </div>
        ) : (
          <div className="grid-properties">
            {favorites.map((fav) => (
              <div key={fav.id} style={{ position: 'relative' }}>
                <PropertyCard property={fav.property} />
                <button
                  onClick={() => handleRemove(fav.id)}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'white', border: '0.5px solid var(--color-border)',
                    borderRadius: '50%', width: 32, height: 32,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: 'var(--color-muted)',
                    transition: 'all var(--transition)',
                  }}
                  title="Retirer des favoris"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
