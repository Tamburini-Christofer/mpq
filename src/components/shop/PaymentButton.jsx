import { useState } from 'react';
import '../../styles/components/PaymentButton.css';

export default function PaymentButton({ totalAmount, cartItems, formData, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayClick = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.shippingAddress || !formData.shippingCity || !formData.shippingPostalCode) {
      setError("Completa tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          customerData: formData,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/shop`,
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Errore server');
      }

      const data = await response.json();

      // QUESTO SUPPORTA TUTTI I FORMATI CHE IL BACKEND PUÒ RESTITUIRE
      const redirectTo = data.sessionUrl || data.url || 
                        (data.sessionId ? `https://checkout.stripe.com/c/pay/${data.sessionId}` : null);

      if (!redirectTo) {
        throw new Error('URL di pagamento non ricevuto');
      }

      window.location.href = redirectTo;

    } catch (err) {
      setError(err.message || 'Errore pagamento');
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
          {loading ? 'Reindirizzamento...' : 'Procedi al pagamento'}
        </button>
      </div>
    </>
  );
}