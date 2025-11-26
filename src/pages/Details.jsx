
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI, cartAPI, emitCartUpdate, emitCartAction } from "../services/api";
import { logAction, error as logError } from '../utils/logger';
import ACTIONS from '../utils/actionTypes';
import { toast } from 'react-hot-toast';
import ProductCard from "../components/common/ProductCard";
import "../styles/pages/Details.css";


const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

function Details() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showRelatedNav, setShowRelatedNav] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [animClass, setAnimClass] = useState("");
  const relatedRef = useRef(null);

  const carouselPaused = useRef(false);

  const loadCart = async () => {
    try {
      const cartData = await cartAPI.get();
      setCart(cartData);
    } catch (error) {
      logError("Errore caricamento carretto", error);
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getBySlug(slug);
        setProduct(data);
        const allProducts = await productsAPI.getAllUnpaginated();
        setProductsData(allProducts);
      } catch (error) {
        logError("Errore caricamento prodotto", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    loadCart();
  }, [slug]);

  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail && e.detail.cart) setCart(e.detail.cart);
      else loadCart();
    };
    window.addEventListener('cartUpdate', handler);
    return () => window.removeEventListener('cartUpdate', handler);
  }, []);

  // related carousel nav visibility is handled after relatedProducts is computed

  // use react-hot-toast for notifications

  const increaseQty = () => {
    setAnimClass("increment");
    setTimeout(() => {
      setAnimClass("");
    }, 200);
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    setQuantity((q) => {
      if (q <= 1) {
        setAnimClass("shake");
        setTimeout(() => {
          setAnimClass("");
        }, 300);
        return 1;
      }
      setAnimClass("decrement");
      setTimeout(() => {
        setAnimClass("");
      }, 200);
      return q - 1;
    });
  };

  const addToCart = async () => {
    if (!product) return;
    if (!quantity || quantity <= 0) return; // nothing to add
    try {
      await cartAPI.add(product.id, quantity);
      emitCartUpdate();
      // Use centralized emit so Layout's Toaster shows the notification (same logic as Home)
      emitCartAction('add', { id: product.id, name: product.name });
    } catch (error) {
      logError("Errore aggiunta al carretto", error);
      toast.error("Errore nell'aggiunta al carretto");
    }
  };

  // Prodotti correlati con sconto e originalIndex
  const relatedProducts = useMemo(() => {
    if (!product || typeof product.category_id === "undefined") return [];
    const sameCategory = productsData.filter(
      (p) => p.category_id === product.category_id && p.id !== product.id
    );
    const shuffled = [...sameCategory];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, 6);
    return selected.map((prod) => {
      const disc = Number(prod.discount) || 0;
      const price = parseFloat(prod.price) || 0;
      return {
        ...prod,
        originalIndex: productsData.findIndex((p) => p.id === prod.id),
        hasDiscount: disc > 0,
        finalPrice: disc > 0 ? price * (1 - disc / 100) : price,
      };
    });
  }, [product, productsData]);


  const scrollCarousel = (ref, direction) => {
    if (!ref.current) return;
    const container = ref.current;
    const first = container.querySelector('.product-card');
    const gap = parseInt(getComputedStyle(container).gap) || 12;
    const cardWidth = first ? first.offsetWidth : Math.floor(container.clientWidth / 2);
    const scrollAmount = cardWidth + gap;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const updateRelatedNavVisibility = () => {
    const el = relatedRef.current;
    if (!el) return setShowRelatedNav(false);
    const isOverflowing = el.scrollWidth > el.clientWidth + 2;
    setShowRelatedNav(isOverflowing);
  };

  // monitor related carousel overflow so we only show nav buttons when needed
  useEffect(() => {
    updateRelatedNavVisibility();
    const handleResize = () => updateRelatedNavVisibility();
    window.addEventListener('resize', handleResize);
    const el = relatedRef.current;
    if (el) el.addEventListener('scroll', updateRelatedNavVisibility);

    let mo;
    if (el && window.MutationObserver) {
      mo = new MutationObserver(updateRelatedNavVisibility);
      mo.observe(el, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (el) el.removeEventListener('scroll', updateRelatedNavVisibility);
      if (mo) mo.disconnect();
    };
  }, [relatedProducts]);

  const handleTouchStart = (e, ref) => {
    if (ref.current) {
      ref.current.touchStartX = e.touches[0].clientX;
      ref.current.scrollStartX = ref.current.scrollLeft;
    }
  };

  const handleTouchMove = (e, ref) => {
    if (!ref.current || !ref.current.touchStartX) return;
    const touch = e.touches[0];
    const diff = ref.current.touchStartX - touch.clientX;
    ref.current.scrollLeft = ref.current.scrollStartX + diff;
  };

  const handleTouchEnd = (ref) => {
    if (ref.current) {
      ref.current.touchStartX = null;
      ref.current.scrollStartX = null;
    }
  };

  // Auto-scroll: scorre di una card ogni 3 secondi; pausa quando l'utente passa il mouse
  useEffect(() => {
    const container = relatedRef.current;
    if (!container || relatedProducts.length === 0) return;

    const getGap = () => parseInt(getComputedStyle(container).gap) || 12;

    const updateScrollPadding = () => {
      // previously we set inline scroll/padding to center items; removed to avoid
      // excessive inline styles. Keep notes here in case we reintroduce a
      // programmatic centering approach in the future.
    };

    updateScrollPadding();
    const onResize = () => updateScrollPadding();
    window.addEventListener('resize', onResize);

    const tick = () => {
      if (carouselPaused.current) return;
      const first = container.querySelector('.product-card');
      if (!first) return;
      const gap = getGap();
      const cardWidth = first.offsetWidth;
      const scrollAmount = cardWidth + gap;
      // se siamo alla fine -> torna all'inizio
      if (Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    const interval = setInterval(tick, 3000);

    const enter = () => (carouselPaused.current = true);
    const leave = () => (carouselPaused.current = false);
    container.addEventListener('pointerenter', enter);
    container.addEventListener('pointerleave', leave);

    return () => {
      clearInterval(interval);
      container.removeEventListener('pointerenter', enter);
      container.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', onResize);
    };
  }, [relatedProducts]);

  const handleAddToCartFromCarousel = async (prod) => {
    try {
      await cartAPI.add(prod.id, 1);
      emitCartUpdate();
      // Informazioni emesse con origin in modo che Layout non mostri il toast duplicato
      // Centralized emit (same as HomePage): let Layout handle the toast
      emitCartAction('add', { id: prod.id, name: prod.name });
      } catch (error) {
      logError("Errore aggiunta correlato", error);
      toast.error("Errore nell'aggiunta al carretto");
    }
  };

  const handleIncrease = async (productId) => {
    try {
      await cartAPI.increase(productId);
      emitCartUpdate();
      const prod = productsData.find(p => p.id === productId) || cart.find(i => i.id === productId);
      const name = prod?.name || 'Prodotto';
      emitCartAction('add', { id: productId, name });
      } catch (error) {
      logError("Errore nell'aumentare la quantità", error);
      toast.error("Errore nell'aggiornamento del carretto");
    }
  };

  const handleDecrease = async (productId) => {
    try {
      const item = cart.find(i => i.id === productId);
      const prod = productsData.find(p => p.id === productId) || item;
      const name = prod?.name || 'Prodotto';
      if (item && item.quantity > 1) {
        await cartAPI.decrease(productId);
        // Central emit: let Layout show global toast
        emitCartAction('remove', { id: productId, name });
      } else {
        await cartAPI.remove(productId);
        emitCartAction('remove', { id: productId, name });
      }
      emitCartUpdate();
    } catch (error) {
      logError("Errore nel diminuire la quantità", error);
      toast.error("Errore nell'aggiornamento del carretto");
    }
  };

  const handleViewDetails = (prodSlug) => {
    navigate(`/details/${prodSlug}`);
  };

  if (!product) {
    return (
      <div className="product-page">
        <h1>Prodotto non trovato</h1>
      </div>
    );
  }
  const price = parseFloat(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;


  return (
    <>
      

      <button className="back-to-home-btn" onClick={() => navigate("/")}>
        ← Torna alla Home
      </button>

      <div className="product-page">
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={product.image} alt={product.name} loading="lazy" className="img-responsive" decoding="async" />
          </div>
          {relatedProducts.length > 0 && (
            <section className="quests-section related-section-wrapper carousel-under-image">
              <h2 className="section-title">Prodotti correlati</h2>
              <div className="related-carousel-row">
                <button
                  className="scroll-btn scroll-left"
                  onClick={() => scrollCarousel(relatedRef, -1)}
                  aria-label="Scorri a sinistra"
                >
                  &lt;
                </button>

                <div
                  ref={relatedRef}
                  className="cards-list related-cards-list carousel-list"
                  onTouchStart={(e) => handleTouchStart(e, relatedRef)}
                  onTouchMove={(e) => handleTouchMove(e, relatedRef)}
                  onTouchEnd={() => handleTouchEnd(relatedRef)}
                >
                    {relatedProducts.map((prod, index) => (
                    <ProductCard
                      key={index}
                      product={prod}
                      badge="related"
                      variant="carousel-compact"
                      cart={cart}
                      onViewDetails={(slug) => handleViewDetails(slug)}
                      onAddToCart={() => handleAddToCartFromCarousel(prod)}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                    />
                  ))}
                </div>

                <button
                  className="scroll-btn scroll-right"
                  onClick={() => scrollCarousel(relatedRef, 1)}
                  aria-label="Scorri a destra"
                >
                  &gt;
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-subtitle">Avventura epica e contenuti esclusivi.</p>

          <div className="product-price-row">
            {hasDiscount ? (
              <>
                <span className="product-price">{finalPrice.toFixed(2)}€</span>
                <span className="product-old-price" data-strikethrough="true">
                  {price.toFixed(2)}€
                </span>
              </>
            ) : (
              <span className="product-price">{price.toFixed(2)}€</span>
            )}
          </div>

          <div className="product-badge-wrapper">
            <span
              className="product-badge"
              data-discount={hasDiscount ? "true" : "false"}
            >
              {hasDiscount ? `-${discount}% OFFERTA` : "Featured Quest"}
            </span>
          </div>

          <p className="product-short-desc">{product.description}</p>
          <div className="product-actions">
            <div className="product-quantity-row">
              <span className="qty-label">Quantità</span>

              <div className="qty-wrapper">
                <button className="qty-btn" onClick={decreaseQty}>
                  −
                </button>

                <div className={`qty-display ${animClass}`}>
                  <span>{quantity}</span>
                </div>

                <button className="qty-btn" onClick={increaseQty}>
                  +
                </button>
              </div>
            </div>

            <button className="add-to-cart-btn" onClick={addToCart}>
              🪙 Aggiungi al carretto
            </button>

            <div className="stock-status">
              Disponibile • Consegna digitale immediata
            </div>
            <div className="extra-info">
              Contenuti esclusivi sbloccabili • Aggiornamenti futuri inclusi
            </div>
          </div>
          {relatedProducts.length > 0 && (
            <section className="quests-section related-section-wrapper">
              <button
                className="scroll-btn scroll-left"
                type="button"
                aria-label="Scorri a sinistra"
                onClick={() => scrollCarousel(relatedRef, -1)}
                style={{ display: showRelatedNav ? undefined : 'none' }}
              >
                &lt;
              </button>
              <button
                className="scroll-btn scroll-right"
                type="button"
                aria-label="Scorri a destra"
                onClick={() => scrollCarousel(relatedRef, 1)}
                style={{ display: showRelatedNav ? undefined : 'none' }}
              >
                &gt;
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
export default Details;

