import React, { useEffect, useState } from "react";
import "../styles/pages/CheckoutPage.css";

import { cartAPI, emitCartUpdate } from "../services/api";
import { error as logError } from '../utils/logger';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import CheckoutForm from "../components/shop/CheckoutForm";

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const loadCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
      // emitCartUpdate(); // RIMOSSO: evita loop infinito
    } catch (err) {
      logError("Errore caricamento carrello", err);
    }
  };

  useEffect(() => {
    loadCart();
    const handler = (e) => {
      if (e && e.detail && e.detail.cart) setCart(e.detail.cart);
      else loadCart();
    };

    window.addEventListener("cartUpdate", handler);

    return () => {
      window.removeEventListener("cartUpdate", handler);
    };
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const SHIPPING_THRESHOLD = 40;
  const SHIPPING_COST = 4.99;

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;

  const totalAmount = subtotal + shippingCost;

  // 👉 FUNZIONE ANNULLA ORDINE (svuota tutto)
  const handleCancelOrder = async () => {
    try {
      const result = await Swal.fire({
        title: 'Annullare l\'ordine?',
        text: 'Se continui verrà svuotato il carrello e l\'ordine sarà annullato.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Annulla ordine',
        cancelButtonText: 'Rimani',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'swal-wishlist-popup',
          confirmButton: 'swal-wishlist-confirm',
          cancelButton: 'swal-wishlist-cancel'
        }
      });

      if (!result.isConfirmed) return;

      // Svuota tutto il carrello
      await cartAPI.clear();
      emitCartUpdate();

      // Aggiorna stato
      await loadCart();

      // Chiudi modale del form
      setShowCheckoutForm(false);

      // Notify app that checkout is closed/finished so menu can hide
      try {
        window.dispatchEvent(new CustomEvent('checkoutClosed'));
      } catch (e) {}

      // Mostra feedback con spunta animata
      await Swal.fire({
        html: `
          <div class="swal-check-wrap">
            <div class="swal-check-icon" aria-hidden="true">✓</div>
            <div class="swal-check-label">Ordine annullato</div>
          </div>
        `,
        timer: 1400,
        showConfirmButton: false,
        customClass: { popup: 'swal-wishlist-popup' },
        didOpen: (popup) => {
          const icon = popup.querySelector('.swal-check-icon');
          if (icon) setTimeout(() => icon.classList.add('animate'), 40);
        }
      });

      // Torna indietro
      window.history.back();

    } catch (err) {
      logError("Errore annullamento ordine", err);
      toast.error('Errore nell\'annullamento dell\'ordine');
    }
  };

  return (
    <div className="checkout-section">
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <button
          className="back-btn"
          onClick={() => window.history.back()}
          aria-label="Torna indietro"
        >
          ←
        </button>
        <h2 className="section-title">Checkout</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-checkout">
          <p>Il carrello è vuoto.</p>
          <p>Aggiungi prodotti e riprova.</p>
          <img src="/public/icon/InShop.png" alt="empty" />
        </div>
      ) : (
        <div className="checkout-summary">
          <h3>Riepilogo Ordine</h3>

          {cart.map((item) => {
            const price = parseFloat(item.price);
            return (
              <div key={item.id} className="checkout-item">
                <div>
                  {item.name} <strong className="qt">{item.quantity} pz</strong>
                </div>
                <div>{(price * item.quantity).toFixed(2)}€</div>
              </div>
            );
          })}

          <div className="checkout-item" style={{ justifyContent: "space-between" }}>
            <strong className="sub">Subtotale</strong>
            <strong>{subtotal.toFixed(2)}€</strong>
          </div>

          <div className="checkout-item" style={{ justifyContent: "space-between" }}>
            <strong className="sub">Spedizione</strong>
            {isFreeShipping ? (
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>GRATIS</span>
            ) : (
              <strong>{shippingCost.toFixed(2)}€</strong>
            )}
          </div>

          <div 
            className="checkout-item"
            style={{ 
              justifyContent: "space-between",
              borderTop: "2px solid var(--gold)"
            }}
          >
            <strong style={{ color: "var(--gold)", fontSize: "20px" }}>Totale</strong>
            <strong style={{ color: "var(--gold)", fontSize: "20px" }}>
              {totalAmount.toFixed(2)}€
            </strong>
          </div>

          <div className="checkout-actions">
            <button 
              className="confirm-btn" 
              onClick={() => setShowCheckoutForm(true)}
            >
              Procedi al Pagamento
            </button>
          </div>
        </div>
      )}

      {showCheckoutForm && (
        <CheckoutForm
          onClose={() => setShowCheckoutForm(false)}
          onCancelOrder={handleCancelOrder}   // <-- nuovo
          cartItems={cart}
          totalAmount={totalAmount}
          shippingCost={shippingCost}
          isFreeShipping={isFreeShipping}
        />
      )}
    </div>
  );
}

export default CheckoutPage;
