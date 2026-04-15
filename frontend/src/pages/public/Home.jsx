import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Home.css'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState({ city: '', guests: '', type: '' })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.city) params.set('city', search.city)
    if (search.guests) params.set('guests', search.guests)
    if (search.type) params.set('type', search.type)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&q=80"
          alt="Hero"
          className="hero-image"
        />
        <div className="hero-content container">
          <p className="hero-eyebrow">Réservation de séjours</p>
          <h1 className="hero-title">
            Trouvez le logement<br />
            <em>qui vous ressemble</em>
          </h1>
          <p className="hero-subtitle">
            Un algorithme psychologique unique pour des recommandations personnalisées
          </p>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-field">
              <label className="search-label">Destination</label>
              <input
                className="search-input"
                placeholder="Ville, région..."
                value={search.city}
                onChange={(e) => setSearch({ ...search, city: e.target.value })}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label className="search-label">Voyageurs</label>
              <input
                className="search-input"
                type="number"
                min="1"
                placeholder="2"
                value={search.guests}
                onChange={(e) => setSearch({ ...search, guests: e.target.value })}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label className="search-label">Type</label>
              <select
                className="search-input"
                value={search.type}
                onChange={(e) => setSearch({ ...search, type: e.target.value })}
              >
                <option value="">Tous</option>
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="villa">Villa</option>
                <option value="chalet">Chalet</option>
                <option value="cabin">Cabane</option>
                <option value="beach_house">Maison de plage</option>
              </select>
            </div>
            <button type="submit" className="search-btn btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Innovation section */}
      {!user && (
        <section className="innovation container">
          <div className="innovation-content">
            <span className="tag tag-highlight">Fonctionnalité unique</span>
            <h2 className="innovation-title">Découvrez votre profil voyageur</h2>
            <p className="innovation-text">
              Notre test psychologique analyse votre style de vie, vos préférences et votre personnalité
              pour vous proposer des logements qui vous correspondent vraiment.
            </p>
            <a href="/register" className="btn btn-primary">Commencer le test</a>
          </div>
          <div className="innovation-visual">
            <div className="profile-pill">Nature Explorer</div>
            <div className="profile-pill profile-pill-active">Urban Luxury</div>
            <div className="profile-pill">Beach Relaxer</div>
            <div className="profile-pill">Mountain Retreat</div>
            <div className="profile-pill">Cultural Nomad</div>
            <div className="profile-pill">Budget Family</div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="features container">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">01</div>
            <h3 className="feature-title">Test psychologique</h3>
            <p className="feature-text">10 questions pour cerner votre profil de voyageur et générer des recommandations sur-mesure.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">02</div>
            <h3 className="feature-title">Réservation instantanée</h3>
            <p className="feature-text">Vérification des disponibilités en temps réel, confirmation immédiate par l'hôte.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">03</div>
            <h3 className="feature-title">Avis authentiques</h3>
            <p className="feature-text">Uniquement des avis vérifiés, déposés après un séjour confirmé et terminé.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
