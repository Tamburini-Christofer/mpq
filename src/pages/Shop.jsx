import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/pages/Shop.css";
import "../styles/components/cardExp.css";

import { productsAPI, cartAPI, emitCartUpdate, emitCartAction } from "../services/api";
import { logAction, error as logError } from '../utils/logger';
import ACTIONS from '../utils/actionTypes';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import ProductCard from "../components/common/ProductCard";
import CheckoutForm from "../components/shop/CheckoutForm";
import CheckoutPage from "./CheckoutPage";
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
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const [checkoutJustEnabled, setCheckoutJustEnabled] = useState(false);
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
      } catch (err) {
        logError('Errore caricamento prodotti', err);
        toast.error("Errore caricamento prodotti");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
    } catch (err) {
      logError('Errore nel fetch del carrello', err);
    }
  };

  // Make checkout available automatically when cart has items;
  // Keep checkout hidden by default. Only enable it when the user
  // explicitly clicks "Procedi al checkout". However, if the cart
  // becomes empty, always disable the checkout entry and navigate
  // away from the checkout view if currently active.
  useEffect(() => {
    const isEmpty = !cart || cart.length === 0;
    if (isEmpty) {
      if (checkoutAvailable) setCheckoutAvailable(false);
      if (activeTab === 'checkout') {
        setActiveTab('shop');
        navigate('/shop');
      }
    }
    // otherwise do nothing: do NOT auto-enable checkout just because
    // there are items — enablement happens when clicking the button.
  }, [cart]);

  useEffect(() => {
    fetchCart();
    const handler = (e) => {
      if (e && e.detail && e.detail.cart) {
        setCart(e.detail.cart);
      } else {
        fetchCart();
      }
    };
    window.addEventListener('cartUpdate', handler);
    // listener per chiudere sidebar/mobile menu quando altre parti dell'app richiedono la navigazione
    const closeHandler = () => {
      setShowFilters(false);
      // ensure checkout becomes available when triggered from other components
      setCheckoutAvailable(true);
      setCheckoutJustEnabled(true);
      setTimeout(() => setCheckoutJustEnabled(false), 420);
      setActiveTab('checkout');
      // scroll to top so checkout is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('closeSidebar', closeHandler);
    const checkoutClosedHandler = () => {
      setCheckoutAvailable(false);
      setActiveTab('shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('checkoutClosed', checkoutClosedHandler);
    return () => {
      window.removeEventListener('cartUpdate', handler);
      window.removeEventListener('closeSidebar', closeHandler);
      window.removeEventListener('checkoutClosed', checkoutClosedHandler);
    };
  }, []);

  // when switching to checkout tab, scroll smoothly to the checkout section
  useEffect(() => {
    if (activeTab === 'checkout') {
      // wait a tick so the checkout section is rendered
      setTimeout(() => {
        const el = document.querySelector('.checkout-section');
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
    }
  }, [activeTab]);

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1);
      await fetchCart();
      emitCartUpdate();
      // central notification
      emitCartAction('add', { id: product.id, name: product.name });
    } catch (error) {
      logError('Errore aggiunta al carrello', error);
      toast.error("Errore aggiunta al carrello");
    }
  };

  const increaseQuantity = async (productId) => {
    try {
      await cartAPI.increase(productId);
      await fetchCart();
      emitCartUpdate();
      // centralized notification for plus action
      try {
        const name = cart.find((i) => i.id === productId)?.name || 'Prodotto';
        emitCartAction('add', { id: productId, name });
      } catch {}
    } catch (error) {
      logError("Errore nell'aumentare la quantità", error);
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const item = cart.find((i) => i.id === productId);
      if (item && item.quantity > 1) {
        await cartAPI.decrease(productId);
        // emit remove action for decrement
        try { const name = item?.name || 'Prodotto'; emitCartAction('remove', { id: productId, name }); } catch {}
      } else {
        await cartAPI.remove(productId);
        const name = item?.name || 'Prodotto';
        emitCartAction('remove', { id: productId, name });
      }
      await fetchCart();
      emitCartUpdate();
    } catch (error) {
      logError("Errore nel diminuire la quantità", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      const name = cart.find((i) => i.id === productId)?.name || "Prodotto";
      try {
        window.dispatchEvent(new CustomEvent('cartAction', { detail: { action: 'remove', product: { id: productId, name } } }));
        logAction(ACTIONS.CART_REMOVE_NAVBAR, { id: productId, name });
      } catch {
        toast.error(`"${name}" rimosso dal carrello`);
      }
      emitCartUpdate();
    } catch {
      toast.error("Errore rimozione");
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

  const handleCancelOrder = async () => {
    try {
      const result = await Swal.fire({
        title: 'Svuotare il carrello?',
        text: 'Questa azione rimuoverà tutti i prodotti presenti nel carrello.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Svuota carrello',
        cancelButtonText: 'Annulla',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'swal-wishlist-popup',
          confirmButton: 'swal-wishlist-confirm',
          cancelButton: 'swal-wishlist-cancel'
        }
      });

      if (!result.isConfirmed) return;

      await cartAPI.clear();
      emitCartUpdate();
      await fetchCart();
      setShowCheckoutForm(false);
      // hide checkout entry after cancelling the order
      setCheckoutAvailable(false);
      setActiveTab('shop');

      await Swal.fire({
        html: `
          <div class="swal-check-wrap">
            <div class="swal-check-icon" aria-hidden="true">✓</div>
            <div class="swal-check-label">Carrello svuotato</div>
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

      navigate("/shop");
    } catch (err) {
      logError('Errore annullamento ordine', err);
    }
  };

  return (
    <div className="shop-ui-container">
      

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
            Carrello ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>

          {/* show Checkout menu only when checkoutAvailable is true */}
          {checkoutAvailable && (
            <button
              className={`${activeTab === "checkout" ? "menu-btn active" : "menu-btn"} ${checkoutJustEnabled ? 'menu-btn-enter' : ''}`}
              onClick={() => {
                setActiveTab("checkout");
                navigate("/shop/checkout");
              }}
            >
              Checkout
            </button>
          )}
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
                          isInWishlist: (JSON.parse(localStorage.getItem("wishlist") || "[]").some(w => w.id === p.id)),
                        }}
                        variant={viewMode === "grid" ? "grid" : "compact"}
                        onViewDetails={(slug) => navigate(`/details/${slug}`)}
                        onAddToCart={handleAddToCart}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        cart={cart}
                        onToggleWishlist={(product) => {
                          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
                          const exists = wishlist.some(w => w.id === product.id);
                          let updated;
                          let action;
                          if (exists) {
                            updated = wishlist.filter(w => w.id !== product.id);
                            action = 'remove';
                          } else {
                            updated = [...wishlist, product];
                            action = 'add';
                          }
                          localStorage.setItem("wishlist", JSON.stringify(updated));
                          // dispatch dettagliato per sincronizzazione
                          window.dispatchEvent(new CustomEvent("wishlistUpdate", { detail: { action, product } } ));
                          // notifica globale (react-hot-toast) - stile wishlist
                          if (action === 'add') {
                            toast.success(`${product.name} aggiunto alla wishlist`, {
                              icon: '🤍',
                              style: { background: '#ef4444', color: '#ffffff' }
                            });
                          } else {
                            toast(`${product.name} rimosso dalla wishlist`, {
                              icon: '❤',
                              style: { background: '#ffffff', color: '#ef4444', border: '1px solid #ef4444' }
                            });
                          }
                        }}
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
                  {cart.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        className="payment-btn"
                        onClick={() => {
                          // enable checkout entry and navigate to it with smooth scroll
                          setCheckoutAvailable(true);
                          setActiveTab('checkout');
                          navigate('/shop/checkout');
                        }}
                      >
                        Procedi al checkout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "checkout" && (
          <div className="checkout-section">
            <CheckoutPage />
          </div>
        )}
      </main>

      {showCheckoutForm && (
        <CheckoutForm
          onClose={() => setShowCheckoutForm(false)}
          onCancelOrder={handleCancelOrder}
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
