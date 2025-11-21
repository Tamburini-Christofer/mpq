import '../../styles/components/NavBar.css'
import { NavLink } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { cartAPI } from '../../services/api';

function NavBar() {
  //todo Stato per contare prodotti in wishlist (rimane localStorage)
  const [wishlistCount, setWishlistCount] = useState(0);
  //todo Stato per contare prodotti nel carrello (da API)
  const [cartCount, setCartCount] = useState(0);
  
  //todo Carica conteggio wishlist e carrello al mount
  useEffect(() => {
    updateWishlistCount();
    updateCartCount();
    
    //todo Listener per aggiornare quando cambia wishlist o carrello
    window.addEventListener('wishlistUpdate', updateWishlistCount);
    window.addEventListener('storage', updateWishlistCount);
    window.addEventListener('cartUpdate', updateCartCount);
    
    return () => {
      window.removeEventListener('wishlistUpdate', updateWishlistCount);
      window.removeEventListener('storage', updateWishlistCount);
      window.removeEventListener('cartUpdate', updateCartCount);
    };
  }, []);
  
  //todo Aggiorna conteggio prodotti wishlist (rimane localStorage)
  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };
  
  //todo Aggiorna conteggio prodotti carrello (da API)
  const updateCartCount = async () => {
    try {
      const cart = await cartAPI.get();
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Errore caricamento carrello:', error);
      setCartCount(0);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <NavLink to="/">
            <img src="./src/img/Logo_no_bg.png" alt="Logo" className="logo-icon" />
          </NavLink>
        </div>

        <ul className="navbar-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
          {/* <li><NavLink to="/categories">Categories</NavLink></li> */}
          <li><NavLink to="/staff">Staff</NavLink></li>
          <li><NavLink to="/contatti">Assistenza</NavLink></li>
        </ul>

        <div className="navbar-actions">
          <NavLink to="/wishlist" className="wishlist-icon-link">
            <span className="wishlist-icon">
              <FaHeart />
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </span>
          </NavLink>
          
          <NavLink to="/shop?tab=cart" className="cart-icon-link">
            <span className="cart-icon">
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </span>
          </NavLink>

          <button className="btn-levelup">Level Up!</button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;