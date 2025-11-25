import { useState } from 'react';
import '../../styles/components/PaymentButton.css';

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
      // Crea una sessione di checkout Stripe sul backend
      const response = await fetch('http://localhost:3000/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cartItems,
          customerData: formData,
          // include a query param so the frontend can detect successful checkout
          // and clear localStorage. Also include the session id placeholder.
          successUrl: `${window.location.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/shop`
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Server error creating checkout session');
      }

      const { sessionUrl } = await response.json();

      if (!sessionUrl) {
        throw new Error('No session URL returned from server');
      }

      // Browser redirect to Stripe Checkout page (new recommended flow)
      window.location.href = sessionUrl;
    } catch (err) {
      setError(err.message || 'Errore durante il pagamento. Riprova.');
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className="payment-error">{error}</div>}
      <div className="buttons-row">
        <button 
          type="button"
          className="pay-btn" 
          onClick={handlePayClick}
          disabled={loading}
        >
          {loading ? 'Reindirizzamento a Stripe...' : `Procedi al pagamento`}
        </button>
      </div>
    </>
  );
}
