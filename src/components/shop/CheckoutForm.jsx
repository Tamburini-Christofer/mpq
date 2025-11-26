/* ========================================
   CHECKOUT FORM COMPONENT
   Overlay form per completare l'acquisto
   ======================================== */

import { useState } from "react";
import PaymentButton from "./PaymentButton";
import FreeShippingBanner from "./FreeShippingBanner"; // opzionale ma utile
import "../../styles/components/CheckoutForm.css";

/**
 * @param {function} onClose        - chiude l'overlay
 * @param {number}   totalAmount    - totale ordine (prodotti + spedizione)
 * @param {array}    cartItems      - prodotti nel carretto
 * @param {number}   shippingCost   - costo spedizione (default 4.99)
 * @param {boolean}  isFreeShipping - true se spedizione gratis
 */
export default function CheckoutForm({
  onClose,
  onCancelOrder,
  totalAmount,
  cartItems,
  shippingCost = 4.99,
  isFreeShipping = false,
}) {
  // fallback sicuri
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const subtotal = safeCartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const numericShipping = Number(shippingCost) || 0;
  const finalShipping = isFreeShipping ? 0 : numericShipping;

  // Se il padre non passa totalAmount, lo ricalcolo io
  const safeTotalAmount =
    totalAmount != null && !Number.isNaN(Number(totalAmount))
      ? Number(totalAmount)
      : subtotal + finalShipping;

  /* ===== STATO DEL FORM ===== */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "Italia",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "Italia",
    sameAsShipping: true,
    notes: "",
  });

  /* ===== HANDLER ===== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Niente submit classico: il flusso vero è in PaymentButton
  };

  /* ===== RENDER ===== */
  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div
        className="checkout-form-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="checkout-form-header">
          <div>
            <h2 className="checkout-form-title">Completa il tuo ordine</h2>
            <p className="checkout-form-subtitle">
              Un ultimo passo e la tua prossima avventura è pronta a partire.
            </p>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Chiudi checkout"
          >
            ✕
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleFormSubmit}>
          {/* COLONNA SINISTRA: DATI / INDIRIZZI */}
          <div className="checkout-columns">
            <div className="checkout-left">
              {/* DATI PERSONALI */}
              <div className="form-section">
                <h3 className="section-title-form">Dati personali</h3>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="firstName">
                      Nome *
                    </label>
                    <input
                      id="firstName"
                      className="checkout-input"
                      type="text"
                      name="firstName"
                      placeholder="Il tuo nome"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="lastName">
                      Cognome *
                    </label>
                    <input
                      id="lastName"
                      className="checkout-input"
                      type="text"
                      name="lastName"
                      placeholder="Il tuo cognome"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="email">
                      Email *
                    </label>
                    <input
                      id="email"
                      className="checkout-input"
                      type="email"
                      name="email"
                      placeholder="tua@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="phone">
                      Telefono (opzionale)
                    </label>
                    <input
                      id="phone"
                      className="checkout-input"
                      type="tel"
                      name="phone"
                      placeholder="+39 ..."
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* INDIRIZZO SPEDIZIONE */}
              <div className="form-section">
                <h3 className="section-title-form">Indirizzo di spedizione</h3>

                <div className="input-group">
                  <label className="input-label" htmlFor="shippingAddress">
                    Indirizzo *
                  </label>
                  <input
                    id="shippingAddress"
                    className="checkout-input"
                    type="text"
                    name="shippingAddress"
                    placeholder="Via, numero civico"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label className="input-label" htmlFor="shippingCity">
                      Città *
                    </label>
                    <input
                      id="shippingCity"
                      className="checkout-input"
                      type="text"
                      name="shippingCity"
                      placeholder="Roma"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label
                      className="input-label"
                      htmlFor="shippingPostalCode"
                    >
                      CAP *
                    </label>
                    <input
                      id="shippingPostalCode"
                      className="checkout-input"
                      type="text"
                      name="shippingPostalCode"
                      placeholder="00100"
                      value={formData.shippingPostalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="shippingCountry">
                      Paese *
                    </label>
                    <input
                      id="shippingCountry"
                      className="checkout-input"
                      type="text"
                      name="shippingCountry"
                      value={formData.shippingCountry}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* INDIRIZZO FATTURAZIONE (solo se diverso) */}
              {!formData.sameAsShipping && (
                <div className="form-section">
                  <h3 className="section-title-form">
                    Indirizzo di fatturazione
                  </h3>

                  <div className="input-group">
                    <label className="input-label" htmlFor="billingAddress">
                      Indirizzo *
                    </label>
                    <input
                      id="billingAddress"
                      className="checkout-input"
                      type="text"
                      name="billingAddress"
                      placeholder="Via, numero civico"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label className="input-label" htmlFor="billingCity">
                        Città *
                      </label>
                      <input
                        id="billingCity"
                        className="checkout-input"
                        type="text"
                        name="billingCity"
                        placeholder="Roma"
                        value={formData.billingCity}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label
                        className="input-label"
                        htmlFor="billingPostalCode"
                      >
                        CAP *
                      </label>
                      <input
                        id="billingPostalCode"
                        className="checkout-input"
                        type="text"
                        name="billingPostalCode"
                        placeholder="00100"
                        value={formData.billingPostalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="billingCountry">
                        Paese *
                      </label>
                      <input
                        id="billingCountry"
                        className="checkout-input"
                        type="text"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NOTE */}
              <div className="form-section">
                <div className="input-group">
                  <label className="input-label" htmlFor="notes">
                    Note aggiuntive (opzionale)
                  </label>
                  <textarea
                    id="notes"
                    className="checkout-textarea"
                    name="notes"
                    placeholder="Eventuali richieste speciali per la consegna..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* COLONNA DESTRA: RIEPILOGO & PAGAMENTO */}
            <div className="checkout-right">
              {/* Banner spedizione (opzionale, molto carino) */}
              <FreeShippingBanner
                subtotal={subtotal}
                threshold={40}
                promoApplied={isFreeShipping}
              />

              {/* RIEPILOGO ORDINE */}
              <div className="order-summary">
                <h3 className="section-title-form">Riepilogo ordine</h3>

                <div className="summary-list">
                  {safeCartItems.length === 0 && (
                    <p className="summary-empty">
                      Nessun prodotto nel carretto.
                    </p>
                  )}

                  {safeCartItems.map((item, index) => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.quantity) || 0;
                    const lineTotal = price * qty;

                    return (
                      <div key={index} className="summary-row">
                        <div className="summary-row-left">
                          <span className="summary-product-name">
                            {item.name}
                          </span>
                          <span className="summary-product-qty">
                            x{qty}
                          </span>
                        </div>
                        <span className="summary-value">
                          {lineTotal.toFixed(2)}€
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* SUBTOTALE */}
                <div className="summary-row summary-subtotal">
                  <span>Subtotale</span>
                  <span className="summary-value">
                    {subtotal.toFixed(2)}€
                  </span>
                </div>

                {/* SPEDIZIONE */}
                <div className="summary-row summary-shipping">
                  <span>Spedizione</span>
                  <span className="summary-value">
                    {isFreeShipping ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#999",
                            marginRight: 8,
                          }}
                        >
                          {numericShipping.toFixed(2)}€
                        </span>
                        <span
                          style={{
                            color: "#4ade80",
                            fontWeight: "bold",
                          }}
                        >
                          GRATIS
                        </span>
                      </>
                    ) : (
                      `${finalShipping.toFixed(2)}€`
                    )}
                  </span>
                </div>

                {/* TOTALE */}
                <div className="summary-row summary-total">
                  <span className="total-label">Totale</span>
                  <span className="total-value">
                    {safeTotalAmount.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* AZIONI / PAGAMENTO */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-order-btn danger"
                  onClick={onCancelOrder}
                >
              
                  Annulla e Cancella Ordine
                </button>
                     <PaymentButton
                  totalAmount={safeTotalAmount}
                  cartItems={safeCartItems}
                  formData={formData}
                  onClose={onClose}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
