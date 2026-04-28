import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotif } from '../../context/NotifContext'
import { logout } from '../../api/auth'
import { getUnreadCount } from '../../api/messages'
import './Navbar.css'

function NotifPanel({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotif()

  const TYPE_ICONS = {
    booking:        '◈',
    review:         '★',
    recommendation: '◆',
    system:         '◉',
  }

  return (
    <div className="notif-panel">
      <div className="notif-panel-header">
        <span className="notif-panel-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={markAllRead}>
            Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notif-panel-empty">
          <p>Aucune notification</p>
        </div>
      ) : (
        <div className="notif-panel-list">
          {notifications.slice(0, 10).map(n => (
            <div
              key={n.id}
              className={`notif-panel-item ${!n.is_read ? 'unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <span className="notif-type-icon">{TYPE_ICONS[n.type] || '◉'}</span>
              <div className="notif-item-body">
                <p className="notif-item-text">{n.message}</p>
                <p className="notif-item-time">
                  {new Date(n.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {!n.is_read && <span className="notif-unread-dot" />}
            </div>
          ))}
        </div>
      )}

      <Link to="/dashboard" className="notif-panel-footer" onClick={onClose}>
        Voir toutes les notifications
      </Link>
    </div>
  )
}

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const { unreadCount } = useNotif()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [msgUnread, setMsgUnread]     = useState(0)
  const menuRef  = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current  && !menuRef.current.contains(e.target))  setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!user) return
    const fetch = () => getUnreadCount().then(r => setMsgUnread(r.data.unread)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 30000)
    return () => clearInterval(id)
  }, [user])

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logout(refresh)
    } catch {}
    logoutUser()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">SAYMO</Link>

        <div className="navbar-links">
          <Link to="/listings" className={`navbar-link ${isActive('/listings') ? 'active' : ''}`}>
            Logements
          </Link>
          {user && (
            <Link to="/recommendations" className={`navbar-link ${isActive('/recommendations') ? 'active' : ''}`}>
              Pour vous
            </Link>
          )}
          <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>
            À propos
          </Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/favorites" className="navbar-icon" title="Favoris">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </Link>

              {/* Messages */}
              <Link to="/messages" className="navbar-icon" title="Messages" style={{ position: 'relative' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {msgUnread > 0 && (
                  <span className="notif-badge">{msgUnread > 9 ? '9+' : msgUnread}</span>
                )}
              </Link>

              {/* Notifications bell */}
              <div className="navbar-icon notif-wrap" ref={notifRef}>
                <button
                  className="notif-btn"
                  onClick={() => setNotifOpen(v => !v)}
                  title="Notifications"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
              </div>

              {/* Profile menu */}
              <div className="navbar-profile" ref={menuRef}>
                <button className="profile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="profile-avatar" />
                  ) : (
                    <div className="profile-initials">{user.name.charAt(0).toUpperCase()}</div>
                  )}
                </button>

                {menuOpen && (
                  <div className="profile-menu">
                    <div className="profile-menu-header">
                      <span className="profile-menu-name">{user.name}</span>
                      <span className="profile-menu-email">{user.email}</span>
                    </div>
                    <hr className="profile-menu-divider" />
                    <Link to="/dashboard"     className="profile-menu-item" onClick={() => setMenuOpen(false)}>Tableau de bord</Link>
                    <Link to="/profile"       className="profile-menu-item" onClick={() => setMenuOpen(false)}>Mon profil</Link>
                    <Link to="/bookings"      className="profile-menu-item" onClick={() => setMenuOpen(false)}>Mes réservations</Link>
                    <Link to="/messages"      className="profile-menu-item" onClick={() => setMenuOpen(false)}>Messages</Link>
                    <Link to="/favorites"     className="profile-menu-item" onClick={() => setMenuOpen(false)}>Mes favoris</Link>
                    {(user.role === 'host' || user.role === 'admin') && (
                      <>
                        <hr className="profile-menu-divider" />
                        <Link to="/host/dashboard" className="profile-menu-item" onClick={() => setMenuOpen(false)}>Espace hôte</Link>
                        <Link to="/host/reviews"   className="profile-menu-item" onClick={() => setMenuOpen(false)}>Mes avis</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <hr className="profile-menu-divider" />
                        <Link to="/admin/dashboard"   className="profile-menu-item" onClick={() => setMenuOpen(false)}>Administration</Link>
                        <Link to="/admin/properties"  className="profile-menu-item" onClick={() => setMenuOpen(false)}>Modération</Link>
                        <Link to="/admin/reviews"     className="profile-menu-item" onClick={() => setMenuOpen(false)}>Avis</Link>
                        <Link to="/admin/reports"     className="profile-menu-item" onClick={() => setMenuOpen(false)}>Signalements</Link>
                      </>
                    )}
                    <hr className="profile-menu-divider" />
                    <button className="profile-menu-item profile-menu-logout" onClick={handleLogout}>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login"    className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
