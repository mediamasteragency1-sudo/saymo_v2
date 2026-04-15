import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProperty, updateProperty, getProperty, getAmenities, uploadImage } from '../../api/properties'
import './HostPropertyForm.css'

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'cabin', label: 'Cabane' },
  { value: 'beach_house', label: 'Maison de plage' },
  { value: 'countryside', label: 'Maison de campagne' },
]

export default function HostPropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    title: '', description: '', price_per_night: '', city: '', address: '',
    property_type: 'apartment', max_guests: 2, num_bedrooms: 1, num_bathrooms: 1,
    amenity_ids: [],
  })
  const [amenities, setAmenities] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getAmenities().then(({ data }) => setAmenities(data))
    if (isEdit) {
      getProperty(id).then(({ data }) => {
        setForm({
          title: data.title,
          description: data.description,
          price_per_night: data.price_per_night,
          city: data.city,
          address: data.address,
          property_type: data.property_type,
          max_guests: data.max_guests,
          num_bedrooms: data.num_bedrooms,
          num_bathrooms: data.num_bathrooms,
          amenity_ids: data.amenities?.map((a) => a.id) || [],
        })
      })
    }
  }, [id, isEdit])

  const toggleAmenity = (amenityId) => {
    setForm((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter((id) => id !== amenityId)
        : [...prev.amenity_ids, amenityId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      let property
      if (isEdit) {
        const { data } = await updateProperty(id, form)
        property = data
      } else {
        const { data } = await createProperty(form)
        property = data
        // Upload images
        for (const img of images) {
          const fd = new FormData()
          fd.append('image', img.file)
          fd.append('is_primary', img.isPrimary ? 'true' : 'false')
          await uploadImage(property.id, fd)
        }
      }
      navigate(`/host/properties`)
    } catch (err) {
      setErrors(err.response?.data || {})
    } finally {
      setLoading(false)
    }
  }

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files)
    const newImgs = files.map((f, i) => ({
      file: f,
      preview: URL.createObjectURL(f),
      isPrimary: images.length === 0 && i === 0,
    }))
    setImages((prev) => [...prev, ...newImgs])
  }

  const getError = (field) => errors[field]?.[0] || errors[field] || ''

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="form-page-header">
          <h1>{isEdit ? 'Modifier le logement' : 'Nouveau logement'}</h1>
          <button onClick={() => navigate('/host/properties')} className="btn btn-ghost btn-sm">← Retour</button>
        </div>

        <form onSubmit={handleSubmit} className="property-form-grid">
          <div className="form-main">
            {/* Basic info */}
            <div className="form-section card">
              <h2 className="form-section-title">Informations générales</h2>

              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input
                  className="form-input"
                  placeholder="Belle villa avec piscine à Nice"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                {getError('title') && <p className="form-error">{getError('title')}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  rows="6"
                  placeholder="Décrivez votre logement en détail..."
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input"
                    value={form.property_type}
                    onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prix / nuit (€) *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    required
                    placeholder="85"
                    value={form.price_per_night}
                    onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max. voyageurs</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={form.max_guests}
                    onChange={(e) => setForm({ ...form, max_guests: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Chambres</label>
                  <input
                    type="number" className="form-input" min="0"
                    value={form.num_bedrooms}
                    onChange={(e) => setForm({ ...form, num_bedrooms: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salles de bain</label>
                  <input
                    type="number" className="form-input" min="1"
                    value={form.num_bathrooms}
                    onChange={(e) => setForm({ ...form, num_bathrooms: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-section card">
              <h2 className="form-section-title">Localisation</h2>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Ville *</label>
                  <input
                    className="form-input" placeholder="Paris" required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse *</label>
                  <input
                    className="form-input" placeholder="12 rue de la Paix" required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="form-section card">
                <h2 className="form-section-title">Équipements</h2>
                <div className="amenities-select">
                  {amenities.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      className={`amenity-toggle ${form.amenity_ids.includes(a.id) ? 'selected' : ''}`}
                      onClick={() => toggleAmenity(a.id)}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Images (new only) */}
            {!isEdit && (
              <div className="form-section card">
                <h2 className="form-section-title">Photos</h2>
                <label className="image-upload-zone">
                  <input type="file" accept="image/*" multiple onChange={handleImageAdd} hidden />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p>Cliquez ou déposez vos photos ici</p>
                </label>

                {images.length > 0 && (
                  <div className="uploaded-images">
                    {images.map((img, i) => (
                      <div key={i} className="uploaded-image">
                        <img src={img.preview} alt="" />
                        {img.isPrimary && <span className="primary-badge">Principale</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar submit */}
          <div className="form-sidebar">
            <div className="form-submit-card card">
              <h3>Publier</h3>
              <p>Votre logement sera visible dès validation.</p>
              {getError('non_field_errors') && <p className="form-error">{getError('non_field_errors')}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Enregistrement...' : (isEdit ? 'Sauvegarder' : 'Publier le logement')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%' }}
                onClick={() => navigate('/host/properties')}
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
