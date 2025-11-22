//todo: Importiamo React e useState per creare componenti e gestire stati
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//todo: Importiamo il CSS del componente Shop per lo stile
import "../styles/pages/Shop.css";

//todo: Importiamo gli stili delle card
import "../styles/components/cardExp.css";

//todo: Importiamo le API per gestire prodotti e carretto
import { productsAPI, cartAPI, emitCartUpdate } from "../services/api";

//todo: Importiamo il componente ProductCard
import ProductCard from "../components/common/ProductCard";

//todo: Importiamo il componente CheckoutForm
import CheckoutForm from "../components/shop/CheckoutForm";

//todo: Importiamo il componente ShopComponent per i filtri
import ShopComponent from "../components/shop/ShopComponent";

//todo: Importiamo SearchSortBar per la barra di ricerca
import SearchSortBar from "../components/shop/SearchSortBar";

//todo: Importiamo il componente FreeShippingBanner per la spedizione gratuita
import FreeShippingBanner from "../components/shop/FreeShippingBanner";

//todo: Creo il componente principale Shop
const Shop = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState("shop");
  const [viewMode, setViewMode] = useState("grid");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // SEARCH
  const [searchValue, setSearchValue] = useState('');

  // ORDINAMENTO
  const [sortValue, setSortValue] = useState('recent');

  // FILTRI
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 100, current: 100 },
    categories: [],
    matureContent: false,
    onSale: false
  });

  const [visibleProducts, setVisibleProducts] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // CARICA PRODOTTI
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();

        const mapped = data.map((p, index) => ({
          ...p,
          originalIndex: index,
          category:
            p.category_id === 1 ? "film" :
            p.category_id === 2 ? "series" :
            p.category_id === 3 ? "anime" : "film"
        }));

        setProducts(mapped);
      } catch (error) {
        console.error('Errore caricamento prodotti:', error);
        showNotification('Errore nel caricamento dei prodotti', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // CARRELLO
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
      emitCartUpdate();
    } catch {
      console.error('Errore caricamento carrello');
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdate', handleCartUpdate);
    return () => window.removeEventListener('cartUpdate', handleCartUpdate);
  }, []);

  const addToCart = async (product) => {
    try {
      const existed = cart.find(item => item.id === product.id);
      await cartAPI.add(product.id, 1);
      await loadCart();

      showNotification(
        existed
          ? `Quantità di "${product.name}" aumentata!`
          : `"${product.name}" aggiunto al carretto!`
      );

    } catch {
      showNotification('Errore aggiunta al carrello', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const prod = cart.find(i => i.id === productId);
      await cartAPI.remove(productId);
      await loadCart();
      if (prod) showNotification(`"${prod.name}" rimosso!`, 'error');
    } catch {
      showNotification('Errore rimozione', 'error');
    }
  };

  const decreaseQuantity = async (productId) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    if (item.quantity === 1) return removeFromCart(productId);

    await cartAPI.update(productId, item.quantity - 1);
    await loadCart();
  };

  const increaseQuantity = async (productId) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    await cartAPI.update(productId, item.quantity + 1);
    await loadCart();
  };

  // FILTRI + SEARCH
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // SEARCH
    if (searchValue.trim() !== "") {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // PREZZO
    filtered = filtered.filter(p =>
      parseFloat(p.price) <= filters.priceRange.current
    );

    // CATEGORIE
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p =>
        filters.categories.includes(p.category)
      );
    }

    // +18
    if (filters.matureContent) {
      filtered = filtered.filter(p => (parseInt(p.min_age) || 0) >= 18);
    }

    // SCONTO
    if (filters.onSale) {
      filtered = filtered.filter(p => (parseFloat(p.discount) || 0) > 0);
    }

    // ORDINAMENTO
    switch (sortValue) {
      case "price-asc":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const loadMoreProducts = () => setVisibleProducts(prev => prev + 10);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  const applyPromoCode = () => {
    if (promoCode.trim().toUpperCase() === 'WELCOMEQUEST') {
      if (!promoApplied) {
        setPromoApplied(true);
        setPromoMessage('✓ Codice applicato, spedizione gratuita!');
        showNotification('Codice applicato!', 'success');
      } else {
        setPromoMessage('⚠ Codice già applicato.');
      }
    } else {
      setPromoMessage('✗ Codice non valido.');
      setPromoApplied(false);
    }
  };

  return (
    <div className="shop-ui-container">

      {/* NOTIFICHE */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button className="notification-close" onClick={() => setNotification(null)}>✕</button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${showFilters ? 'collapsed' : ''}`}>
        <div className="logo-box">
          <div className="icon"></div>
          <h1 className="title">MyPocket<span>Quest</span></h1>
          <p className="subtitle">Next Level: Real Life</p>
        </div>

        <div className="menu">
          <button className={activeTab === "shop" ? "menu-btn active" : "menu-btn"} onClick={() => setActiveTab("shop")}>Shop</button>
          <button className={activeTab === "cart" ? "menu-btn active" : "menu-btn"} onClick={() => setActiveTab("cart")}>
            Carretto ({cart.length})
          </button>
          <button className={activeTab === "checkout" ? "menu-btn active" : "menu-btn"} onClick={() => setActiveTab("checkout")}>Checkout</button>
        </div>
      </aside>

      {/* 🔥 FILTRI */}
      {showFilters && (
        <div className="filters-panel">
          <ShopComponent
            products={products}
            filters={filters}
            onFiltersChange={setFilters}

            /* 🔥 NECESSARIO PER LA SEARCH */
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="content">

        {/* SHOP SECTION */}
        {activeTab === "shop" && (
          <div className="shop-section">

            {/* VIEW + SEARCH + SORT */}
            <div className="view-controls">
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={viewMode === "grid" ? "view-btn active" : "view-btn"} onClick={() => setViewMode("grid")}>⊞</button>
                <button className={viewMode === "list" ? "view-btn active" : "view-btn"} onClick={() => setViewMode("list")}>☰</button>
                <button className={showFilters ? "view-btn active" : "view-btn"} onClick={() => setShowFilters(!showFilters)}>⚙ Filtri</button>
              </div>

              <SearchSortBar
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                sortValue={sortValue}
                onSortChange={setSortValue}
              />
            </div>

            {loading ? (
              <div className="loading-container">
                <p>Caricamento prodotti...</p>
              </div>
            ) : (
              <>
                <div className={`products products-${viewMode}`}>
                  {getFilteredAndSortedProducts()
                    .slice(0, visibleProducts)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        variant={viewMode === "grid" ? "grid" : "compact"}
                        onViewDetails={(slug) => navigate(`/details/${slug}`)}
                        onAddToCart={addToCart}
                        showActions={true}
                      />
                    ))}
                </div>

                {visibleProducts <
                  getFilteredAndSortedProducts().length && (
                  <div className="load-more-container">
                    <button className="load-more-btn" onClick={loadMoreProducts}>
                      Carica altri 10 prodotti
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CART SECTION */}
        {activeTab === "cart" && (
          <div className="cart-section">
            <h2 className="section-title">Carretto</h2>

            {cart.length > 0 && (
              <FreeShippingBanner
                subtotal={cart.reduce((sum, item) =>
                  sum + (parseFloat(item.price) * item.quantity), 0)}
                threshold={40}
                promoApplied={promoApplied}
              />
            )}

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Il carretto è vuoto.</p>
                <p>Vai al Shop per aggiungere prodotti!</p>
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
                        <button onClick={() => decreaseQuantity(item.id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item.id)}>+</button>
                      </div>

                      <div className="item-total">
                        <span className="total-price">
                          {(price * item.quantity).toFixed(2)}€
                        </span>
                        <button onClick={() => removeFromCart(item.id)}>
                          Rimuovi
                        </button>
                      </div>

                    </div>
                  );
                })}

                <div className="cart-total">
                  <strong>
                    Totale Carrello:{" "}
                    {cart.reduce((sum, item) =>
                      sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)}€
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHECKOUT SECTION */}
        {activeTab === "checkout" && (
          <div className="checkout-section">
            <h2 className="section-title">Checkout</h2>

            {cart.length === 0 ? (
              <div className="empty-checkout">
                <p>Il carretto è vuoto.</p>
                <p>Aggiungi prodotti per procedere.</p>
                <img src="/public/icon/InShop.png" alt="empty" />
              </div>
            ) : (
              <>
                <div className="checkout-items">
                  <h3 className="checkout-subtitle">Riepilogo Ordine:</h3>

                  {cart.map((item) => {
                    const price = parseFloat(item.price);
                    return (
                      <div key={item.id} className="checkout-item">
                        <div className="checkout-item-info">
                          <span>{item.name}</span>
                          <span>{item.quantity} x {price.toFixed(2)}€</span>
                        </div>
                        <div className="checkout-item-actions">
                          <span>{(price * item.quantity).toFixed(2)}€</span>
                          <button onClick={() => removeFromCart(item.id)}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="promo-code-section">
                  <h3>Codice Promozionale:</h3>
                  <div className="promo-code-input-group">
                    <input
                      type="text"
                      className="promo-code-input"
                      placeholder="WELCOMEQUEST"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <button
                      className="promo-code-btn"
                      onClick={applyPromoCode}
                      disabled={promoApplied}
                    >
                      {promoApplied ? "Applicato" : "Applica"}
                    </button>
                  </div>

                  {promoMessage && (
                    <p className={`promo-message ${promoApplied ? 'success' : 'error'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                <div className="checkout-summary">
                  {(() => {
                    const subtotal = cart.reduce((sum, item) =>
                      sum + (parseFloat(item.price) * item.quantity), 0);

                    const isFreeShipping = subtotal >= 40 || promoApplied;
                    const shippingCost = isFreeShipping ? 0 : 4.99;
                    const total = subtotal + shippingCost;

                    return (
                      <>
                        <div className="checkout-total">
                          <div className="checkout-subtotal">
                            <span>Subtotale:</span>
                            <span>{subtotal.toFixed(2)}€</span>
                          </div>
                          <div className="checkout-shipping">
                            <span>Spedizione:</span>
                            <span className={isFreeShipping ? 'free-shipping' : ''}>
                              {isFreeShipping ? (
                                <>
                                  <span style={{ textDecoration: 'line-through', color: '#999' }}>4.99€</span>
                                  {' '}
                                  <span style={{ color: '#4ade80' }}>GRATIS</span>
                                </>
                              ) : (
                                "4.99€"
                              )}
                            </span>
                          </div>
                          <div className="checkout-total-final">
                            <h3>Totale:</h3>
                            <h3>{total.toFixed(2)}€</h3>
                          </div>
                        </div>

                        <FreeShippingBanner
                          subtotal={subtotal}
                          threshold={40}
                          promoApplied={promoApplied}
                        />

                        <div className="checkout-actions">
                          {isFreeShipping && (
                            <img
                              src="/icon/FreeShipping.png"
                              alt="free"
                              className="free-shipping-icon"
                            />
                          )}

                          <button
                            className="clear-cart-btn"
                            onClick={() => {
                              const itemCount = cart.length;
                              setCart([]);
                              showNotification(`Carretto svuotato! (${itemCount} prodotti)`, 'error');
                            }}
                          >
                            Svuota Carretto
                          </button>

                          <button
                            className="confirm-btn"
                            onClick={() => setShowCheckoutForm(true)}
                          >
                            Conferma Acquisto
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        )}

      </main>

      {/* OVERLAY CHECKOUT */}
      {showCheckoutForm && (() => {
        const subtotal = cart.reduce((sum, item) =>
          sum + (parseFloat(item.price) * item.quantity), 0);

        const isFreeShipping = subtotal >= 40 || promoApplied;
        const shippingCost = isFreeShipping ? 0 : 4.99;
        const totalAmount = subtotal + shippingCost;

        return (
          <CheckoutForm
            onClose={() => setShowCheckoutForm(false)}
            totalAmount={totalAmount}
            cartItems={cart}
            shippingCost={shippingCost}
            isFreeShipping={isFreeShipping}
          />
        );
      })()}
    </div>
  );
};

export default Shop;
