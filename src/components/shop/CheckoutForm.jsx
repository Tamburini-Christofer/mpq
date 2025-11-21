/* ========================================
   CHECKOUT FORM COMPONENT
   Overlay form per completare l'acquisto
   ======================================== */

import { useState } from "react";
import PaymentButton from "./PaymentButton";
import FreeShippingBanner from "./FreeShippingBanner";
import { checkoutAPI, cartAPI, emitCartUpdate } from "../../services/api";
import "../../styles/components/CheckoutForm.css";

/**
 * Componente CheckoutForm
 * Form overlay per la raccolta dati di spedizione e fatturazione
 * 
 * @param {function} onClose - Funzione per chiudere l'overlay
 * @param {number} totalAmount - Importo totale dell'ordine (include spedizione)
 * @param {array} cartItems - Array di prodotti nel carrello
 * @param {number} shippingCost - Costo spedizione (0 se sopra 40€ o promo, default 4.99)
 * @param {boolean} isFreeShipping - Se la spedizione è gratuita (sopra 40€ o promo)
 */
//todo: Funzione componente che riceve 5 props dal padre (Shop.jsx)
//todo: shippingCost e isFreeShipping hanno valori di default nel caso non vengano passati
export default function CheckoutForm({ onClose, totalAmount, cartItems, shippingCost = 4.99, isFreeShipping = false }) {
  
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

  /* ===== FUNZIONI HANDLER ===== */
  
  /**
   * Gestisce i cambiamenti nei campi del form
   * Supporta sia input testuali che checkbox
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  /**
   * Previene il submit del form principale
   * Il pagamento viene gestito dal pulsante Stripe
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Il form non fa submit, il pagamento è gestito dal PaymentButton
  };

  /* ===== RENDER ===== */
  return (
    // Overlay scuro di sfondo
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-form-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ===== HEADER ===== */}
        <div className="checkout-form-header">
          <h2 className="checkout-form-title">Completa il tuo Ordine</h2>
          <button className="close-btn" onClick={onClose} aria-label="Chiudi">
            ✕
          </button>
        </div>

        {/* ===== FORM PRINCIPALE ===== */}
        <form className="checkout-form" onSubmit={handleFormSubmit}>
          
          {/* SEZIONE 1: DATI PERSONALI */}
          <div className="form-section">
            <h3 className="section-title-form">Dati Personali</h3>
            
            <div className="form-row">
              <div className="input-group">
                <label className="input-label" htmlFor="firstName">Nome *</label>
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
                <label className="input-label" htmlFor="lastName">Cognome *</label>
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
                <label className="input-label" htmlFor="email">Email *</label>
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
            </div>
          </div>

          {/* SEZIONE 2: INDIRIZZO DI SPEDIZIONE */}
          <div className="form-section">
            <h3 className="section-title">Indirizzo di Spedizione</h3>
            
            <div className="input-group">
              <label className="input-label" htmlFor="shippingAddress">Indirizzo *</label>
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
                <label className="input-label" htmlFor="shippingCity">Città *</label>
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
                <label className="input-label" htmlFor="shippingPostalCode">CAP *</label>
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
                <label className="input-label" htmlFor="shippingCountry">Paese *</label>
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

          {/* CHECKBOX: Stesso indirizzo per fatturazione
          <div className="checkbox-group">
            <input
              id="sameAsShipping"
              type="checkbox"
              name="sameAsShipping"
              checked={formData.sameAsShipping}
              onChange={handleChange}
            />
            <label htmlFor="sameAsShipping">
              Usa lo stesso indirizzo per la fatturazione
            </label>
          </div> */}

          {/* SEZIONE 3: INDIRIZZO DI FATTURAZIONE (condizionale) */}
          {!formData.sameAsShipping && (
            <div className="form-section">
              <h3 className="section-title">Indirizzo di Fatturazione</h3>
              
              <div className="input-group">
                <label className="input-label" htmlFor="billingAddress">Indirizzo *</label>
                <input
                  id="billingAddress"
                  className="checkout-input"
                  type="text"
                  name="billingAddress"
                  placeholder="Via, numero civico"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  required={!formData.sameAsShipping}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="billingCity">Città *</label>
                  <input
                    id="billingCity"
                    className="checkout-input"
                    type="text"
                    name="billingCity"
                    placeholder="Roma"
                    value={formData.billingCity}
                    onChange={handleChange}
                    required={!formData.sameAsShipping}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="billingPostalCode">CAP *</label>
                  <input
                    id="billingPostalCode"
                    className="checkout-input"
                    type="text"
                    name="billingPostalCode"
                    placeholder="00100"
                    value={formData.billingPostalCode}
                    onChange={handleChange}
                    required={!formData.sameAsShipping}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="billingCountry">Paese *</label>
                  <input
                    id="billingCountry"
                    className="checkout-input"
                    type="text"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={handleChange}
                    required={!formData.sameAsShipping}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEZIONE 4: NOTE AGGIUNTIVE */}
          <div className="form-section">
            <div className="input-group">
              <label className="input-label" htmlFor="notes">
                Note Aggiuntive (opzionale)
              </label>
              <textarea
                id="notes"
                className="checkout-textarea"
                name="notes"
                placeholder="Eventuali richieste speciali per la consegna..."
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              />
            </div>

          {/* SEZIONE 5: RIEPILOGO ORDINE */}
          {/* todo: Box riepilogo con lista prodotti, subtotale, spese spedizione e totale */}
          <div className="order-summary">
            <h3 className="section-title">Riepilogo Ordine</h3>
            <div className="summary-details">
              {/* Lista prodotti nel carrello */}
              {/* todo: Mappiamo cartItems per mostrare ogni prodotto con nome, quantità e prezzo totale */}
              {cartItems.map((item, index) => (
                <div key={index} className="summary-row">
                  <span>{item.name} x{item.quantity}</span>
                  {/* todo: Prezzo totale per questo prodotto = prezzo unitario × quantità */}
                  <span className="summary-value">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
              
              {/* Riga subtotale */}
              {/* todo: Subtotale = somma di tutti i prodotti SENZA le spese di spedizione */}
              <div className="summary-row subtotal-row">
                <span>Subtotale</span>
                <span className="summary-value">
                  {/* todo: Usiamo reduce per sommare (prezzo × quantità) di ogni item del carrello */}
                  {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€
                </span>
              </div>

              {/* Riga spese di spedizione */}
              {/* todo: Mostriamo le spese con logica condizionale: GRATIS se sopra 40€ o promo, 4.99€ altrimenti */}
              <div className="summary-row shipping-row">
                <span>Spese di spedizione</span>
                <span className="summary-value">
                  {/* todo: Controlliamo la prop isFreeShipping per decidere cosa mostrare */}
                  {isFreeShipping ? (
                    <>
                      {/* todo: Se spedizione GRATUITA (sopra 40€ o promo): prezzo originale barrato + scritta verde GRATIS */}
                      <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>4.99€</span>
                      <span style={{color: '#4ade80', fontWeight: 'bold'}}>GRATIS</span>
                    </>
                  ) : (
                    /* todo: Se NO spedizione gratuita: mostriamo il costo normale dalla prop shippingCost */
                    `${shippingCost.toFixed(2)}€`
                  )}
                </span>
              </div>
              
              {/* Riga totale */}
              {/* todo: Totale finale = subtotale + spese spedizione (già calcolato in Shop.jsx) */}
              <div className="summary-row total-row">
                <span className="total-label">Totale</span>
                {/* todo: totalAmount arriva come prop e contiene già il calcolo finale */}
                <span className="total-value">{totalAmount.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* PULSANTI AZIONE */}
          <div className="form-actions">
            <PaymentButton 
              totalAmount={totalAmount} 
              cartItems={cartItems}
              formData={formData}
              onClose={onClose}
            />
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}
