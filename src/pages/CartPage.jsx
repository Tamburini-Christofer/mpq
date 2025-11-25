import React, { useEffect, useState } from "react";
import "../styles/pages/CartPage.css";

import { cartAPI, emitCartUpdate } from "../services/api";
import { logAction } from '../utils/logger';
import ACTIONS from '../utils/actionTypes';
import { toast } from 'react-hot-toast';
import FreeShippingBanner from "../components/shop/FreeShippingBanner";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notifications handled via react-hot-toast

  // CARICA CARRELLO
  const loadCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
    } catch {
      toast.error("Errore caricamento carrello");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // OPERAZIONI CARRELLO
  const removeFromCart = async (id) => {
    try {
      await cartAPI.remove(id);
      loadCart();
      emitCartUpdate();
      const name = cart.find(i => i.id === id)?.name || 'Prodotto';
      try {
        window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'remove', product: { id, name } } }));
        logAction(ACTIONS.CART_REMOVE, { id, name });
      } catch {
        toast.error(`"${name}" rimosso dal carrello`);
      }
    } catch {
      toast.error("Errore rimozione");
    }
  };

  const increaseQuantity = async (id) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    await cartAPI.update(id, item.quantity + 1);
    loadCart();
    emitCartUpdate();
    try {
      const name = cart.find(i => i.id === id)?.name || 'Prodotto';
      window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'add', product: { id, name } } }));
      logAction(ACTIONS.CART_ADD, { id, name });
    } catch (err) { void err; }
  };

  const decreaseQuantity = async (id) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity === 1) {
      removeFromCart(id);
      return;
    }

    await cartAPI.update(id, item.quantity - 1);
    loadCart();
    emitCartUpdate();
    try {
      const name = cart.find(i => i.id === id)?.name || 'Prodotto';
      window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'remove', product: { id, name } } }));
      logAction(ACTIONS.CART_REMOVE, { id, name });
    } catch (err) { void err; }
  };

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
    <div className="cart-section">

      

      <h2 className="section-title">Carrello</h2>

      {/* BANNER SPEDIZIONE */}
      {cart.length > 0 && (
        <FreeShippingBanner
          subtotal={subtotal}
          threshold={SHIPPING_THRESHOLD}
        />
      )}

      {/* CARRELLO VUOTO */}
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Il carrello è vuoto.</p>
          <p>Aggiungi prodotti per procedere!</p>
          <img src="/public/icon/EmptyShop.png" alt="empty" />
        </div>
      ) : (
        <div className="cart-items">
          {cart.map((item) => {
            const price = parseFloat(item.price);
            return (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{price.toFixed(2)}€</span>
                </div>

                <div className="quantity-controls">
                  <button className="quantity-btn-c" onClick={() => decreaseQuantity(item.id)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button className="quantity-btn-c" onClick={() => increaseQuantity(item.id)}>
                    +
                  </button>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    {(price * item.quantity).toFixed(2)}€
                  </span>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    Rimuovi
                  </button>
                </div>
              </div>
            );
          })}

          <div className="cart-total">
            <strong>Totale Carrello: {subtotal.toFixed(2)}€</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
