import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">SAYMO</Link>
          <p className="footer-tagline">Le logement qui vous ressemble.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram" className="footer-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="footer-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9 9 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.52 2.03-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.37 4.07 3.58 1.64.9a4.52 4.52 0 0 0-.61 2.27c0 1.57.8 2.95 2.01 3.76a4.5 4.5 0 0 1-2.05-.56v.06c0 2.19 1.56 4.02 3.63 4.43a4.6 4.6 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.14A9.07 9.07 0 0 1 0 19.54a12.8 12.8 0 0 0 6.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.17 9.17 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="footer-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Explorer</h4>
          <Link to="/listings" className="footer-link">Tous les logements</Link>
          <Link to="/listings?type=villa" className="footer-link">Villas</Link>
          <Link to="/listings?type=chalet" className="footer-link">Chalets</Link>
          <Link to="/listings?type=apartment" className="footer-link">Appartements</Link>
          <Link to="/listings?type=cabin" className="footer-link">Cabanes</Link>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">SAYMO</h4>
          <Link to="/about" className="footer-link">À propos</Link>
          <Link to="/register" className="footer-link">Créer un compte</Link>
          <Link to="/register" className="footer-link">Devenir hôte</Link>
          <Link to="/test" className="footer-link">Test psychologique</Link>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Légal</h4>
          <a href="#" className="footer-link">Conditions d'utilisation</a>
          <a href="#" className="footer-link">Politique de confidentialité</a>
          <a href="#" className="footer-link">Cookies</a>
          <a href="#" className="footer-link">Mentions légales</a>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} SAYMO. Tous droits réservés.</p>
          <p className="footer-stripe">Paiements sécurisés par
            <svg width="40" height="16" viewBox="0 0 60 25" fill="none" style={{ marginLeft: 6, verticalAlign: 'middle' }}>
              <path d="M26.4 9.2c0-1.4-1.1-2-2.9-2h-4.2v7.7h1.7v-2.8h2.1c1.9 0 3.3-.9 3.3-2.9zm-1.8.1c0 .9-.6 1.4-1.7 1.4h-1.9V7.8h1.9c1.1 0 1.7.5 1.7 1.5zM30 7.2l-2.8 7.7h1.8l.6-1.8h2.8l.6 1.8h1.8L32 7.2H30zm-.1 4.6.9-2.8.9 2.8h-1.8zM38.5 7.2h-1.7v7.7h5.4v-1.5h-3.7V7.2zM45.2 7.2h-1.7v7.7h1.7V7.2zM51.7 10.4c-.9-.4-1.5-.6-1.5-1.2 0-.5.4-.8 1.1-.8.7 0 1.4.3 1.9.7l.9-1.2c-.7-.6-1.7-1-2.8-1-1.7 0-2.9 1-2.9 2.5 0 1.3.9 2 2.1 2.5.9.4 1.6.6 1.6 1.3 0 .6-.5.9-1.2.9-.9 0-1.7-.4-2.3-.9l-.9 1.2c.8.7 1.9 1.1 3.1 1.1 1.8 0 3.1-1 3.1-2.6 0-1.3-.9-2-2.3-2.5zM9.5 10.6c0 2.3-1.8 4-4.2 4H1.5V6.7h3.8c2.4 0 4.2 1.7 4.2 3.9zm-1.8 0c0-1.4-.9-2.5-2.4-2.5H3.2v5h2.1c1.4 0 2.4-1.1 2.4-2.5z" fill="currentColor"/>
            </svg>
          </p>
        </div>
      </div>
    </footer>
  )
}
