import React, { useEffect, useState } from "react";
import "../styles/pages/CheckoutPage.css";

import { cartAPI } from "../services/api";
import CheckoutForm from "../components/shop/CheckoutForm";

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const loadCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
    } catch (err) {
      console.error("Errore caricamento carrello:", err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // TOTALE
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  const SHIPPING_THRESHOLD = 40;
  const SHIPPING_COST = 4.99;

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;

  const totalAmount = subtotal + shippingCost;

  return (
    <div className="checkout-section">
      <h2 className="section-title">Checkout</h2>

      {cart.length === 0 ? (
        <div className="empty-checkout">
          <p>Il carrello è vuoto.</p>
          <p>Aggiungi prodotti per procedere.</p>
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

          {/* Subtotale */}
          <div className="checkout-item" style={{ justifyContent: "space-between" }}>
            <strong className="sub">Subtotale</strong>
            <strong>{subtotal.toFixed(2)}€</strong>
          </div>

          {/* Spedizione */}
          <div className="checkout-item" style={{ justifyContent: "space-between" }}>
            <strong className="sub">Spedizione</strong>
            {isFreeShipping ? (
              <span style={{ color: "#4ade80", fontWeight: "bold" }}>GRATIS</span>
            ) : (
              <strong>{shippingCost.toFixed(2)}€</strong>
            )}
          </div>

          {/* Totale */}
          <div className="checkout-item" style={{ justifyContent: "space-between", borderTop: "2px solid var(--gold)" }}>
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

      {/* MODALE CHECKOUT */}
      {showCheckoutForm && (
        <CheckoutForm
          onClose={() => setShowCheckoutForm(false)}
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
