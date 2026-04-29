import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './About.css'

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

const VALUES = [
  {
    n: '01',
    title: 'Authenticité',
    text: 'Chaque logement est vérifié, chaque avis est réel. Nous ne faisons aucun compromis sur la transparence.',
  },
  {
    n: '02',
    title: 'Personnalisation',
    text: 'Nous croyons que chaque voyageur est unique. Notre algorithme psychologique est au cœur de tout ce que nous faisons.',
  },
  {
    n: '03',
    title: 'Confiance',
    text: 'Hôtes et voyageurs méritent un environnement sûr. Notre système de modération et de signalement le garantit.',
  },
  {
    n: '04',
    title: 'Communauté',
    text: "SAYMO, c'est avant tout des humains — hôtes passionnés et voyageurs curieux — qui se rencontrent.",
  },
]

const TEAM = [
  {
    name: 'Salah Chinaoui',
    role: 'Fondateur & Développeur',
    initial: 'S',
    bio: 'Passionné de tech et de voyages, Salah a conçu SAYMO pour réconcilier algorithme et émotion dans le voyage.',
  },
  {
    name: 'Ayoub Tibichte',
    role: 'Co-Fondateur & Développeur',
    initial: 'A',
    bio: "Ayoub apporte son expertise technique et sa créativité pour bâtir une plateforme robuste et intuitive.",
  },
  {
    name: 'Mouncif Elbarki',
    role: 'Co-Fondateur & Développeur',
    initial: 'M',
    bio: "Mouncif pilote la vision produit et s'assure que chaque fonctionnalité répond aux vrais besoins des utilisateurs.",
  },
]

function ValueCard({ v, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="value-card about-reveal-up" style={{ '--delay': `${delay}ms` }}>
      <span className="value-number">{v.n}</span>
      <h3 className="value-title">{v.title}</h3>
      <p className="value-text">{v.text}</p>
    </div>
  )
}

function TeamCard({ m, delay }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="team-card card about-reveal-up" style={{ '--delay': `${delay}ms` }}>
      <div className="team-avatar">{m.initial}</div>
      <h3 className="team-name">{m.name}</h3>
      <p className="team-role">{m.role}</p>
      <p className="team-bio">{m.bio}</p>
    </div>
  )
}

export default function About() {
  const heroRef    = useReveal(0.05)
  const storyImg   = useReveal()
  const storyText  = useReveal()
  const valuesHead = useReveal()
  const teamHead   = useReveal()
  const ctaRef     = useReveal()

  return (
    <div className="about">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div ref={heroRef} className="about-hero-inner container about-reveal-up">
          <p className="about-eyebrow">À propos de SAYMO</p>
          <h1 className="about-title">
            Le voyage qui<br /><em>vous ressemble</em>
          </h1>
          <p className="about-lead">
            SAYMO est une plateforme de location de logements unique en son genre.
            Là où les autres plateformes vous montrent des listes, nous vous proposons
            des expériences choisies pour <strong>vous</strong>, grâce à notre algorithme
            de recommandation basé sur la psychologie du voyageur.
          </p>
        </div>
      </section>

      {/* ── Notre histoire ── */}
      <section className="about-story container">
        <div ref={storyImg} className="about-story-img about-reveal-left">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
            alt="Équipe SAYMO"
          />
        </div>
        <div ref={storyText} className="about-story-text about-reveal-right">
          <span className="tag">Notre histoire</span>
          <h2 className="about-section-title">Née d'une frustration, construite avec passion</h2>
          <p>
            Tout a commencé d'un constat simple : les plateformes de voyages existantes
            proposent des milliers de logements, mais aucune ne vous aide vraiment à
            trouver celui qui <em>vous convient</em>.
          </p>
          <p>
            En 2024, SAYMO est né avec une idée folle — appliquer la psychologie
            comportementale à la recherche de logements. Le résultat : un test de
            10 questions qui génère un profil voyageur unique, utilisé pour filtrer
            et recommander des logements avec une précision inédite.
          </p>
          <p>
            Aujourd'hui, SAYMO rassemble plus de 500 logements et 2 000 voyageurs
            satisfaits à travers la France.
          </p>
        </div>
      </section>

      {/* ── Valeurs ── */}
      <section className="about-values">
        <div className="container">
          <div ref={valuesHead} className="about-values-head about-reveal-up">
            <h2 className="about-section-title">Nos valeurs</h2>
            <p className="about-values-sub">Ce qui guide chacune de nos décisions</p>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <ValueCard key={v.n} v={v} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Équipe ── */}
      <section className="about-team container">
        <h2 ref={teamHead} className="about-section-title about-reveal-up" style={{ marginBottom: 40 }}>L'équipe</h2>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <TeamCard key={m.name} m={m} delay={i * 120} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div ref={ctaRef} className="about-cta-inner container about-reveal-up">
          <h2 className="about-cta-title">Prêt à voyager autrement ?</h2>
          <p className="about-cta-sub">Rejoignez des milliers de voyageurs qui ont déjà trouvé leur logement idéal.</p>
          <div className="about-cta-actions">
            <Link to="/register" className="btn btn-primary">Créer un compte</Link>
            <Link to="/listings" className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              Explorer les logements
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
