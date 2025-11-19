import './Details.css';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import CardExp from "../components/CardExp";

function Details() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descrizione');

  const showNotification = (msg) => alert(msg);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
      existingItem.quantity += quantity;
      showNotification(`Quantità di "${product.name}" aumentata nel carrello!`);
    } else {
      cart.push({ ...product, quantity });
      showNotification(`"${product.name}" aggiunto al carrello!`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  }

  useEffect(() => {
    if (!slug) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/products`);
        const foundProduct = Array.isArray(response.data)
          ? response.data.find(item => item.slug === slug)
          : response.data;

        setProduct(foundProduct || null);
      } catch (err) {
        console.error("Errore caricamento prodotto:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) return <p>Caricamento in corso...</p>;
  if (!product) return <p>Prodotto non trovato.</p>;

  return (
    <div className="product-page">
      <button onClick={() => navigate("/")}>← Torna alla Home</button>
      <div className='container'>
        <CardExp slug={slug} />
        <div className="container-info">
          <div className='title-info'>
          <span className='product-title'>{product.name}</span>
          <span className='product-category'>{product.category_name} </span>
          </div>
          <div className="product-price-row">
            <span className="product-price">{product.price}€</span>
            <span className="product-old-price">{(product.price * 1.25).toFixed(2)}€</span>
          </div>

          <div className="product-badge-wrapper">
            <span className="product-badge">Featured Quest</span>
          </div>

          <p className="product-short-desc">{product.description}</p>

          <div className="product-options">
            <div>
              <div className="option-group-label">Formato</div>
              <div className="size-options">
                <button className="size-pill selected">Digitale</button>
              </div>
            </div>
          </div>
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
              🪙 Aggiungi al carrello
            </button>
            <div className="stock-status">
              Disponibile • Consegna digitale immediata
            </div>

            <div className="extra-info">
              Contenuti esclusivi sbloccabili • Aggiornamenti futuri inclusi
            </div>
          </div>
          <div className="product-tabs">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'descrizione' ? 'active' : ''}`}
                onClick={() => setActiveTab('descrizione')}
              >
                Descrizione
              </button>
              <button
                className={`tab-btn ${activeTab === 'incluso' ? 'active' : ''}`}
                onClick={() => setActiveTab('incluso')}
              >
                Cosa è incluso
              </button>
            </div>


            <div className="tab-content">
              {activeTab === 'descrizione' && (
                <p>
                  📜 Sarai chiamato a…
                  Percorrere sentieri misteriosi come se stessi camminando lungo i confini di Bosco Atro.
                  Raccogliere ingredienti “elfici” o preparare piccoli manufatti, proprio come abili artigiani di Gran Burrone.
                  Ritrovare oggetti perduti, decifrare rune e superare enigmi nascosti dal potere degli antichi.
                  Collaborare con la tua Compagnia per portare a termine missioni che richiedono intuito, agilità, leadership e spirito di sacrificio.
                  Compiere gesti di gentilezza, coraggio o generosità, rispecchiando le virtù degli eroi della Terra di Mezzo.
                  🔥 Ogni Quest è un capitolo della tua personale epopea: ti immergerai in storie che parlano di amicizia, perseveranza e meraviglia.
                </p>
              )}
              {activeTab === 'incluso' && (
                <ul className="specs-list">
                  <li><span className="spec-label">Durata:</span> 20 quest</li>
                  <li><span className="spec-label">File inclusi:</span> pdf</li>
                  <li><span className="spec-label">Bonus:</span> 1 quest finale extra</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="back-to-home-btn" onClick={() => navigate('/')}>
        ← Torna alla Home
      </button>

{/*     // TODO: wrapper principale della pagina prodotto
 */}<div className="product-page">

  {/* Colonna immagini */}
{/*   // TODO: sezione che contiene tutte le immagini del prodotto
 */}  <div className="product-gallery">

{/*     // TODO: immagine principale grande del prodotto
 */}    <div className="product-main-image">
{/*       // TODO: immagine animata (GIF) visualizzata come anteprima principale
 */}      <img
        src={product.image}
        alt={product.name}
      />
    </div>

  </div>

  {/* Colonna info prodotto */}
{/*   // TODO: sezione di destra con tutte le informazioni testuali
 */}  <div className="product-info">

{/*     // TODO: wrapper per categoria, titolo e sottotitolo
 */}    <div>
{/*       // TODO: categoria del prodotto, usata come label decorativa
 */}      <div className="product-category">QUEST • ADVENTURE</div>

{/*       // TODO: titolo principale del prodotto
 */}      <h1 className="product-title">{product.name}</h1>

{/*       // TODO: breve descrizione subito sotto il titolo
 */}      <p className="product-subtitle">
        Avventura epica e contenuti esclusivi.
      </p>
    </div>

    {/* Rating (commentato) */}
    {/* 
    // TODO: sezione delle stelle e recensioni (momentaneamente disattivata)
    <div className="product-rating">
      <span className="stars">★★★★☆</span>
      <span>4,8 / 5 • 328 recensioni</span>
    </div>
    */}

{/*     TODO: wrapper del prezzo e del badge
 */}    <div>

{/*       // TODO: sezione prezzo con prezzo nuovo + prezzo vecchio sbarrato
 */}      <div className="product-price-row">
        {product.discount && product.discount > 0 ? (
          <>
            <span className="product-price">{(product.price * (1 - product.discount / 100)).toFixed(2)}€</span>
            <span className="product-old-price">{product.price.toFixed(2)}€</span>
            <span className="discount-percentage">-{product.discount}%</span>
          </>
        ) : (
          <span className="product-price">{product.price.toFixed(2)}€</span>
        )}
      </div>

{/*       // TODO: badge visuale che evidenzia la quest come "Featured"
 */}      <div className="product-badge-wrapper">
        {product.discount && product.discount > 0 ? (
          <span className="product-badge promo-badge">In Promozione</span>
        ) : (
          <span className="product-badge">Featured Quest</span>
        )}
      </div>
    </div>
  );
}

export default Details;
