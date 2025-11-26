import '../../styles/components/NavBar.css';
import Logo from '../../img/Logo_no_bg.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
import { cartAPI, emitCartUpdate } from '../../services/api';
import { logAction } from '../../utils/logger';
import ACTIONS from '../../utils/actionTypes';
import { toast } from 'react-hot-toast';

function NavBar() {
  const navigate = useNavigate();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [showCartPreview, setShowCartPreview] = useState(false);
  const [animateClose, setAnimateClose] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [loadingItemId, setLoadingItemId] = useState(null);

  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const FALLBACK_IMAGE = "/fallback-product.png";

  const FREE_SHIPPING_THRESHOLD = 40; // soglia per spesa gratuita

  useEffect(() => {
    updateWishlistCount();
    updateCartData();

    window.addEventListener('wishlistUpdate', updateWishlistCount);
    window.addEventListener('storage', updateWishlistCount);
    const handler = (e) => {
      if (e && e.detail && e.detail.cart) {
        try {
          const cart = e.detail.cart;
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
          const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
          setCartCount(totalItems);
          setCartItems(cart);
          setCartTotal(totalPrice.toFixed(2));
        } catch {
          updateCartData();
        }
      } else {
        updateCartData();
      }
    };
    window.addEventListener('cartUpdate', handler);

    return () => {
      window.removeEventListener('wishlistUpdate', updateWishlistCount);
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('cartUpdate', handler);
    };
  }, []);

  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };

  const updateCartData = async () => {
    try {
      const cart = await cartAPI.get();

      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

      setCartCount(totalItems);
      setCartItems(cart);
      setCartTotal(totalPrice.toFixed(2));
    } catch (error) {
      setCartCount(0);
      setCartItems([]);
      setCartTotal(0);
    }
  };

  const closeCartPreview = () => {
    clearTimeout(closeTimer.current);

    closeTimer.current = setTimeout(() => {
      setAnimateClose(true);
      setTimeout(() => {
        setShowCartPreview(false);
        setAnimateClose(false);
      }, 220);
    }, 220);
  };

  const handleHoverOpen = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);

    openTimer.current = setTimeout(() => {
      setShowCartPreview(true);
    }, 180);
  };

  const handleHoverLeave = () => {
    closeCartPreview();
  };

  const increaseQty = async (id) => {
    setLoadingItemId(id);
    try {
      const name = cartItems.find(i => i.id === id)?.name || 'Prodotto';
      await cartAPI.increase(id);
      emitCartUpdate();
      // centralized notification for plus from navbar
        try {
          window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'add', product: { id, name } } }));
          logAction(ACTIONS.CART_ADD_NAVBAR, { id, name });
        } catch {}
    } catch (error) {
      console.error("Errore nell'aumentare la quantità:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (id, qty) => {
    setLoadingItemId(id);
    try {
      if (qty <= 1) {
        await removeItem(id);
      } else {
        const name = cartItems.find(i => i.id === id)?.name || 'Prodotto';
        await cartAPI.decrease(id);
        emitCartUpdate();
        // centralized notification for minus from navbar
        try {
          window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'remove', product: { id, name } } }));
          logAction(ACTIONS.CART_REMOVE_NAVBAR, { id, name });
        } catch {}
      }
    } catch (error) {
      console.error("Errore nel diminuire la quantità:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const removeItem = async (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, removing: true } : item
      )
    );

    setTimeout(async () => {
      await cartAPI.remove(id);
      emitCartUpdate();
      const name = cartItems.find(i => i.id === id)?.name || 'Prodotto';
      // emit centralized remove action so Layout shows a single toast
        try {
        window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'remove', product: { id, name } } }));
        logAction(ACTIONS.CART_REMOVE_NAVBAR, { id, name });
        } catch {
        // fallback: show toast directly if dispatch fails
        toast.error(`"${name}" rimosso dal carrello`);
      }
    }, 250);
  };

  const goToCheckout = () => {
    // close mobile/sidebar menus across the app before navigating
    try {
      window.dispatchEvent(new Event('closeSidebar'));
    } catch {
      // ignore
    }
    navigate("/shop/checkout");
  };

  return (
    <>
      <nav className="navbar navbar-sticky">
        <div className="navbar-logo">
          <NavLink to="/">
            <img src={Logo} alt="Logo" className="logo-icon" />
          </NavLink>
        </div>

        <ul className="navbar-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
          <li><NavLink to="/staff">Staff</NavLink></li>
          <li><NavLink to="/contatti">Assistenza</NavLink></li>
        </ul>

        <div className="navbar-actions">

          <NavLink to="/wishlist" className="wishlist-icon-link">
            <span className="wishlist-icon">
              <FaHeart />
              {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
            </span>
          </NavLink>

          <div
            className="cart-wrapper"
            onMouseEnter={handleHoverOpen}
            onMouseLeave={handleHoverLeave}
          >
            <button className="cart-icon-link">
              <span className="cart-icon">
                <FaShoppingCart />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </span>
            </button>

            {showCartPreview && (
              <div className={`cart-preview ${animateClose ? "closing" : ""}`}>
                <h4>Carrello</h4>

                {cartItems.length === 0 ? (
                  <p className="empty-cart">Il carrello è vuoto.</p>
                ) : (
                  <ul className="cart-preview-list">
                    {cartItems.map(item => (
                      <li
                        key={item.id}
                        className={`cart-preview-item fade-in ${item.removing ? "removing" : ""}`}
                      >
                        <img
                          src={item.image || FALLBACK_IMAGE}
                          onError={(e) => e.target.src = FALLBACK_IMAGE}
                          alt={item.name}
                        />
                        <div className="info">
                          <span>{item.name}</span>
                          <div className="qty-controls">
                            <button
                              className="qty-btn"
                              disabled={loadingItemId === item.id}
                              onClick={() => decreaseQty(item.id, item.quantity)}
                            >
                              {loadingItemId === item.id ? <span className="spinner"></span> : "−"}
                            </button>
                            <span className="qty-number">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              disabled={loadingItemId === item.id}
                              onClick={() => increaseQty(item.id)}
                            >
                              {loadingItemId === item.id ? <span className="spinner"></span> : "+"}
                            </button>
                            <span
                              className="remove-btn"
                              onClick={() => removeItem(item.id)}
                            >
                              Rimuovi
                            </span>
                          </div>
                        </div>
                        <span className="price">{item.price}€</span>
                      </li>
                    ))}
                  </ul>
                )}

                {cartItems.length > 0 && (
                  <div className="cart-total-box">
                    <span>Totale:</span>
                    <strong>{cartTotal}€</strong>
                    {parseFloat(cartTotal) >= FREE_SHIPPING_THRESHOLD && (
                      <div className="free-shipping-text" style={{color: '#4ade80', fontWeight: 'bold', marginTop: '6px'}}>
                        Spesa gratuita!
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="btn-checkout"
                  onClick={goToCheckout}
                >
                  Vai al Checkout
                </button>

              </div>
            )}
          </div>

          
          <button className="btn-levelup">Level Up!</button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
