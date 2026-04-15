import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import './HostAvailability.css'

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
]
const DAYS = ['Lu','Ma','Me','Je','Ve','Sa','Di']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  // 0=Sun→convert to Mon-based: Mon=0 ... Sun=6
  const d = new Date(year, month, 1).getDay()
  return (d + 6) % 7
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function HostAvailability() {
  const { id } = useParams()
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [availability, setAvailability] = useState({}) // {YYYY-MM-DD: bool}
  const [property, setProperty] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api.get(`/properties/${id}/`).then(r => setProperty(r.data)).catch(() => {})
    api.get(`/properties/${id}/availability/`).then(r => {
      const map = {}
      r.data.forEach(a => { map[a.date] = a.is_available })
      setAvailability(map)
    }).catch(() => {})
  }, [id])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleDayClick = (day) => {
    const iso = toISO(year, month, day)
    if (!selecting) {
      setSelecting(true)
      setRangeStart(iso)
      setRangeEnd(null)
    } else {
      const start = rangeStart < iso ? rangeStart : iso
      const end   = rangeStart < iso ? iso : rangeStart
      setRangeEnd(end)
      setSelecting(false)
      // instant highlight
    }
  }

  const isInRange = (iso) => {
    if (!rangeStart) return false
    const end = rangeEnd || rangeStart
    return iso >= rangeStart && iso <= end
  }

  const handleSetRange = async (isAvailable) => {
    if (!rangeStart) return
    const start = rangeStart
    const end   = rangeEnd || rangeStart
    setSaving(true)
    try {
      await api.post(`/properties/${id}/availability/range/`, {
        start_date: start,
        end_date: end === start
          ? toISO(...end.split('-').map((v,i) => i===2 ? parseInt(v)+1 : parseInt(v)-( i===1?1:0)))
          : (() => {
            const d = new Date(end)
            d.setDate(d.getDate() + 1)
            return d.toISOString().split('T')[0]
          })(),
        is_available: isAvailable,
      })
      // Refresh
      const r = await api.get(`/properties/${id}/availability/`)
      const map = {}
      r.data.forEach(a => { map[a.date] = a.is_available })
      setAvailability(map)
      setRangeStart(null)
      setRangeEnd(null)
      setNotice(isAvailable ? 'Dates marquées disponibles.' : 'Dates bloquées.')
      setTimeout(() => setNotice(''), 3000)
    } catch {
      setNotice('Erreur lors de la mise à jour.')
      setTimeout(() => setNotice(''), 3000)
    }
    setSaving(false)
  }

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDayIdx  = getFirstDayOfMonth(year, month)
  const todayISO     = today.toISOString().split('T')[0]

  const cells = []
  for (let i = 0; i < firstDayIdx; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="page-content container">
      <div className="avail-header">
        <div>
          <Link to="/host/properties" className="back-link">← Mes logements</Link>
          <h1 className="page-title">{property?.title || 'Logement'}</h1>
          <p className="page-subtitle">Gérez les disponibilités de votre logement</p>
        </div>
      </div>

      <div className="avail-layout">
        {/* Calendar */}
        <div className="card avail-calendar">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-title">{MONTHS[month]} {year}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="cal-grid-header">
            {DAYS.map(d => <span key={d} className="cal-day-label">{d}</span>)}
          </div>

          <div className="cal-grid">
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />
              const iso  = toISO(year, month, day)
              const avail = availability[iso]
              const inRange = isInRange(iso)
              const isPast  = iso < todayISO
              return (
                <button
                  key={iso}
                  className={[
                    'cal-day',
                    isPast    ? 'past'      : '',
                    avail === false ? 'blocked' : '',
                    avail === true  ? 'available' : '',
                    inRange   ? 'in-range'  : '',
                    iso === rangeStart ? 'range-start' : '',
                    iso === rangeEnd   ? 'range-end'   : '',
                    iso === todayISO   ? 'today'       : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !isPast && handleDayClick(day)}
                  disabled={isPast}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <span className="legend-dot available" /> Disponible
            <span className="legend-dot blocked" />  Bloqué
            <span className="legend-dot neutral" />  Non défini
          </div>
        </div>

        {/* Actions panel */}
        <div className="avail-actions-panel">
          <div className="card avail-action-card">
            <h3 className="avail-action-title">Sélection</h3>
            {!rangeStart ? (
              <p className="avail-action-hint">
                Cliquez sur un jour pour commencer une sélection, puis cliquez sur un second jour pour définir la plage.
              </p>
            ) : (
              <>
                <div className="avail-range-display">
                  <div className="avail-range-item">
                    <span className="avail-range-label">Début</span>
                    <span className="avail-range-value">{rangeStart}</span>
                  </div>
                  <div className="avail-range-item">
                    <span className="avail-range-label">Fin</span>
                    <span className="avail-range-value">{rangeEnd || rangeStart}</span>
                  </div>
                </div>
                <div className="avail-range-btns">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSetRange(true)}
                    disabled={saving}
                  >
                    Marquer disponible
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleSetRange(false)}
                    disabled={saving}
                  >
                    Bloquer
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setRangeStart(null); setRangeEnd(null); setSelecting(false) }}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
            {notice && <p className="avail-notice">{notice}</p>}
          </div>

          <div className="card avail-info-card">
            <h3 className="avail-action-title">Comment ça marche</h3>
            <ol className="avail-how-list">
              <li>Cliquez sur un premier jour pour démarrer la sélection</li>
              <li>Cliquez sur un second jour pour définir la fin de la plage</li>
              <li>Choisissez "Disponible" ou "Bloquer"</li>
            </ol>
            <p className="avail-how-note">
              Les dates sans statut défini sont considérées comme disponibles par défaut.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
