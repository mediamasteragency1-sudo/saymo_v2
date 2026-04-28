import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Home.css'

/* ── Hooks ─────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const triggered = useRef(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true
        const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''))
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(ease * numeric))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return { ref, count }
}

/* ── Data ──────────────────────────────────────────────── */
const DESTINATIONS = [
  { city: 'Paris',     img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',  span: 'large' },
  { city: 'Nice',      img: 'https://images.unsplash.com/photo-1533614767099-d4b1fe2f4bff?w=600&q=80',  span: 'small' },
  { city: 'Bordeaux',  img: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80',    span: 'small' },
  { city: 'Lyon',      img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',    span: 'small' },
  { city: 'Marseille', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',    span: 'small' },
  { city: 'Chamonix',  img: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?w=600&q=80', span: 'small' },
]

const STEPS = [
  { n: '01', title: 'Créez votre profil',          text: 'Inscrivez-vous et répondez à notre test psychologique de 10 questions pour que nous puissions vous connaître.' },
  { n: '02', title: 'Recevez vos recommandations', text: 'Notre algorithme sélectionne les logements qui correspondent à votre personnalité de voyageur.' },
  { n: '03', title: 'Réservez & profitez',         text: 'Réservez en temps réel, échangez avec votre hôte et vivez un séjour taillé pour vous.' },
]

const STATS = [
  { raw: 500,  display: '500+',   suffix: '+', label: 'Logements' },
  { raw: 2000, display: '2 000+', suffix: '+', label: 'Voyageurs' },
  { raw: 98,   display: '98 %',   suffix: ' %', label: 'Satisfaction' },
  { raw: 12,   display: '12',     suffix: '',  label: 'Villes' },
]

/* ── Sub-components ────────────────────────────────────── */
function StatItem({ stat, isLast }) {
  const { ref, count } = useCountUp(stat.raw)
  return (
    <>
      <div ref={ref} className="stat-item">
        <span className="stat-value">{count.toLocaleString('fr-FR')}{stat.suffix}</span>
        <span className="stat-label">{stat.label}</span>
      </div>
      {!isLast && <div className="stats-sep" />}
    </>
  )
}

function StepCard({ step, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="step-card card reveal-up" style={{ '--delay': `${delay}ms` }}>
      <span className="step-n">{step.n}</span>
      <h3 className="step-title">{step.title}</h3>
      <p className="step-text">{step.text}</p>
    </div>
  )
}

function DestCard({ d, delay }) {
  const ref = useReveal()
  return (
    <Link
      ref={ref}
      to={`/listings?city=${d.city}`}
      className={`dest-card reveal-scale ${d.span === 'large' ? 'dest-card--large' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <img src={d.img} alt={d.city} className="dest-img"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' }} />
      <div className="dest-overlay" />
      <span className="dest-name">{d.city}</span>
    </Link>
  )
}

/* ── Page ──────────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState({ city: '', guests: '', type: '' })

  const destHeadRef  = useReveal()
  const hiwHeadRef   = useReveal()
  const profilRef    = useReveal()
  const profilPills  = useReveal()
  const ctaRef       = useReveal()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.city)   params.set('city', search.city)
    if (search.guests) params.set('guests', search.guests)
    if (search.type)   params.set('type', search.type)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-overlay" />
        <img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&q=80" alt="Hero" className="hero-image" />
        <div className="hero-content container">
          <p className="hero-eyebrow hero-anim-1">Réservation de séjours</p>
          <h1 className="hero-title hero-anim-2">
            Trouvez le logement<br /><em>qui vous ressemble</em>
          </h1>
          <p className="hero-subtitle hero-anim-3">
            Un algorithme psychologique unique pour des recommandations personnalisées
          </p>
          <form className="search-bar hero-anim-4" onSubmit={handleSearch}>
            <div className="search-field">
              <label className="search-label">Destination</label>
              <input className="search-input" placeholder="Ville, région..."
                value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label className="search-label">Voyageurs</label>
              <input className="search-input" type="number" min="1" placeholder="2"
                value={search.guests} onChange={e => setSearch({ ...search, guests: e.target.value })} />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <label className="search-label">Type</label>
              <select className="search-input" value={search.type} onChange={e => setSearch({ ...search, type: e.target.value })}>
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

      {/* ── Stats ── */}
      <div className="stats-strip">
        <div className="stats-inner container">
          {STATS.map((s, i) => (
            <StatItem key={s.label} stat={s} isLast={i === STATS.length - 1} />
          ))}
        </div>
      </div>

      {/* ── Destinations ── */}
      <section className="section container">
        <div ref={destHeadRef} className="section-header reveal-up">
          <div>
            <p className="section-eyebrow">Explorer</p>
            <h2 className="section-title">Destinations populaires</h2>
          </div>
          <Link to="/listings" className="btn btn-ghost btn-sm">Voir tout →</Link>
        </div>
        <div className="dest-grid">
          {DESTINATIONS.map((d, i) => (
            <DestCard key={d.city} d={d} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="hiw-section">
        <div className="container">
          <div ref={hiwHeadRef} className="section-header centered reveal-up">
            <p className="section-eyebrow">Simple & rapide</p>
            <h2 className="section-title">Comment ça marche</h2>
          </div>
          <div className="steps-row">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className="step-arrow">→</div>}
                <StepCard step={s} delay={i * 150} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Profil voyageur ── */}
      {!user && (
        <section className="section container">
          <div className="profil-block">
            <div ref={profilRef} className="profil-text reveal-left">
              <span className="tag tag-highlight">Fonctionnalité unique</span>
              <h2 className="profil-title">Découvrez votre profil voyageur</h2>
              <p className="profil-desc">
                Notre test psychologique analyse votre style de vie, vos préférences et votre personnalité
                pour vous proposer des logements qui vous correspondent vraiment.
              </p>
              <Link to="/register" className="btn btn-primary">Commencer le test</Link>
            </div>
            <div ref={profilPills} className="profil-pills reveal-right">
              {['Nature Explorer', 'Urban Luxury', 'Beach Relaxer', 'Mountain Retreat', 'Cultural Nomad', 'Budget Family'].map((p, i) => (
                <span key={p} className={`profil-pill ${i === 1 ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA hôte ── */}
      <section className="cta-host">
        <div ref={ctaRef} className="cta-host-inner container reveal-up">
          <div>
            <h2 className="cta-host-title">Vous avez un logement à louer ?</h2>
            <p className="cta-host-sub">Rejoignez notre communauté d'hôtes et générez des revenus dès aujourd'hui.</p>
          </div>
          <Link to={user ? '/host/dashboard' : '/register'} className="btn cta-host-btn">
            Devenir hôte
          </Link>
        </div>
      </section>

    </div>
  )
}
