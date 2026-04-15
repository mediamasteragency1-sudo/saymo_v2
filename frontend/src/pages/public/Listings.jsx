import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropertyCard from '../../components/properties/PropertyCard'
import { getProperties } from '../../api/properties'
import './Listings.css'

const PROPERTY_TYPES = [
  { value: '', label: 'Tous' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
  { value: 'chalet', label: 'Chalet' },
  { value: 'cabin', label: 'Cabane' },
  { value: 'beach_house', label: 'Maison de plage' },
]

const TODAY = new Date().toISOString().split('T')[0]

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  )
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  const [filters, setFilters] = useState({
    city:       searchParams.get('city')       || '',
    type:       searchParams.get('type')       || '',
    guests:     searchParams.get('guests')     || '',
    min_price:  searchParams.get('min_price')  || '',
    max_price:  searchParams.get('max_price')  || '',
    search:     searchParams.get('search')     || '',
    start_date: searchParams.get('start_date') || '',
    end_date:   searchParams.get('end_date')   || '',
  })

  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  useEffect(() => {
    fetchProperties()
  }, [searchParams])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = {}
      searchParams.forEach((value, key) => { if (value) params[key] = value })
      const { data } = await getProperties(params)
      if (Array.isArray(data)) {
        setProperties(data)
        setTotalCount(data.length)
        setHasNext(false)
        setHasPrev(false)
      } else {
        setProperties(data.results || [])
        setTotalCount(data.count || 0)
        setHasNext(!!data.next)
        setHasPrev(!!data.previous)
      }
    } catch {
      setProperties([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (e) => {
    e.preventDefault()
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params) // resets page to 1
  }

  const resetFilters = () => {
    setFilters({
      city: '', type: '', guests: '', min_price: '', max_price: '',
      search: '', start_date: '', end_date: '',
    })
    setSearchParams({})
  }

  const goToPage = (p) => {
    const params = {}
    searchParams.forEach((value, key) => { if (value) params[key] = value })
    params.page = p
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(totalCount / 12)

  return (
    <div className="listings-page page">
      <div className="container">
        <div className="listings-layout">
          {/* Sidebar filters */}
          <aside className="listings-sidebar">
            <form onSubmit={applyFilters}>
              <div className="sidebar-section">
                <h3 className="sidebar-title">Filtres</h3>

                <div className="form-group">
                  <label className="form-label">Recherche</label>
                  <input
                    className="form-input"
                    placeholder="Titre, ville..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ville</label>
                  <input
                    className="form-input"
                    placeholder="Paris, Lyon..."
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>

                {/* Date availability filters */}
                <div className="form-group">
                  <label className="form-label">Arrivée</label>
                  <input
                    type="date"
                    className="form-input"
                    min={TODAY}
                    value={filters.start_date}
                    onChange={(e) => setFilters({
                      ...filters,
                      start_date: e.target.value,
                      end_date: filters.end_date && filters.end_date <= e.target.value ? '' : filters.end_date,
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Départ</label>
                  <input
                    type="date"
                    className="form-input"
                    min={filters.start_date || TODAY}
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                    disabled={!filters.start_date}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type de logement</label>
                  <select
                    className="form-input"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Voyageurs min.</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={filters.guests}
                    onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
                  />
                </div>

                <div className="price-range">
                  <div className="form-group">
                    <label className="form-label">Prix min. (€/nuit)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={filters.min_price}
                      onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix max.</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="500"
                      value={filters.max_price}
                      onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sidebar-actions">
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Appliquer
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={resetFilters}>
                    Réinitialiser
                  </button>
                </div>
              </div>
            </form>
          </aside>

          {/* Results */}
          <main className="listings-main">
            <div className="listings-header">
              <h1 className="listings-title">
                {loading
                  ? 'Recherche...'
                  : `${totalCount} logement${totalCount !== 1 ? 's' : ''}`}
              </h1>
              {searchParams.get('city') && (
                <p className="listings-subtitle">à {searchParams.get('city')}</p>
              )}
              {(searchParams.get('start_date') && searchParams.get('end_date')) && (
                <p className="listings-subtitle">
                  disponibles du {searchParams.get('start_date')} au {searchParams.get('end_date')}
                </p>
              )}
            </div>

            {loading ? (
              <div className="grid-properties">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="listings-empty">
                <p>Aucun logement trouvé avec ces critères.</p>
                <button className="btn btn-ghost" onClick={resetFilters}>
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid-properties">
                  {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="listings-pagination">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={!hasPrev}
                    >
                      ← Précédent
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
