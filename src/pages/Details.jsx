import "../styles/pages/Details.css"
//todo useParams: hook per estrarre parametri dinamici dalla URL (es: /details/:slug)
//todo useNavigate: hook per navigazione programmatica
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect, useMemo, useRef } from "react"
//todo Importiamo il database dei prodotti
import productsData from "../JSON/products.json"
//todo Importiamo ProductCard componente unificato per le card prodotto
import ProductCard from "../components/common/ProductCard"

//todo Funzione per generare slug SEO-friendly dal nome prodotto (deve essere identica a ProductCard)
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
    .replace(/-+/g, "-")
}



function Details() {
  //todo Estraiamo lo slug dalla URL (es: /details/il-padrino => slug = "il-padrino")
  const { slug } = useParams()
  const navigate = useNavigate()
  //todo Cerchiamo il prodotto confrontando lo slug generato dal nome con quello dell'URL
  const product = productsData.find((p) => generateSlug(p.name) === slug)

  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState(null)

  // ref per carosello correlati
  const relatedRef = useRef(null)

  //todo Scroll istantaneo all'inizio della pagina quando si carica
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  //todo Funzione per aggiungere il prodotto al carrello dalla pagina Details
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    //todo Cerchiamo il prodotto nel carrello confrontando per nome (non per id)
    const existingItem = cart.find((item) => item.name === product.name)

    if (existingItem) {
      //todo Se esiste già, aggiungiamo la quantità selezionata
      existingItem.quantity += quantity
      showNotification(`Quantità di "${product.name}" aumentata nel carrello!`)
    } else {
      //todo Se è nuovo, aggiungiamo l'intero oggetto prodotto con la quantità
      cart.push({ ...product, quantity })
      showNotification(`"${product.name}" aggiunto al carrello!`)
    }

    localStorage.setItem("cart", JSON.stringify(cart))

    //todo Trigger storage event per sincronizzare con Shop e altre pagine aperte
    window.dispatchEvent(new Event("storage"))
  }

  if (!product) {
    return (
      <div className="product-page">
        <h1>Prodotto non trovato</h1>
      </div>
    )
  }

  /* Prove per richiamare dei correlati 
     Qui usiamo prodotti "correlati" semplicemente come:
     - tutti gli altri prodotti tranne quello attuale
     - max 12
     - aggiungiamo originalIndex come in HomePage per compatibilità con ProductCard
  */
const relatedProducts = useMemo(() => {
  if (!product || typeof product.category_id === "undefined") {
    console.warn("⚠️ Nessun category_id trovato per il prodotto:", product)
    return []
  }

  // 1) filtra solo prodotti della stessa categoria, escluso il prodotto corrente
  const sameCategory = productsData.filter(
    (p) => p.category_id === product.category_id && p.name !== product.name
  )

  // 2) mescola in modo random (Fisher-Yates)
  const shuffled = [...sameCategory]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 3) prendi solo 6 prodotti randomici
  const selected = shuffled.slice(0, 6)

  // 4) aggiungi originalIndex per compatibilità
  const withIndex = selected.map((prod) => ({
    ...prod,
    originalIndex: productsData.findIndex((p) => p.name === prod.name),
  }))

  console.log(
    `🎯 PRODOTTI CORRELATI RANDOM (category_id = ${product.category_id}):`,
    withIndex
  )

  return withIndex
}, [product])

  // ---- FUNZIONI CAROSELLO (copiate/adattate da HomePage) ----

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const cardWidth = window.innerWidth < 768 ? 200 : 270
      const cardsToScroll = window.innerWidth < 768 ? 1 : 4
      const scrollAmount = cardWidth * cardsToScroll

      ref.current.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleTouchStart = (e, ref) => {
    if (ref.current) {
      ref.current.touchStartX = e.touches[0].clientX
      ref.current.scrollStartX = ref.current.scrollLeft
    }
  }

  const handleTouchMove = (e, ref) => {
    if (!ref.current || !ref.current.touchStartX) return

    const touch = e.touches[0]
    const diff = ref.current.touchStartX - touch.clientX
    ref.current.scrollLeft = ref.current.scrollStartX + diff
  }

  const handleTouchEnd = (ref) => {
    if (ref.current) {
      ref.current.touchStartX = null
      ref.current.scrollStartX = null
    }
  }

  // ProductCard → onViewDetails(slug)
  const handleViewDetails = (productSlug) => {
    navigate(`/details/${productSlug}`)
  }

  // Aggiunta al carrello dalle card del carosello correlati
  const handleAddToCartFromCarousel = (prod) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || []
    const existingItem = cart.find((item) => item.name === prod.name)

    if (existingItem) {
      existingItem.quantity += 1
      showNotification(`Quantità di "${prod.name}" aumentata nel carrello!`)
    } else {
      cart.push({ ...prod, quantity: 1 })
      showNotification(`"${prod.name}" aggiunto al carrello!`)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    window.dispatchEvent(new Event("storage"))
  }



  return (
    <>
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === "success" ? "✓" : "ℹ"}
            </span>
            <span className="notification-message">
              {notification.message}
            </span>
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

      {/* wrapper principale della pagina prodotto */}
      <div className="product-page">
        {/* Colonna immagini */}
        <div className="product-gallery">
          {/* immagine principale */}
          <div className="product-main-image">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        {/* Colonna info prodotto */}
        <div className="product-info">
          <div>
            <div className="product-category">QUEST • ADVENTURE</div>

            <h1 className="product-title">{product.name}</h1>

            <p className="product-subtitle">
              Avventura epica e contenuti esclusivi.
            </p>
          </div>

          <div>
            <div className="product-price-row">
              <span className="product-price">
                {product.price.toFixed(2)}€
              </span>
              <span className="product-old-price">
                {(product.price * 1.25).toFixed(2)}€
              </span>
            </div>

            <div className="product-badge-wrapper">
              <span className="product-badge">Featured Quest</span>
            </div>
          </div>

          <p className="product-short-desc">{product.description}</p>

          {/* Opzioni */}
          <div className="product-options">
            <div>
              <div className="option-group-label">Formato</div>

              <div className="size-options">
                <button className="size-pill selected">Digitale</button>
              </div>
            </div>

            <div>
              <div className="option-group-label">Lingua</div>

              <div className="size-options">
                <button className="size-pill selected">IT</button>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="product-actions">
            <div className="product-quantity-row">
              <span className="qty-label">Quantità</span>

              <input
                type="number"
                className="qty-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <button className="add-to-cart-btn" onClick={addToCart}>
              <span>🪙 Aggiungi al carrello</span>
            </button>

            <div className="stock-status">
              Disponibile • Consegna digitale immediata
            </div>

            <div className="extra-info">
              Contenuti esclusivi sbloccabili • Aggiornamenti futuri inclusi
            </div>
          </div>

          {/* Tabs */}
          <div className="product-tabs">
            <div className="tab-buttons">
              <button className="tab-btn">Descrizione</button>
              <button className="tab-btn active">Cosa è incluso</button>
            </div>

            <div className="tab-content">
              <p>
                📜 Sarai chiamato a…
                <br />
                Percorrere sentieri misteriosi come se stessi camminando lungo
                i confini di Bosco Atro.
                <br />
                Raccogliere ingredienti “elfici” o preparare piccoli
                manufatti...
                {/* qui puoi tenere il tuo testo completo */}
              </p>

              <ul className="specs-list">
                <li>
                  <span className="spec-label">Durata:</span> 20 quest
                </li>
                <li>
                  <span className="spec-label">File inclusi:</span> pdf
                </li>
                <li>
                  <span className="spec-label">Bonus:</span> 1 quest finale
                  extra
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CAROSELLO PRODOTTI CORRELATI */}
      {relatedProducts.length > 0 && (
        <section className="quests-section related-section-wrapper d-flex flex-column">
          <h2 className="section-title">Prodotti correlati</h2>

          {/* freccia sinistra */}
          <button
            className="scroll-btn scroll-left"
            onClick={() => scrollCarousel(relatedRef, -1)}
          >
            &lt;
          </button>

          {/* contenitore carosello con swipe touch */}
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
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCartFromCarousel}
              />
            ))}
          </div>

          {/* freccia destra */}
          <button
            className="scroll-btn scroll-right"
            onClick={() => scrollCarousel(relatedRef, 1)}
          >
            &gt;
          </button>
        </section>
      )}
    </>
  )
}

export default Details