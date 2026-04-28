import { useState } from 'react'
import { createPortal } from 'react-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { confirmPayment } from '../../api/bookings'
import './PaymentModal.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CARD_STYLE = {
  style: {
    base: {
      fontFamily: '"Instrument Sans", system-ui, sans-serif',
      fontSize: '15px',
      color: '#0A0A0A',
      '::placeholder': { color: '#AAAAAA' },
    },
    invalid: { color: '#C0392B' },
  },
}

function CheckoutForm({ booking, clientSecret, onSuccess, onClose }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await confirmPayment(booking.id)
        onSuccess()
      } catch {
        setError('Paiement reçu mais erreur lors de la confirmation. Contactez le support.')
      }
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="pay-form">
      <div className="pay-booking-info">
        <div className="pay-property">{booking.property?.title}</div>
        <div className="pay-dates">
          {new Date(booking.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {' → '}
          {new Date(booking.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{booking.nights} nuit{booking.nights > 1 ? 's' : ''}
        </div>
        <div className="pay-total">{parseFloat(booking.total_price).toFixed(2)} €</div>
      </div>

      <div className="pay-card-section">
        <label className="form-label">Informations de carte</label>
        <div className="pay-card-wrap">
          <CardElement options={CARD_STYLE} />
        </div>
        <p className="pay-test-hint">
          Carte de test : <strong>4242 4242 4242 4242</strong> — date future — CVC quelconque
        </p>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="pay-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={loading || !stripe}>
          {loading ? 'Paiement en cours...' : `Payer ${parseFloat(booking.total_price).toFixed(2)} €`}
        </button>
      </div>
    </form>
  )
}

export default function PaymentModal({ booking, clientSecret, onSuccess, onClose }) {
  return createPortal(
    <div className="pay-backdrop" onClick={onClose}>
      <div className="pay-modal" onClick={e => e.stopPropagation()}>
        <div className="pay-header">
          <h2 className="pay-title">Paiement sécurisé</h2>
          <button className="pay-close" onClick={onClose}>×</button>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            booking={booking}
            clientSecret={clientSecret}
            onSuccess={onSuccess}
            onClose={onClose}
          />
        </Elements>
      </div>
    </div>,
    document.body
  )
}
