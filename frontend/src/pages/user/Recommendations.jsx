import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRecommendations } from '../../api/psychology'
import PropertyCard from '../../components/properties/PropertyCard'
import './Recommendations.css'

const PROFILE_DESCRIPTIONS = {
  nature_explorer: { label: 'Explorateur Nature', desc: 'Vous êtes attiré par les grands espaces, les forêts et les montagnes. La nature vous ressource.' },
  urban_luxury: { label: 'Urbain Luxe', desc: 'Vous aimez le confort raffiné, le design soigné et la vie citadine animée.' },
  budget_family: { label: 'Famille Budget', desc: 'Le confort familial passe avant tout, avec un œil sur le rapport qualité-prix.' },
  adventure_seeker: { label: "Chercheur d'Aventures", desc: 'Toujours en mouvement, vous cherchez le défi et l\'inédit à chaque voyage.' },
  cultural_nomad: { label: 'Nomade Culturel', desc: 'Art, histoire, gastronomie — vous voyagez pour vous enrichir et découvrir.' },
  beach_relaxer: { label: 'Détente Plage', desc: 'Le bruit des vagues et le soleil sur la peau définissent votre voyage idéal.' },
  mountain_retreat: { label: 'Retraite Montagne', desc: 'Le chalet au coin du feu, les sommets enneigés — votre refuge préféré.' },
  city_business: { label: 'Business Urbain', desc: 'Vous voyagez efficacement, avec le confort et la connectivité comme priorités.' },
}

export default function Recommendations() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecommendations()
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 120, borderRadius: 4, marginBottom: 32 }} />
        <div className="grid-properties">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 300, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page container recommendations-empty">
        <div className="empty-state">
          <h2>Découvrez votre profil voyageur</h2>
          <p>Passez notre test psychologique pour recevoir des recommandations de logements personnalisées.</p>
          <Link to="/test" className="btn btn-primary">Passer le test</Link>
        </div>
      </div>
    )
  }

  const profile = PROFILE_DESCRIPTIONS[data.profile?.profile_type] || {}
  const recommendations = data.recommendations || []

  return (
    <div className="page fade-in">
      <div className="container">
        {/* Profile banner */}
        <div className="profile-banner">
          <div className="profile-banner-content">
            <span className="tag tag-highlight">Votre profil</span>
            <h1 className="profile-banner-title">{profile.label || data.profile?.profile_type}</h1>
            <p className="profile-banner-desc">{profile.desc}</p>
          </div>
          <div className="profile-banner-actions">
            <Link to="/test" className="btn btn-ghost btn-sm">Refaire le test</Link>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-header">
          <h2 className="recommendations-title">
            {recommendations.length} logement{recommendations.length !== 1 ? 's' : ''} pour vous
          </h2>
          <p className="recommendations-subtitle">Sélectionnés selon votre profil {profile.label}</p>
        </div>

        {recommendations.length === 0 ? (
          <div className="recommendations-empty">
            <p>Aucune recommandation disponible pour le moment.</p>
            <p>De nouveaux logements sont ajoutés régulièrement.</p>
          </div>
        ) : (
          <div className="grid-properties">
            {recommendations.map((rec) => (
              <PropertyCard key={rec.id} property={rec.property} score={rec.score} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
