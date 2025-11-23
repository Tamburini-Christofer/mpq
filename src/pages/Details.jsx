import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI, cartAPI, emitCartUpdate } from "../services/api";
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

  const [quantity, setQuantity] = useState(1);
  const [animClass, setAnimClass] = useState("");
  const [notification, setNotification] = useState(null);
  const relatedRef = useRef(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getBySlug(slug);
        setProduct(data);
        const allProducts = await productsAPI.getAll();
        setProductsData(allProducts);
      } catch (error) {
        console.error("Errore caricamento prodotto:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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
    try {
      await cartAPI.add(product.id, quantity);
      emitCartUpdate();
      showNotification(`"${product.name}" aggiunto al carrello!`);
    } catch (error) {
      console.error("Errore aggiunta al carrello:", error);
      showNotification("Errore nell'aggiunta al carrello", "error");
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
    return selected.map((prod) => ({
      ...prod,
      originalIndex: productsData.findIndex((p) => p.id === prod.id),
      hasDiscount:
        prod.discount && typeof prod.discount === "number" && prod.discount > 0,
      finalPrice:
        prod.discount && typeof prod.discount === "number" && prod.discount > 0
          ? parseFloat(prod.price) * (1 - prod.discount / 100)
          : parseFloat(prod.price),
    }));
  }, [product, productsData]);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const cardWidth = window.innerWidth < 768 ? 200 : 270;
      const cardsToScroll = window.innerWidth < 768 ? 1 : 4;
      const scrollAmount = cardWidth * cardsToScroll;

      ref.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

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

  const handleAddToCartFromCarousel = async (prod) => {
    try {
      await cartAPI.add(prod.id, 1);
      emitCartUpdate();
      showNotification(`"${prod.name}" aggiunto al carrello!`);
    } catch (error) {
      console.error("Errore aggiunta correlato:", error);
      showNotification("Errore nell'aggiunta al carrello", "error");
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
  const hasDiscount =
    product.discount && typeof product.discount === "number" && product.discount > 0;
  const finalPrice = hasDiscount ? price * (1 - product.discount / 100) : price;

  return (
    <>
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

      <button className="back-to-home-btn" onClick={() => navigate("/")}>
        ← Torna alla Home
      </button>

      <div className="product-page">
        <div className="product-gallery">
          <div className="product-main-image">
            <img src={product.image} alt={product.name} />
          </div>
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
              {hasDiscount ? `-${product.discount}% OFFERTA` : "Featured Quest"}
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
              <h2 className="section-title">Prodotti correlati</h2>

              <button
                className="scroll-btn scroll-left"
                onClick={() => scrollCarousel(relatedRef, -1)}
              >
                &lt;
              </button>

              <div
                ref={relatedRef}
                className="cards-list related-cards-list"
                onTouchStart={(e) => handleTouchStart(e, relatedRef)}
                onTouchMove={(e) => handleTouchMove(e, relatedRef)}
                onTouchEnd={() => handleTouchEnd(relatedRef)}
              >
                {relatedProducts.map((prod, index) => (
                  <ProductCard
                    key={index}
                    product={prod}
                    badge="related"
                    variant="carousel"
                    onViewDetails={(slug) => handleViewDetails(slug)}
                    onAddToCart={() => handleAddToCartFromCarousel(prod)}
                  />
                ))}
              </div>

              <button
                className="scroll-btn scroll-right"
                onClick={() => scrollCarousel(relatedRef, 1)}
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
