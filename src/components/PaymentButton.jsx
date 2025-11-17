/* ========================================
   PAYMENT BUTTON COMPONENT
   Bottone per iniziare il processo di pagamento Stripe
   ======================================== */

import { useState } from "react";
import "./PaymentButton.css";

/**
 * Componente PaymentButton
 * Gestisce la creazione della sessione di pagamento Stripe
 * 
 * @param {number} totalAmount - Importo totale dell'ordine
 * @param {array} cartItems - Array di prodotti nel carrello
 */
export default function PaymentButton({ totalAmount, cartItems }) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Funzione per avviare il processo di pagamento
   * Crea una sessione di checkout Stripe e reindirizza l'utente
   */
  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      const res = await fetch("http://localhost:3000/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          items: cartItems,
        }),
      });

      if (!res.ok) {
        throw new Error("Errore nella creazione della sessione di pagamento");
      }

      const data = await res.json();
      
      // Reindirizza l'utente alla pagina di checkout Stripe
      window.location.href = data.url;
      
    } catch (error) {
      console.error("Errore nel pagamento:", error);
      alert("Si è verificato un errore. Riprova più tardi.");
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button"
      className="payment-button" 
      onClick={handlePayment}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="payment-spinner"></span>
          <span>Reindirizzamento...</span>
        </>
      ) : (
        <>
          <img src="/public/icon/FullShop.png" alt="Procedi al pagamento" />
          <span>Paga con Stripe</span>
        </>
      )}
    </button>
  );
}
