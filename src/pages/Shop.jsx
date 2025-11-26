import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
import Pagination from "../components/shop/Pagination";

const Shop = ({ defaultTab = "shop" }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mountedRef = useRef(false);
  const itemsPerPageInitRef = useRef(false);

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
    priceRange: { min: 0, max: 200 },
    categories: [],
    matureContent: false,
    accessibility: false,
    onSale: false,
  });

  // Stato per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // helper: whether current filters/search returned no products
  const noProducts = !loading && Array.isArray(products) && products.length === 0;

  const resetFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 200 },
      categories: [],
      matureContent: false,
      accessibility: false,
      onSale: false,
    });
    setSearchValue("");
    setSortValue("recent");
    setItemsPerPage(10);
    setCurrentPage(1);
    loadProducts(1, true);
  };

  const [notification, setNotification] = useState(null);

  // Inizializza lo stato dei filtri dalla query string (se presente)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q") || "";
    const sort = params.get("sort") || "recent";
    const page = parseInt(params.get("page")) || 1;
    const limit = parseInt(params.get("limit")) || 10;

    const priceMin = params.get("priceMin");
    const priceMax = params.get("priceMax");
    const categories = params.get("categories");

    const onSale = params.get("onSale") === "1";
    const matureContent = params.get("matureContent") === "1";
    const accessibility = params.get("accessibility") === "1";

    setSearchValue(q);
    setSortValue(sort);
    setItemsPerPage(limit);
    setCurrentPage(page);

    setFilters((prev) => ({
      ...prev,
      priceRange: {
        min: priceMin !== null ? parseFloat(priceMin) : prev.priceRange.min,
        max: priceMax !== null ? parseFloat(priceMax) : prev.priceRange.max,
      },
      categories: categories ? categories.split(",").filter(Boolean) : prev.categories,
      onSale,
      matureContent,
      accessibility,
    }));

    // Carica i prodotti in base alla pagina trovata nella query string
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const loadProducts = async (page = 1, resetPage = false) => {
    try {
      setLoading(true);
      
      // Se resetPage è true, usa la pagina 1, altrimenti usa la pagina passata
      const targetPage = resetPage ? 1 : page;
      
      const options = {
        page: targetPage,
        limit: itemsPerPage,
        search: searchValue,
        sortBy: sortValue,
        priceMin: filters.priceRange.min,
        priceMax: filters.priceRange.max,
        onSale: filters.onSale,
        matureContent: filters.matureContent,
        accessibility: filters.accessibility
      };
      
      // Gestione filtro categorie - supporta multiple categorie
      if (filters.categories.length > 0) {
        const categoryMap = { "film": 1, "series": 2, "anime": 3 };
        // Per ora prendiamo solo la prima categoria (limitazione API)
        const categoryId = categoryMap[filters.categories[0]];
        if (categoryId) options.categoryId = categoryId;
      }

      const data = await productsAPI.getAll(options);
      
      const mapped = data.products.map((p) => ({
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
      setPagination(data.pagination);
      
      if (resetPage) {
        setCurrentPage(1);
      } else {
        setCurrentPage(targetPage);
      }
      
    } catch (error) {
      console.error('Errore caricamento prodotti:', error);
      showNotification("Errore caricamento prodotti", "error");
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    // Evita il doppio caricamento iniziale: la prima esecuzione viene
    // ignorata perché i prodotti sono già stati caricati dal parser della query string.
    if (!itemsPerPageInitRef.current) {
      itemsPerPageInitRef.current = true;
      return;
    }

    loadProducts(1);
  }, [itemsPerPage]); // Ricarica quando cambia items per pagina

  const [cart, setCart] = useState([]);

  // Effetti per ricaricare i prodotti quando cambiano i filtri
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(1, true); // Reset alla pagina 1 quando cambiano i filtri
    }, 300); // Debounce di 300ms
    
    return () => clearTimeout(timeoutId);
  }, [filters, searchValue, sortValue]);

  // Sync activeTab with defaultTab prop when route changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Aggiorna la query string ogni volta che cambiano parametri rilevanti
  useEffect(() => {
    // Evita di aggiornare subito durante il mount iniziale (abbiamo già parsato la URL)
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const params = new URLSearchParams();

    if (searchValue) params.set("q", searchValue);
    if (sortValue) params.set("sort", sortValue);
    if (currentPage) params.set("page", String(currentPage));
    if (itemsPerPage) params.set("limit", String(itemsPerPage));

    params.set("priceMin", String(filters.priceRange.min));
    params.set("priceMax", String(filters.priceRange.max));

    if (filters.categories && filters.categories.length > 0)
      params.set("categories", filters.categories.join(","));

    params.set("onSale", filters.onSale ? "1" : "0");
    params.set("matureContent", filters.matureContent ? "1" : "0");
    params.set("accessibility", filters.accessibility ? "1" : "0");

    setSearchParams(params, { replace: true });
  }, [filters, searchValue, sortValue, currentPage, itemsPerPage, setSearchParams]);

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
      toast.error("Errore aggiunta al carretto");
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
      } catch (err) { void err; }
    } catch (error) {
      logError("Errore nell'aumentare la quantità", error);
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const item = cart.find((i) => i.id === productId);
      // guard: if item not found locally, refresh cart and bail out
      if (!item) {
        toast.error('Elemento non trovato nel carretto. Aggiorno la vista...');
        await fetchCart();
        emitCartUpdate();
        return;
      }

      if (item.quantity > 1) {
        await cartAPI.decrease(productId);
        // emit remove action for decrement
        try { const name = item?.name || 'Prodotto'; emitCartAction('remove', { id: productId, name }); } catch (err) { void err; }
      } else {
        await cartAPI.remove(productId);
        const name = item?.name || 'Prodotto';
        emitCartAction('remove', { id: productId, name });
      }
      await fetchCart();
      emitCartUpdate();
    } catch (error) {
      logError("Errore nel diminuire la quantità", error);
      // show a user-friendly message when removal fails
      try {
        toast.error(error?.message || 'Errore nel diminuire la quantità');
      } catch (err) { void err; }
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
        toast.error(`"${name}" rimosso dal carretto`);
      }
      emitCartUpdate();
    } catch {
      toast.error("Errore rimozione");
    }
  };

  // Gestori per la paginazione
  const handlePageChange = (newPage) => {
    loadProducts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // loadProducts sarà chiamato automaticamente dall'useEffect che monitora itemsPerPage
  };

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
        title: 'Svuotare il carretto?',
        text: 'Questa azione rimuoverà tutti i prodotti presenti nel carretto.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Svuota carretto',
        cancelButtonText: 'Annulla',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'swal-dark-popup',
          title: 'swal-dark-title',
          content: 'swal-dark-content',
          confirmButton: 'swal-dark-confirm',
          cancelButton: 'swal-dark-cancel'
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
            <div class="swal-check-label">Carretto svuotato</div>
          </div>
        `,
        timer: 1400,
        showConfirmButton: false,
        customClass: { popup: 'swal-dark-popup' },
        didOpen: (popup) => {
          const icon = popup.querySelector('.swal-check-icon');
          if (icon) setTimeout(() => icon.classList.add('animate'), 40);
        }
      });
      
      
      } catch (err) {
      logError('Errore svuotamento carrello', err);
      try { toast.error('Errore durante lo svuotamento del carretto'); } catch (err) { void err; }
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
          <div className="sidebar-search" style={{ margin: '18px 0' }}>
            <label htmlFor="aside-search" className="sr-only">Cerca prodotti</label>
            <div className="search-in-filters" role="search" aria-label="Cerca prodotti">
              <span className="search-icon" aria-hidden>🔎</span>
              <input
                id="aside-search"
                className="search-input"
                type="search"
                placeholder="Cerca..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="Cerca prodotti"
              />
            </div>
          </div>

          
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
            Carretto ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>

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
            onResetFilters={resetFilters}
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
            ) : noProducts ? (
              <div className="no-cards-page">
                <div className="no-cards-inner">
                  <h1>Nessuna card trovata</h1>
                  <p>Non abbiamo trovato prodotti che corrispondono ai filtri selezionati.</p>
                  <p>Prova ad azzerare i filtri o cerca con parole diverse.</p>
                  <div style={{ marginTop: 18 }}>
                    <button className="load-more-btn" onClick={resetFilters}>Azzera filtri</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={`products products-${viewMode}`}>
                  {products.map((p) => {
                    return (
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
                          window.dispatchEvent(new CustomEvent("wishlistUpdate", { detail: { action, product } } ));

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
                    );
                  })}
                </div>

                {/* Componente di paginazione */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={itemsPerPage}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 20, 50]}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "cart" && (
          <div className="cart-section">
            <h2 className="section-title-shop">Carretto</h2>

            {cart.length > 0 && (
              <FreeShippingBanner subtotal={subtotal} threshold={40} promoApplied={false} />
            )}

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Il carretto è vuoto.</p>
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
                  <strong>Totale Carretto: {subtotal.toFixed(2)}€</strong>
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
