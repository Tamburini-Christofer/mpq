import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/pages/Shop.css";
import "../styles/components/cardExp.css";

import { productsAPI, cartAPI, emitCartUpdate } from "../services/api";

import ProductCard from "../components/common/ProductCard";
import CheckoutForm from "../components/shop/CheckoutForm";
import ShopComponent from "../components/shop/ShopComponent";
import SearchSortBar from "../components/shop/SearchSortBar";
import FreeShippingBanner from "../components/shop/FreeShippingBanner";

const Shop = ({ defaultTab = "shop" }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [viewMode, setViewMode] = useState("grid");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [sortValue, setSortValue] = useState("recent");

  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 200, current: 200 },
    categories: [],
    matureContent: false,
    onSale: false,
  });

  const [visibleProducts, setVisibleProducts] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();

        const mapped = data.map((p) => ({
          ...p,
          category:
            p.category_id === 1
              ? "film"
              : p.category_id === 2
              ? "series"
              : p.category_id === 3
              ? "anime"
              : "film",
        }));

        setProducts(mapped);
      } catch {
        showNotification("Errore caricamento prodotti", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
      emitCartUpdate();
      return data;
    } catch {
      return cart;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1);
      const updatedCart = await fetchCart();

      showNotification(`"${product.name}" aggiunto al carrello!`);
      return updatedCart.find((i) => i.id === product.id)?.quantity || 0;
    } catch {
      showNotification("Errore aggiunta al carrello", "error");
      return 0;
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const currentItem = cart.find((i) => i.id === productId);
      if (!currentItem) return 0;

      if (currentItem.quantity <= 1) {
        await cartAPI.remove(productId);
        await fetchCart();
        return 0;
      }

      const newQty = currentItem.quantity - 1;
      await cartAPI.update(productId, newQty);
      const updatedCart = await fetchCart();
      return updatedCart.find((i) => i.id === productId)?.quantity || 0;
    } catch {
      return cart.find((i) => i.id === productId)?.quantity || 0;
    }
  };

  const increaseQuantity = async (productId) => {
    try {
      const currentItem = cart.find((i) => i.id === productId);
      const newQty = (currentItem?.quantity || 0) + 1;

      await cartAPI.update(productId, newQty);
      const updatedCart = await fetchCart();
      return updatedCart.find((i) => i.id === productId)?.quantity || 0;
    } catch {
      return cart.find((i) => i.id === productId)?.quantity || 0;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      showNotification("Prodotto rimosso", "error");
    } catch {
      showNotification("Errore rimozione", "error");
    }
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    if (searchValue.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (p) =>
        parseFloat(p.price) >= filters.priceRange.min &&
        parseFloat(p.price) <= filters.priceRange.max
    );

    if (filters.categories.length > 0) {
      filtered = filtered.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.matureContent) {
      filtered = filtered.filter((p) => (parseInt(p.min_age) || 0) >= 18);
    }

    if (filters.onSale) {
      filtered = filtered.filter((p) => parseFloat(p.discount) > 0);
    }

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

  const loadMoreProducts = () => setVisibleProducts((prev) => prev + 10);

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
    <div className="shop-ui-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : "ℹ"}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <aside className={`sidebar ${showFilters ? "collapsed" : ""}`}>
        <div className="logo-box">
          <div className="icon"></div>
          <h1 className="title">
            MyPocket<span>Quest</span>
          </h1>
          <p className="subtitle">Next Level: Real Life</p>
        </div>

        <div className="menu">
          <button
            className={activeTab === "shop" ? "menu-btn active" : "menu-btn"}
            onClick={() => {
              setActiveTab("shop");
              navigate("/shop");
            }}
          >
            Shop
          </button>

          <button
            className={activeTab === "cart" ? "menu-btn active" : "menu-btn"}
            onClick={() => {
              setActiveTab("cart");
              navigate("/shop/cart");
            }}
          >
            Carrello ({cart.length})
          </button>

          <button
            className={activeTab === "checkout" ? "menu-btn active" : "menu-btn"}
            onClick={() => {
              setActiveTab("checkout");
              navigate("/shop/checkout");
            }}
          >
            Checkout
          </button>
        </div>
      </aside>

      {showFilters && (
        <div className="filters-panel">
          <ShopComponent
            filters={filters}
            onFiltersChange={setFilters}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />
        </div>
      )}

      <main className="content">
        {activeTab === "shop" && (
          <div className="shop-section">
            <div className="view-controls">
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className={viewMode === "grid" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("grid")}
                >
                  ⊞
                </button>
                <button
                  className={viewMode === "list" ? "view-btn active" : "view-btn"}
                  onClick={() => setViewMode("list")}
                >
                  ☰
                </button>
                <button
                  className={showFilters ? "view-btn active" : "view-btn"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  ⚙ Filtri
                </button>
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
                        product={{
                          ...p,
                          cartQty: cart.find((c) => c.id === p.id)?.quantity || 0,
                        }}
                        variant={viewMode === "grid" ? "grid" : "compact"}
                        onViewDetails={(slug) => navigate(`/details/${slug}`)}
                        onAddToCart={addToCart}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        cart={cart}
                      />
                    ))}
                </div>

                {visibleProducts < getFilteredAndSortedProducts().length && (
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

        {activeTab === "cart" && (
          <div className="cart-section">
            <h2 className="section-title-shop">Carrello</h2>

            {cart.length > 0 && (
              <FreeShippingBanner subtotal={subtotal} threshold={40} promoApplied={false} />
            )}

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Il carrello è vuoto.</p>
                <p>Vai allo Shop per aggiungere prodotti!</p>
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
                        <span className="total-price">{(price * item.quantity).toFixed(2)}€</span>
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
        )}

        {activeTab === "checkout" && (
          <div className="checkout-section">
            <h2 className="section-title-shop">Checkout</h2>

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

                <div
                  className="checkout-item"
                  style={{ justifyContent: "space-between" }}
                >
                  <strong className="sub">Subtotale</strong>
                  <strong>{subtotal.toFixed(2)}€</strong>
                </div>

                <div
                  className="checkout-item"
                  style={{ justifyContent: "space-between" }}
                >
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
                    borderTop: "2px solid var(--gold)",
                  }}
                >
                  <strong style={{ color: "var(--gold)", fontSize: "20px" }}>Totale</strong>
                  <strong style={{ color: "var(--gold)", fontSize: "20px" }}>
                    {totalAmount.toFixed(2)}€
                  </strong>
                </div>

                <div className="checkout-actions">
                  <button className="confirm-btn" onClick={() => setShowCheckoutForm(true)}>
                    Procedi al Pagamento
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

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
};

export default Shop;
