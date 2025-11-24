import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/pages/Shop.css";
import "../styles/components/cardExp.css";

import { productsAPI, cartAPI, emitCartUpdate } from "../services/api";

import ProductCard from "../components/common/ProductCard";
import CheckoutForm from "../components/shop/CheckoutForm";
import CheckoutPage from "./CheckoutPage";
import ShopComponent from "../components/shop/ShopComponent";
import SearchSortBar from "../components/shop/SearchSortBar";
import FreeShippingBanner from "../components/shop/FreeShippingBanner";
import Pagination from "../components/shop/Pagination";

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

  const [notification, setNotification] = useState(null);

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

  const fetchCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
    } catch {
      console.error("Errore nel fetch del carrello");
    }
  };

  useEffect(() => {
    fetchCart();
    window.addEventListener('cartUpdate', fetchCart);
    return () => window.removeEventListener('cartUpdate', fetchCart);
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await cartAPI.add(product.id, 1);
      await fetchCart();
      emitCartUpdate();
      showNotification(`"${product.name}" aggiunto al carrello!`);
    } catch (error) {
      console.error("Errore aggiunta al carrello:", error);
      showNotification("Errore aggiunta al carrello", "error");
    }
  };

  const increaseQuantity = async (productId) => {
    try {
      await cartAPI.increase(productId);
      await fetchCart();
      emitCartUpdate();
    } catch (error) {
      console.error("Errore nell'aumentare la quantità:", error);
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const item = cart.find((i) => i.id === productId);
      if (item && item.quantity > 1) {
        await cartAPI.decrease(productId);
      } else {
        await cartAPI.remove(productId);
      }
      await fetchCart();
      emitCartUpdate();
    } catch (error) {
      console.error("Errore nel diminuire la quantità:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      showNotification("Prodotto rimosso", "error");
      emitCartUpdate();
    } catch {
      showNotification("Errore rimozione", "error");
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
      await cartAPI.clear();
      emitCartUpdate();
      setShowCheckoutForm(false);
      navigate("/shop");
    } catch (err) {
      console.error("Errore annullamento ordine:", err);
    }
  };

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
            Carrello ({cart.reduce((sum, item) => sum + item.quantity, 0)})
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
                  {products.map((p) => (
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
                        if (exists) {
                          updated = wishlist.filter(w => w.id !== product.id);
                        } else {
                          updated = [...wishlist, product];
                        }
                        localStorage.setItem("wishlist", JSON.stringify(updated));
                        window.dispatchEvent(new Event("wishlistUpdate"));
                      }}
                    />
                  ))}
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
