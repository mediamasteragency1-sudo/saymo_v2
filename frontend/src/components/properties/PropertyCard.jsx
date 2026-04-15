import React from 'react'
import { Link } from 'react-router-dom'
import './PropertyCard.css'

const PROPERTY_TYPE_LABELS = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  studio: 'Studio',
  loft: 'Loft',
  chalet: 'Chalet',
  cabin: 'Cabane',
  beach_house: 'Maison de plage',
  countryside: 'Maison de campagne',
  other: 'Autre',
}

function Stars({ rating }) {
  if (!rating) return <span className="no-rating">Nouveau</span>
  return (
    <span className="rating">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      {rating}
    </span>
  )
}

export default function PropertyCard({ property, score }) {
  const placeholder = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80`

  return (
    <Link to={`/listings/${property.id}`} className="property-card fade-in">
      <div className="property-card-image-wrap">
        <img
          src={property.primary_image || placeholder}
          alt={property.title}
          className="property-card-image"
          loading="lazy"
          onError={(e) => { e.target.src = placeholder }}
        />
        {score && (
          <span className="property-card-score tag tag-highlight">
            {Math.round(score)}% match
          </span>
        )}
      </div>

      <div className="property-card-body">
        <div className="property-card-top">
          <span className="property-card-city">{property.city}</span>
          <Stars rating={property.avg_rating} />
        </div>

        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-meta">
          <span className="tag">{PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}</span>
          <span className="property-card-guests">{property.max_guests} voyageurs</span>
        </div>

        <div className="property-card-footer">
          <span className="price property-card-price">
            {parseFloat(property.price_per_night).toFixed(0)} €
          </span>
          <span className="property-card-night">/ nuit</span>
        </div>
      </div>
    </Link>
  )
}
