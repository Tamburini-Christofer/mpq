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
      // Chiamata al backend per creare la sessione Stripe
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Risposta dal server:', data);

      // Controlla se abbiamo ricevuto l'URL per il checkout
      if (data.url) {
        console.log('🔗 Reindirizzo a:', data.url);
        // Redirect diretto al checkout Stripe
        window.location.href = data.url;
      } else {
        throw new Error('URL di checkout non ricevuto dal server');
      }

    } catch (err) {
      console.error('❌ Errore durante il checkout:', err);
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
