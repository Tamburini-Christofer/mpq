import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import './PaymentButton.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

export default function PaymentButton({ totalAmount, cartItems, formData, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayClick = async () => {
    // Validazione dati form prima di procedere
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
      setError("Per favore completa tutti i campi obbligatori del form prima di procedere al pagamento");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stripe = await stripePromise;

      // Crea una sessione di checkout Stripe
      const response = await fetch('http://localhost:3000/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems,
          customerData: formData,
          successUrl: `${window.location.origin}/`,
          cancelUrl: `${window.location.origin}/shop`
        })
      });

      const { sessionId } = await response.json();

      // Reindirizza a Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Errore durante il pagamento. Riprova.');
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="payment-error">{error}</div>}
      <div className="buttons-row">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Annulla Ordine
        </button>
        <button 
          type="button"
          className="pay-btn" 
          onClick={handlePayClick}
          disabled={loading}
        >
          {loading ? 'Reindirizzamento a Stripe...' : `Paga ${totalAmount.toFixed(2)}€`}
        </button>
      </div>
    </>
  );
}
